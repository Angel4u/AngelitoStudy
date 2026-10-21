import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FolderOpen, Github, Mail, Radio, Youtube } from "lucide-react";

import { catalogQuery, type Subject } from "@/data/catalog";
import {
  usePersona,
  type PersonaScreen,
} from "@/components/persona/persona-shell";
import { Ransom } from "@/components/persona/ransom";

const PROFESSORS_DRIVE_URL =
  "https://drive.google.com/drive/folders/105LusvpAwcjucIFQe4o5p7BGFEdgJLOd?usp=sharing";

const MENU_OPTIONS: { target: PersonaScreen; label: string }[] = [
  { target: "malla", label: "MALLA" },
  { target: "drive", label: "MATERIAL DRIVE" },
  { target: "redes", label: "REDES" },
];

function TwitchMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M4 3 3 6v13h4v3h3l3-3h4l5-5V3H4zm16 9-3 3h-5l-3 3v-3H6V5h14v7zm-6-5h-2v5h2V7zm5 0h-2v5h2V7z" />
    </svg>
  );
}

const socialIcons = {
  youtube: Youtube,
  github: Github,
  twitch: TwitchMark,
  email: Mail,
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AngelitoStudy — Malla de Ingeniería Civil Informática con videos y apuntes" },
      {
        name: "description",
        content:
          "Malla interactiva de Ingeniería Civil Informática: cada ramo con sus unidades, videos resueltos y apuntes en PDF.",
      },
      { property: "og:title", content: "AngelitoStudy — tu malla con videos y apuntes" },
      {
        property: "og:description",
        content: "Toca un ramo y encuentra sus clases y apuntes ordenados por unidad.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_CL" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery()),
  errorComponent: ({ error }) => (
    <main className="p-screen flex items-center justify-center">
      <div className="paper max-w-lg text-center">
        No se pudo cargar el contenido. {error.message}
      </div>
    </main>
  ),
  notFoundComponent: () => null,
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(catalogQuery());
  const navigate = useNavigate();
  const {
    screen,
    menuIndex,
    setMenuIndex,
    goToScreen,
    wipeAndNavigate,
    playSelect,
  } = usePersona();

  const { levels, byLevel } = useMemo(() => {
    const grouped = new Map<number, Subject[]>();
    for (const s of data.subjects) {
      const list = grouped.get(s.level);
      if (list) list.push(s);
      else grouped.set(s.level, [s]);
    }
    const sortedLevels = [...grouped.keys()].sort((a, b) => a - b);
    return { levels: sortedLevels, byLevel: grouped };
  }, [data.subjects]);

  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");

  // Keyboard navigation (↑↓, Enter, Escape) just like Persona
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (screen === "home") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMenuIndex(menuIndex + 1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setMenuIndex(menuIndex - 1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const chosen = MENU_OPTIONS[menuIndex];
          if (chosen) goToScreen(chosen.target);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        goToScreen("home");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToScreen, menuIndex, screen, setMenuIndex]);

  function openRamo(id: string) {
    wipeAndNavigate(() => {
      navigate({ to: "/ramo/$id", params: { id } });
    });
  }

  return (
    <>
      {/* ==================== SCREEN 1: HOME MENU ==================== */}
      {screen === "home" && (
        <section
          className="p-screen"
          id="screen-home"
          aria-label="Menú principal"
        >
          <div id="intro-eyebrow">
            // Sobrevivir a la carrera es una habilidad
          </div>

          <h1
            id="big-name"
            onClick={() => playSelect()}
            aria-label="Angelito Study"
          >
            <Ransom text="ANGELITO" />
            <Ransom text="STUDY" />
          </h1>

          <p id="tagline">
            Videos resolviendo ejercicios paso a paso, apuntes en PDF y guías
            ordenadas por ramo y unidad para Ingeniería Civil Informática. Elige
            una opción del menú para entrar:
          </p>

          <nav id="menu" aria-label="Secciones principales">
            {MENU_OPTIONS.map((item, idx) => {
              const isSelected = menuIndex === idx;
              return (
                <button
                  key={item.target}
                  type="button"
                  className={`menu-item ${isSelected ? "sel" : ""}`}
                  onMouseEnter={() => setMenuIndex(idx)}
                  onClick={() => goToScreen(item.target)}
                >
                  <Ransom text={item.label} />
                  <span className="cursor-mark" aria-hidden="true">
                    ◀
                  </span>
                </button>
              );
            })}
          </nav>
        </section>
      )}

      {/* ==================== SCREEN 2: MALLA CURRICULAR ==================== */}
      {screen === "malla" && (
        <section
          className="p-screen"
          id="screen-malla"
          aria-label="Malla Curricular"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="screen-head">
              <Ransom text="MALLA" />
            </div>
            <button
              type="button"
              className="back-hint"
              onClick={() => goToScreen("home")}
            >
              ESC · Volver
            </button>
            <button
              type="button"
              className="back-hint !bg-halo !text-foreground"
              onClick={() => goToScreen("drive")}
            >
              📂 Ver Drive de Profes
            </button>
          </div>

          {/* Level selector bar */}
          <div
            role="tablist"
            aria-label="Filtrar por semestre"
            className="mt-2 mb-5 flex items-center gap-2 overflow-x-auto pb-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedLevel === "all"}
              onClick={() => {
                playSelect();
                setSelectedLevel("all");
              }}
              className={`shrink-0 cursor-pointer px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-transform ${
                selectedLevel === "all"
                  ? "bg-foreground text-ink -rotate-1 shadow-halo"
                  : "bg-ink/90 text-foreground border border-halo/50 hover:border-foreground"
              }`}
            >
              Todos los niveles
            </button>
            {levels.map((lvl) => {
              const active = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    playSelect();
                    setSelectedLevel(lvl);
                  }}
                  className={`shrink-0 cursor-pointer px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-transform ${
                    active
                      ? "bg-foreground text-ink -rotate-1 shadow-halo"
                      : "bg-ink/90 text-foreground border border-halo/50 hover:border-foreground"
                  }`}
                >
                  Nivel {lvl}
                </button>
              );
            })}
          </div>

          {levels.length === 0 ? (
            <div className="paper">Todavía no hay ramos cargados.</div>
          ) : selectedLevel === "all" ? (
            /* Full multi-column Malla on desktop + responsive 2-col by level on mobile */
            <>
              <div className="space-y-6 md:hidden">
                {levels.map((lvl) => (
                  <div key={lvl} className="space-y-2.5">
                    <div className="hud-tag inline-block">NIVEL {lvl}</div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {(byLevel.get(lvl) ?? []).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseEnter={() => playSelect()}
                          onClick={() => openRamo(s.id)}
                          className="p-card min-h-24 text-left"
                        >
                          <span className="lang">{s.code}</span>
                          <span className="mt-3 block font-mono text-xs font-bold uppercase leading-snug text-foreground">
                            {s.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto pb-8 md:block">
                <div
                  className="grid w-max gap-3.5 pt-2"
                  style={{
                    gridTemplateColumns: `repeat(${levels.length}, minmax(10rem, 11.5rem))`,
                  }}
                >
                  {levels.map((lvl) => (
                    <div key={lvl} className="flex flex-col gap-3.5">
                      <div className="hud-tag text-center">NIVEL {lvl}</div>
                      {(byLevel.get(lvl) ?? []).map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseEnter={() => playSelect()}
                          onClick={() => openRamo(s.id)}
                          style={
                            {
                              "--tilt": `${((idx % 3) - 1) * 0.7}deg`,
                            } as React.CSSProperties
                          }
                          className="p-card min-h-24 text-center"
                        >
                          <span className="lang">{s.code}</span>
                          <span className="mt-3 flex flex-1 items-center justify-center px-1 font-mono text-xs font-bold uppercase leading-snug text-foreground">
                            {s.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Single selected level grid */
            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3 md:grid-cols-4">
              {(byLevel.get(selectedLevel) ?? []).map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onMouseEnter={() => playSelect()}
                  onClick={() => openRamo(s.id)}
                  style={
                    {
                      "--tilt": `${((idx % 3) - 1) * 0.8}deg`,
                    } as React.CSSProperties
                  }
                  className="p-card min-h-28 text-left"
                >
                  <span className="lang">{s.code}</span>
                  <span className="mt-4 block font-mono text-sm font-bold uppercase leading-snug text-foreground">
                    {s.title}
                  </span>
                  <span className="mt-3 block font-mono text-[11px] uppercase tracking-wider text-halo">
                    Ver unidades y videos →
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ==================== SCREEN 3: MATERIAL DRIVE (PROFES) ==================== */}
      {screen === "drive" && (
        <section
          className="p-screen flex flex-col md:items-end"
          id="screen-drive"
          aria-label="Material de Profesores en Google Drive"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="screen-head">
              <Ransom text="DRIVE" />
            </div>
            <button
              type="button"
              className="back-hint"
              onClick={() => goToScreen("home")}
            >
              ESC · Volver
            </button>
          </div>

          <div className="paper mt-2">
            <p className="font-bold text-lg">
              En{" "}
              <strong className="about-highlight">AngelitoStudy</strong> tienes dos
              fuentes de estudio separadas para que encuentres todo{" "}
              <strong className="about-highlight">sin ruido</strong>:
            </p>

            <br />

            <p>
              1. En la sección{" "}
              <strong className="about-highlight">MALLA CURRICULAR</strong> están
              mis propios{" "}
              <strong className="about-highlight">
                videos resolviendo ejercicios y mis guías explicadas paso a paso
              </strong>{" "}
              ordenados por ramo y unidad.
            </p>

            <br />

            <p>
              2. Este botón de{" "}
              <strong className="about-highlight">GOOGLE DRIVE</strong> es aparte:
              contiene directamente{" "}
              <strong className="about-highlight">
                las clases que suben los profesores, presentaciones y guías de
                ejercicios oficiales
              </strong>{" "}
              de las asignaturas.
            </p>

            <div className="about-quote">
              “Quédate con la señal; suelta el ruido. Revisa la clase del profe
              en el Drive y luego destraba los ejercicios en la Malla.”
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pb-8">
            <a
              href={PROFESSORS_DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => playSelect()}
              className="cv-btn"
            >
              <span className="inline-flex items-center gap-2.5">
                <FolderOpen className="size-5" aria-hidden="true" />
                Abrir Drive: Clases y Guías de Profes ↗
              </span>
            </a>

            <button
              type="button"
              onMouseEnter={() => playSelect()}
              onClick={() => goToScreen("malla")}
              className="contact-chip cursor-pointer"
            >
              <span>Ir a la Malla (Mis Videos y Guías) →</span>
            </button>
          </div>
        </section>
      )}

      {/* ==================== SCREEN 4: REDES Y HORARIO ==================== */}
      {screen === "redes" && (
        <section
          className="p-screen flex flex-col md:items-end"
          id="screen-redes"
          aria-label="Redes sociales y horario"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="screen-head">
              <Ransom text="REDES" />
            </div>
            <button
              type="button"
              className="back-hint"
              onClick={() => goToScreen("home")}
            >
              ESC · Volver
            </button>
          </div>

          <div className="paper mt-2 max-w-xl">
            <p>
              <strong># estudia como si te fuera la vida en ello, pero con pausas.</strong>
            </p>
            <p className="mt-2">
              AngelitoStudy es un repositorio abierto de clases y apuntes hechos
              por un estudiante para otros estudiantes. Si un video te salvó el
              semestre, ya cumplió su trabajo.
            </p>
            <div className="about-quote flex items-center gap-2">
              <Radio className="size-4 shrink-0 text-halo" aria-hidden="true" />
              <span>
                Próxima clase subida:{" "}
                <strong className="text-halo">
                  {data.scheduleLabel || "viernes 21:00"}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pb-8 md:justify-end">
            {data.socialLinks.map((link) => {
              const Icon = socialIcons[link.id];
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.id === "email" ? undefined : "_blank"}
                  rel={link.id === "email" ? undefined : "noopener noreferrer"}
                  onMouseEnter={() => playSelect()}
                  className="contact-chip"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="size-5 shrink-0" aria-hidden="true" />
                    <span>
                      {link.label} · {link.handle} ↗
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
