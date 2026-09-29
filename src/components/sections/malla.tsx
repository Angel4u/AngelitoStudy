import { Link } from "@tanstack/react-router";

import type { Subject } from "@/data/catalog";

export function Malla({ subjects }: { subjects: Subject[] }) {
  const levels = [...new Set(subjects.map((s) => s.level))].sort((a, b) => a - b);

  return (
    <section id="malla" aria-labelledby="malla-title" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <p className="label-mono text-gold/80">// malla curricular</p>
        <h2 id="malla-title" className="mt-2 font-mono text-xl font-semibold text-foreground sm:text-2xl">
          Elige un ramo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Toca cualquier ramo para ver sus unidades, videos y apuntes.
        </p>

        {levels.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-muted-foreground">Todavía no hay ramos.</p>
        ) : (
          <div className="mt-6 overflow-x-auto pb-2">
            <div
              className="mx-auto grid w-max gap-2"
              style={{ gridTemplateColumns: `repeat(${levels.length}, minmax(9rem, 10rem))` }}
            >
              {levels.map((lvl) => (
                <div key={lvl} className="flex flex-col gap-2">
                  <h3 className="label-mono py-1 text-center text-foreground">nivel {lvl}</h3>
                  {subjects
                    .filter((s) => s.level === lvl)
                    .map((s) => (
                      <Link
                        key={s.id}
                        to="/ramo/$id"
                        params={{ id: s.id }}
                        className="flex min-h-24 flex-col rounded-lg border border-line bg-ink text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-halo/45 hover:shadow-raised"
                      >
                        <span className="border-b border-line/60 py-1 font-mono text-xs text-muted-foreground">{s.code}</span>
                        <span className="flex flex-1 items-center justify-center px-2 py-2 text-xs font-medium uppercase leading-snug text-foreground">
                          {s.title}
                        </span>
                      </Link>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
