import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/assets/solace-ambient-loop.mp4";
const POSTER_SRC = "/assets/solace-ambient-poster.webp";

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  fw: number,
  fh: number,
  cw: number,
  ch: number,
) {
  if (fw <= 0 || fh <= 0 || cw <= 0 || ch <= 0) return;
  const scale = Math.max(cw / fw, ch / fh);
  const dw = fw * scale;
  const dh = fh * scale;
  const dx = (cw - dw) * 0.5;
  const dy = (ch - dh) * 0.5;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(source, dx, dy, dw, dh);
}

export function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const posterBitmapRef = useRef<ImageBitmap | null>(null);
  const lastDrawnIndexRef = useRef<number>(-1);

  const [framesReady, setFramesReady] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Load poster bitmap for reduced-motion / fallback mid-frame
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = POSTER_SRC;
    img.onload = async () => {
      if (cancelled) return;
      try {
        const bmp = await createImageBitmap(img);
        if (cancelled) {
          bmp.close();
          return;
        }
        posterBitmapRef.current = bmp;
        const canvas = canvasRef.current;
        if (canvas && (reducedMotion || assetFailed || framesRef.current.length === 0)) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            drawCover(ctx, bmp, bmp.width, bmp.height, canvas.width, canvas.height);
          }
        }
      } catch {
        // Fallback image tag still renders when assetFailed or reducedMotion is active
      }
    };
    return () => {
      cancelled = true;
      if (posterBitmapRef.current) {
        posterBitmapRef.current.close();
        posterBitmapRef.current = null;
      }
    };
  }, [reducedMotion, assetFailed]);

  // Pre-extract video frames into ImageBitmap[]
  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    const extracted: ImageBitmap[] = [];

    const closeBitmaps = (list: ImageBitmap[]) => {
      for (const bmp of list) {
        try {
          bmp.close();
        } catch {
          // ignore
        }
      }
      list.length = 0;
    };

    async function extractFrames() {
      try {
        const response = await fetch(VIDEO_SRC);
        if (!response.ok) throw new Error("Video fetch failed");
        const blob = await response.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        video.src = objectUrl;

        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error("Video metadata error"));
          };
          const cleanup = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("error", onError);
          };
          video.addEventListener("loadedmetadata", onLoaded, { once: true });
          video.addEventListener("error", onError, { once: true });
        });

        if (cancelled) return;

        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 2.5;
        const vw = video.videoWidth || 1920;
        const vh = video.videoHeight || 1080;
        const scale = Math.min(1, 1280 / vw);
        const targetW = Math.max(1, Math.round(vw * scale));
        const targetH = Math.max(1, Math.round(vh * scale));
        const frameCount = clamp(Math.round(duration * 24), 30, 120);
        const usableDuration = Math.max(0.05, duration - 0.05);

        const scratch = document.createElement("canvas");
        scratch.width = targetW;
        scratch.height = targetH;
        const sctx = scratch.getContext("2d");

        for (let i = 0; i < frameCount; i++) {
          if (cancelled) {
            closeBitmaps(extracted);
            return;
          }
          const t = frameCount > 1 ? (i / (frameCount - 1)) * usableDuration : 0;

          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              resolve();
            };
            video.addEventListener("seeked", onSeeked, { once: true });
            video.currentTime = t;
          });

          if (cancelled) {
            closeBitmaps(extracted);
            return;
          }

          let bmp: ImageBitmap;
          if (sctx) {
            sctx.drawImage(video, 0, 0, targetW, targetH);
            bmp = await createImageBitmap(scratch);
          } else {
            bmp = await createImageBitmap(video);
          }
          extracted.push(bmp);
        }

        if (cancelled) {
          closeBitmaps(extracted);
          return;
        }

        framesRef.current = extracted;
        lastDrawnIndexRef.current = -1;
        setFramesReady(true);
      } catch {
        if (!cancelled) {
          closeBitmaps(extracted);
          setAssetFailed(true);
        }
      }
    }

    extractFrames();

    return () => {
      cancelled = true;
      closeBitmaps(framesRef.current);
      setFramesReady(false);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [reducedMotion]);

  // Resize canvas with DPR capped at 2 & drive RAF scroll loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getScrollProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return 0;
      return clamp(window.scrollY / maxScroll, 0, 1);
    };

    let targetProgress = getScrollProgress();
    let smoothedProgress = targetProgress;
    let rafId = 0;
    let isFallbackSeeking = false;
    let pendingFallbackTime: number | null = null;

    const fallbackVideo = fallbackVideoRef.current;
    const onFallbackSeeked = () => {
      isFallbackSeeking = false;
      if (
        pendingFallbackTime !== null &&
        fallbackVideo &&
        Math.abs(fallbackVideo.currentTime - pendingFallbackTime) > 0.001
      ) {
        const nextTime = pendingFallbackTime;
        pendingFallbackTime = null;
        isFallbackSeeking = true;
        try {
          fallbackVideo.currentTime = nextTime;
        } catch {
          isFallbackSeeking = false;
        }
      }
    };

    if (fallbackVideo) {
      fallbackVideo.addEventListener("seeked", onFallbackSeeked);
    }

    const drawCurrent = (force: boolean) => {
      const cw = canvas.width;
      const ch = canvas.height;

      if (reducedMotion || assetFailed) {
        const poster = posterBitmapRef.current;
        if (poster && (force || lastDrawnIndexRef.current !== -2)) {
          drawCover(ctx, poster, poster.width, poster.height, cw, ch);
          lastDrawnIndexRef.current = -2;
        }
        return;
      }

      const frames = framesRef.current;
      if (frames.length > 0) {
        const idx = clamp(
          Math.round(smoothedProgress * (frames.length - 1)),
          0,
          frames.length - 1,
        );
        if (force || idx !== lastDrawnIndexRef.current) {
          const bmp = frames[idx];
          if (bmp) {
            drawCover(ctx, bmp, bmp.width, bmp.height, cw, ch);
            lastDrawnIndexRef.current = idx;
          }
        }
      } else if (fallbackVideo && fallbackVideo.readyState >= 1) {
        const duration =
          Number.isFinite(fallbackVideo.duration) && fallbackVideo.duration > 0
            ? fallbackVideo.duration
            : 0;
        if (duration > 0) {
          const desiredTime = clamp(smoothedProgress * (duration - 0.05), 0, duration);
          if (Math.abs(fallbackVideo.currentTime - desiredTime) > 0.001) {
            if (!isFallbackSeeking) {
              isFallbackSeeking = true;
              try {
                fallbackVideo.currentTime = desiredTime;
              } catch {
                isFallbackSeeking = false;
              }
            } else {
              pendingFallbackTime = desiredTime;
            }
          }
        }
      } else if (posterBitmapRef.current && force) {
        const poster = posterBitmapRef.current;
        drawCover(ctx, poster, poster.width, poster.height, cw, ch);
      }
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const nextH = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      targetProgress = getScrollProgress();
      drawCurrent(true);
    };

    const handleScroll = () => {
      targetProgress = getScrollProgress();
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    const tick = () => {
      if (reducedMotion) {
        smoothedProgress = 0.5;
        drawCurrent(false);
        return;
      }
      targetProgress = getScrollProgress();
      smoothedProgress += (targetProgress - smoothedProgress) * 0.1;
      if (Math.abs(targetProgress - smoothedProgress) < 0.0001) {
        smoothedProgress = targetProgress;
      }
      drawCurrent(false);
      rafId = window.requestAnimationFrame(tick);
    };

    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      drawCurrent(true);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (fallbackVideo) {
        fallbackVideo.removeEventListener("seeked", onFallbackSeeked);
      }
    };
  }, [reducedMotion, assetFailed, framesReady]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      {(reducedMotion || assetFailed) && (
        <img
          src={POSTER_SRC}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {!reducedMotion && !assetFailed && !framesReady && (
        <video
          ref={fallbackVideoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* 20% black readability overlay */}
      <div className="absolute inset-0 bg-ink/20" />
    </div>
  );
}
