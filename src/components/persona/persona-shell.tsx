import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { catalogQuery } from "@/data/catalog";

export type PersonaScreen = "home" | "malla" | "drive" | "redes";

interface PersonaContextValue {
  screen: PersonaScreen;
  menuIndex: number;
  setMenuIndex: (index: number) => void;
  goToScreen: (target: PersonaScreen) => void;
  wipeAndNavigate: (action: () => void) => void;
  playSelect: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error("usePersona must be used inside PersonaShell");
  }
  return ctx;
}

export function PersonaShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: catalog } = useQuery(catalogQuery());

  const [screen, setScreen] = useState<PersonaScreen>("home");
  const [menuIndex, setMenuIndexState] = useState(0);
  const [wiping, setWiping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clock, setClock] = useState("");
  const [mounted, setMounted] = useState(false);

  const audioUnlockedRef = useRef(false);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const transitioningRef = useRef(false);
  const stripesRef = useRef<HTMLDivElement | null>(null);
  const halftoneRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  const isHomeRoute = location.pathname === "/";
  const activeArtScreen: PersonaScreen = isHomeRoute ? screen : "redes";

  useEffect(() => {
    setMounted(true);
    document.body.classList.add("loaded");
  }, []);

  // Sync URL hash (#malla, #metodo, #redes) if navigated via hash
  useEffect(() => {
    if (!isHomeRoute) return;
    const h = location.hash.replace(/^#/, "");
    if (h === "malla") setScreen("malla");
    else if (h === "metodo" || h === "drive") setScreen("drive");
    else if (h === "redes") setScreen("redes");
  }, [isHomeRoute, location.hash]);

  // Unlock Web Audio on first user gesture
  useEffect(() => {
    const unlock = () => {
      audioUnlockedRef.current = true;
    };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
    };
  }, []);

  const playSelect = useCallback(() => {
    if (!soundEnabled || !audioUnlockedRef.current) return;
    const sfx = sfxRef.current;
    if (!sfx) return;
    try {
      sfx.volume = 0.45;
      sfx.currentTime = 0;
      const p = sfx.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      // Ignore autoplay errors
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    audioUnlockedRef.current = true;
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next && sfxRef.current) {
        try {
          sfxRef.current.volume = 0.45;
          sfxRef.current.currentTime = 0;
          sfxRef.current.play().catch(() => {});
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const wipeAndNavigate = useCallback(
    (action: () => void) => {
      if (transitioningRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      playSelect();
      if (reduced) {
        action();
        return;
      }
      transitioningRef.current = true;
      setWiping(false);
      window.requestAnimationFrame(() => {
        setWiping(true);
        window.setTimeout(() => {
          action();
        }, 320);
        window.setTimeout(() => {
          setWiping(false);
          transitioningRef.current = false;
        }, 720);
      });
    },
    [playSelect],
  );

  const goToScreen = useCallback(
    (target: PersonaScreen) => {
      if (isHomeRoute && target === screen) return;
      wipeAndNavigate(() => {
        setScreen(target);
        if (!isHomeRoute) {
          navigate({ to: "/" });
        }
      });
    },
    [isHomeRoute, navigate, screen, wipeAndNavigate],
  );

  const setMenuIndex = useCallback(
    (next: number) => {
      setMenuIndexState((prev) => {
        const count = 3;
        const wrapped = ((next % count) + count) % count;
        if (wrapped !== prev) playSelect();
        return wrapped;
      });
    },
    [playSelect],
  );

  // Live HUD Clock
  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }) + " · CL",
      );
    };
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Mouse parallax on background stripes & halftone (only on fine-pointer desktop)
  useEffect(() => {
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let rafId = 0;

    const tick = () => {
      rafId = 0;
      const dx = tx - cx;
      const dy = ty - cy;
      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        cx += dx * 0.08;
        cy += dy * 0.08;
        if (stripesRef.current) {
          stripesRef.current.style.transform = `translate3d(${cx * 22}px, ${cy * 14}px, 0)`;
        }
        if (halftoneRef.current) {
          halftoneRef.current.style.transform = `translate3d(${cx * -32}px, ${cy * -20}px, 0)`;
        }
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Custom 30-frame animated Persona sprite-strip cursor (only on fine-pointer desktop)
  useEffect(() => {
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const cur = cursorRef.current;
    if (!cur) return;

    document.body.classList.add("cursor-on");
    let x = -100;
    let y = -100;
    let frame = 0;
    let last = 0;
    let visible = false;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        cur.style.display = "block";
        visible = true;
      }
      const target = e.target as HTMLElement | null;
      const overInteractive = Boolean(
        target?.closest(
          "a,button,input,select,textarea,.p-card,.malla-compact-card,.hud-home-btn,.hud-nav-btn,.menu-item,.back-hint,.contact-chip,#big-name",
        ),
      );
      cur.classList.toggle("link", overInteractive);
    };

    const onLeave = () => {
      cur.style.display = "none";
      visible = false;
    };

    const tick = (ts: number) => {
      if (ts - last >= 50) {
        frame = (frame + 1) % 30;
        last = ts;
        cur.style.backgroundPosition = `${-frame * 48}px 0`;
      }
      cur.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("cursor-on");
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const scheduleText =
    mounted && catalog?.scheduleLabel
      ? `SUBIDA: ${catalog.scheduleLabel}`
      : "ING. CIVIL INFORMÁTICA";

  return (
    <PersonaContext.Provider
      value={{
        screen,
        menuIndex,
        setMenuIndex,
        goToScreen,
        wipeAndNavigate,
        playSelect,
        soundEnabled,
        toggleSound,
      }}
    >
      {/* Background art layers */}
      <div id="bg" aria-hidden="true">
        <div ref={stripesRef} className="bg-layer" id="bg-stripes" />
        <svg
          className="bg-star"
          style={{ left: "6%", top: "8%", width: "26vmax", height: "26vmax" }}
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,0 60,35 98,35 68,57 78,94 50,72 22,94 32,57 2,35 40,35"
            fill="#000"
          />
        </svg>
        <svg
          className="bg-star s2"
          style={{ right: "4%", bottom: "6%", width: "34vmax", height: "34vmax" }}
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,0 60,35 98,35 68,57 78,94 50,72 22,94 32,57 2,35 40,35"
            fill="#fff"
          />
        </svg>

        <img
          src="/persona/menus/home.jpg"
          alt=""
          className={`menu-art ${activeArtScreen === "home" ? "active-art" : ""}`}
        />
        <img
          src="/persona/menus/skills.jpg"
          alt=""
          className={`menu-art ${activeArtScreen === "malla" ? "active-art" : ""}`}
        />
        <img
          src="/persona/menus/about.jpg"
          alt=""
          className={`menu-art ${activeArtScreen === "drive" ? "active-art" : ""}`}
        />
        <img
          src="/persona/menus/contact.jpg"
          alt=""
          className={`menu-art ${activeArtScreen === "redes" ? "active-art" : ""}`}
        />

        <div ref={halftoneRef} className="bg-layer" id="bg-halftone" />
        <div
          className={`bg-layer vignette-${activeArtScreen}`}
          id="bg-vignette"
        />
      </div>

      {/* Torn black diagonal silhouette on Home when needed */}
      <div
        id="slash"
        aria-hidden="true"
        className={activeArtScreen === "home" ? "slash-home" : "slash-sub"}
      />

      {/* 3-pane diagonal screen transition wipe */}
      <div id="wipe" aria-hidden="true" className={wiping ? "go" : ""}>
        <div className="pane p3" />
        <div className="pane p2" />
        <div className="pane p1" />
        <div className="flash" />
      </div>

      {/* Custom animated cursor + select sound */}
      <div ref={cursorRef} id="cursor" aria-hidden="true" />
      <audio ref={sfxRef} src="/persona/sfx/select.mp3" preload="auto" />
      <button
        type="button"
        id="audio-toggle"
        onClick={toggleSound}
        aria-label={soundEnabled ? "Silenciar sonido de menú" : "Activar sonido de menú"}
        title={soundEnabled ? "Sonido activado" : "Sonido silenciado"}
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>

      {/* Main Persona HUD Shell */}
      <div id="shell">
        <header id="hud-top">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => goToScreen("home")}
              aria-current={isHomeRoute && screen === "home" ? "page" : undefined}
              className="hud-home-btn"
            >
              <span aria-hidden="true">🏠</span>
              <span>INICIO // ANGELITO</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => goToScreen("malla")}
                className={`hud-nav-btn ${isHomeRoute && screen === "malla" ? "active" : ""}`}
              >
                📚 Malla
              </button>
              <button
                type="button"
                onClick={() => goToScreen("drive")}
                className={`hud-nav-btn ${isHomeRoute && screen === "drive" ? "active" : ""}`}
              >
                📂 Drive
              </button>
              <button
                type="button"
                onClick={() => goToScreen("redes")}
                className={`hud-nav-btn ${isHomeRoute && screen === "redes" ? "active" : ""}`}
              >
                🌐 Redes
              </button>
            </div>
          </div>

          <div className="hud-tag alt hidden lg:block">{scheduleText}</div>
        </header>

        <div id="stage">{children}</div>

        <footer id="hud-bottom">
          <span className="desktop-kb-hint">
            <span className="key">↑↓</span>Seleccionar
          </span>
          <span className="desktop-kb-hint">
            <span className="key">Enter</span>Confirmar
          </span>
          <span className="desktop-kb-hint">
            <span className="key">Esc</span>Volver
          </span>
          {(!isHomeRoute || screen !== "home") && (
            <button
              type="button"
              onClick={() => goToScreen("home")}
              className="cursor-pointer border-2 border-foreground bg-halo px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-foreground sm:hidden"
            >
              ← Volver al Menú
            </button>
          )}
          <span className="ml-auto font-bold opacity-95" id="clock">
            {clock}
          </span>
        </footer>
      </div>
    </PersonaContext.Provider>
  );
}
