import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/common/reveal";
import type { Subject } from "@/data/catalog";

export function Malla({ subjects }: { subjects: Subject[] }) {
  const { levels, byLevel } = useMemo(() => {
    const grouped = new Map<number, Subject[]>();
    for (const s of subjects) {
      const list = grouped.get(s.level);
      if (list) list.push(s);
      else grouped.set(s.level, [s]);
    }
    const sortedLevels = [...grouped.keys()].sort((a, b) => a - b);
    return { levels: sortedLevels, byLevel: grouped };
  }, [subjects]);

  const [selectedLevel, setSelectedLevel] = useState<number | "all">(
    () => levels[0] ?? 1,
  );

  const activeMobileLevel =
    selectedLevel === "all" || levels.includes(selectedLevel)
      ? selectedLevel
      : (levels[0] ?? 1);

  return (
    <section
      id="malla"
      aria-labelledby="malla-title"
      className="relative scroll-mt-16 border-t border-line bg-ink/80 backdrop-blur-md sm:scroll-mt-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-8 sm:py-20 md:px-12 md:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <Reveal delay={100}>
              <p className="label-mono text-halo">// malla curricular</p>
            </Reveal>
            <Reveal delay={200}>
              <h2
                id="malla-title"
                className="mt-2 font-mono text-2xl font-medium uppercase tracking-tight text-foreground text-cinematic-shadow sm:text-4xl"
              >
                Elige un{" "}
                <span className="font-light italic lowercase text-halo text-halo-glow">
                  ramo
                </span>
              </h2>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/80">
                Toca cualquier ramo para ver sus unidades, videos resueltos y
                apuntes en PDF.
              </p>
            </Reveal>
          </div>

          <Reveal
            delay={340}
            className="flex items-center justify-between gap-12 font-mono text-foreground/70 sm:justify-end"
          >
            <span className="text-sm text-halo sm:text-lg sm:text-foreground/70">
              ( C )
            </span>
            <span className="text-xs">[ 003 /003 ]</span>
          </Reveal>
        </div>

        {levels.length === 0 ? (
          <Reveal delay={400}>
            <p className="mt-10 font-mono text-sm text-muted-foreground">
              Todavía no hay ramos.
            </p>
          </Reveal>
        ) : (
          <>
            {/* Mobile view (< md): Semester filter tabs + 2-column grid that fits phone screen */}
            <div className="mt-6 md:hidden">
              <div
                role="tablist"
                aria-label="Filtrar por nivel"
                className="flex items-center gap-2 overflow-x-auto pb-3"
              >
                {levels.map((lvl) => {
                  const isActive = activeMobileLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                        isActive
                          ? "border-halo bg-halo text-ink font-semibold shadow-halo"
                          : "border-halo/30 bg-ink/80 text-foreground/80 hover:border-halo/60"
                      }`}
                    >
                      Nivel {lvl}
                    </button>
                  );
                })}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeMobileLevel === "all"}
                  onClick={() => setSelectedLevel("all")}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                    activeMobileLevel === "all"
                      ? "border-halo bg-halo text-ink font-semibold shadow-halo"
                      : "border-halo/30 bg-ink/80 text-foreground/80 hover:border-halo/60"
                  }`}
                >
                  Todos
                </button>
              </div>

              <div className="mt-3 space-y-6">
                {(activeMobileLevel === "all" ? levels : [activeMobileLevel]).map(
                  (lvl) => (
                    <div key={lvl} className="space-y-2.5">
                      {activeMobileLevel === "all" && (
                        <h3 className="label-mono border-b border-line pb-1.5 text-halo">
                          nivel {lvl}
                        </h3>
                      )}
                      <div className="grid grid-cols-2 gap-2.5">
                        {(byLevel.get(lvl) ?? []).map((s) => (
                          <Link
                            key={s.id}
                            to="/ramo/$id"
                            params={{ id: s.id }}
                            className="group flex min-h-24 flex-col rounded-xl border border-halo/35 bg-ink/90 text-center transition-all duration-200 active:scale-[0.98] hover:border-halo/80 hover:shadow-halo"
                          >
                            <span className="border-b border-halo/20 py-1.5 font-mono text-[11px] text-halo">
                              {s.code}
                            </span>
                            <span className="flex flex-1 items-center justify-center px-2.5 py-2.5 text-xs font-medium uppercase leading-snug text-foreground/95">
                              {s.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Desktop view (md+): Full multi-column curriculum grid */}
            <Reveal delay={400} className="hidden md:block">
              <div className="mt-10 overflow-x-auto pb-4">
                <div
                  className="mx-auto grid w-max gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${levels.length}, minmax(9.5rem, 11rem))`,
                  }}
                >
                  {levels.map((lvl) => (
                    <div key={lvl} className="flex flex-col gap-2.5">
                      <h3 className="label-mono border-b border-line pb-2 text-center text-foreground/70">
                        nivel {lvl}
                      </h3>
                      {(byLevel.get(lvl) ?? []).map((s) => (
                        <Link
                          key={s.id}
                          to="/ramo/$id"
                          params={{ id: s.id }}
                          className="group flex min-h-24 flex-col rounded-lg border border-halo/35 bg-ink/85 text-center backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-halo/80 hover:shadow-halo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                        >
                          <span className="border-b border-halo/20 py-1.5 font-mono text-xs text-halo transition-colors group-hover:text-halo">
                            {s.code}
                          </span>
                          <span className="flex flex-1 items-center justify-center px-2.5 py-2.5 text-xs font-medium uppercase leading-snug text-foreground/90 transition-colors group-hover:text-foreground">
                            {s.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
