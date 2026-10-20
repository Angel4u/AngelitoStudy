import { useEffect, useRef, useState } from "react";

const POSTER_SRC = "/assets/solace-ambient-poster.webp";

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function drawBreathingVessel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
) {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.5;
  const minDim = Math.min(w, h);
  const baseR = minDim * 0.34;

  const phase = progress * Math.PI * 2;
  const breath = Math.sin(phase);
  const breathCos = Math.cos(phase);
  const expansion = 1 + 0.14 * Math.sin(progress * Math.PI);

  // 1. Ambient volumetric haze & upper-left cool key light
  const hazeGrad = ctx.createRadialGradient(
    cx - baseR * 0.35,
    cy - baseR * 0.32,
    baseR * 0.05,
    cx,
    cy,
    baseR * 1.65,
  );
  hazeGrad.addColorStop(0, "rgba(88, 196, 246, 0.26)");
  hazeGrad.addColorStop(0.38, "rgba(56, 118, 224, 0.18)");
  hazeGrad.addColorStop(0.72, "rgba(24, 44, 108, 0.08)");
  hazeGrad.addColorStop(1, "rgba(10, 10, 10, 0)");
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Luminous core bloom
  const coreR = baseR * (0.64 + 0.1 * breath) * expansion;
  const coreGrad = ctx.createRadialGradient(
    cx,
    cy,
    coreR * 0.06,
    cx,
    cy,
    coreR * 1.4,
  );
  coreGrad.addColorStop(0, "rgba(155, 228, 255, 0.42)");
  coreGrad.addColorStop(0.32, "rgba(78, 152, 245, 0.30)");
  coreGrad.addColorStop(0.68, "rgba(32, 62, 145, 0.12)");
  coreGrad.addColorStop(1, "rgba(10, 10, 10, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // 3. Sparse thread-like filaments expanding and contracting with scroll
  const filamentCount = 48;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(1, minDim * 0.0011);
  for (let i = 0; i < filamentCount; i++) {
    const angle = (i / filamentCount) * Math.PI * 2 + progress * 0.85;
    const wave = Math.sin(phase + i * 0.55);
    const rInner = baseR * (0.2 + 0.04 * wave) * expansion;
    const rOuter =
      baseR * (0.92 + 0.11 * Math.sin(phase - i * 0.35)) * expansion;
    const ctrlAngle = angle + 0.14 * breathCos;
    const rMid = (rInner + rOuter) * 0.54;

    const x0 = Math.cos(angle) * rInner;
    const y0 = Math.sin(angle) * rInner;
    const xc = Math.cos(ctrlAngle) * rMid;
    const yc = Math.sin(ctrlAngle) * rMid;
    const x1 = Math.cos(angle) * rOuter;
    const y1 = Math.sin(angle) * rOuter;

    const alpha = 0.14 + 0.14 * ((i % 4) / 3);
    ctx.strokeStyle = `rgba(185, 232, 255, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(xc, yc, x1, y1);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Concentric frosted glass aperture rings
  const ringCount = 10;
  for (let i = 0; i < ringCount; i++) {
    const t = i / (ringCount - 1);
    const localPhase = phase - t * 1.8;
    const ringScale = (1 + 0.075 * Math.sin(localPhase)) * expansion;
    const r = baseR * (0.22 + t * 0.82) * ringScale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.5 + progress * (i % 2 === 0 ? 0.65 : -0.45));

    const bodyAlpha = 0.16 + (1 - t) * 0.24;
    ctx.strokeStyle = `rgba(125, 210, 255, ${bodyAlpha.toFixed(3)})`;
    ctx.lineWidth = Math.max(1.5, (3.2 - t * 1.8) * (minDim / 900));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    const rimAlpha = 0.28 + Math.sin(t * Math.PI) * 0.42;
    ctx.strokeStyle = `rgba(245, 252, 255, ${rimAlpha.toFixed(3)})`;
    ctx.lineWidth = Math.max(1, 1.35 * (minDim / 900));
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.995, -Math.PI * 0.92, Math.PI * 0.32);
    ctx.stroke();

    if (i % 3 === 1) {
      ctx.strokeStyle = "rgba(245, 218, 145, 0.22)";
      ctx.lineWidth = Math.max(0.9, minDim / 1000);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.004, Math.PI * 0.2, Math.PI * 0.85);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 5. Inner tactile aperture shadow & glowing pupil ring
  const innerHoleR = baseR * (0.21 + 0.03 * breath) * expansion;
  const innerShadow = ctx.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    innerHoleR * 1.15,
  );
  innerShadow.addColorStop(0, "rgba(10, 10, 10, 0.92)");
  innerShadow.addColorStop(0.68, "rgba(14, 24, 48, 0.55)");
  innerShadow.addColorStop(1, "rgba(95, 195, 255, 0)");
  ctx.fillStyle = innerShadow;
  ctx.beginPath();
  ctx.arc(cx, cy, innerHoleR * 1.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(220, 245, 255, 0.65)";
  ctx.lineWidth = Math.max(1.2, 1.8 * (minDim / 900));
  ctx.beginPath();
  ctx.arc(cx, cy, innerHoleR, 0, Math.PI * 2);
  ctx.stroke();
}

export function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastProgressRef = useRef<number>(-1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Cache scrollable height so scroll events never force synchronous layout reads
    let maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );

    const getScrollProgress = () => {
      if (maxScroll <= 0) return 0;
      return clamp(window.scrollY / maxScroll, 0, 1);
    };

    let targetProgress = getScrollProgress();
    let smoothedProgress = reducedMotion ? 0.35 : targetProgress;
    let rafId = 0;

    const renderFrame = (force: boolean) => {
      const cw = canvas.width;
      const ch = canvas.height;
      if (cw <= 0 || ch <= 0) return;

      const quantized = Math.round(smoothedProgress * 240) / 240;
      if (!force && quantized === lastProgressRef.current) return;
      lastProgressRef.current = quantized;

      drawBreathingVessel(ctx, cw, ch, quantized);
    };

    const tick = () => {
      rafId = 0;
      if (reducedMotion) {
        smoothedProgress = 0.35;
        renderFrame(false);
        return;
      }

      const delta = targetProgress - smoothedProgress;
      if (Math.abs(delta) > 0.0002) {
        smoothedProgress += delta * 0.1;
        renderFrame(false);
        // Only schedule another frame while interpolation is still settling
        rafId = window.requestAnimationFrame(tick);
      } else if (smoothedProgress !== targetProgress) {
        smoothedProgress = targetProgress;
        renderFrame(false);
      }
    };

    const scheduleTick = () => {
      if (!reducedMotion && rafId === 0) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleResize = () => {
      maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const nextH = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      targetProgress = getScrollProgress();
      renderFrame(true);
      scheduleTick();
    };

    const handleScroll = () => {
      targetProgress = getScrollProgress();
      scheduleTick();
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        maxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        targetProgress = getScrollProgress();
        scheduleTick();
      });
      ro.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      if (ro) ro.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink"
    >
      <img
        src={POSTER_SRC}
        alt=""
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* 20% black readability overlay */}
      <div className="absolute inset-0 bg-ink/20" />
    </div>
  );
}
