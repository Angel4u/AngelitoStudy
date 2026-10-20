import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

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

  return (
    <section
      id="malla"
      aria-labelledby="malla-title"
      className="relative scroll-mt-24 border-t border-line bg-ink/75 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 md:px-12 md:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal delay={100}>
              <p className="label-mono text-halo">// malla curricular</p>
            </Reveal>
            <Reveal delay={200}>
              <h2
                id="malla-title"
                className="mt-2 font-mono text-3xl font-medium uppercase tracking-tight text-foreground text-cinematic-shadow sm:text-4xl"
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
            <span className="text-lg">( C )</span>
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
          <Reveal delay={400}>
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
        )}
      </div>
    </section>
  );
}
