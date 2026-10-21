import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FileText, PlayCircle } from "lucide-react";
import { useEffect } from "react";

import { subjectQuery } from "@/data/catalog";
import { usePersona } from "@/components/persona/persona-shell";
import { Ransom } from "@/components/persona/ransom";

export const Route = createFileRoute("/ramo/$id")({
  loader: async ({ context, params }) => {
    const s = await context.queryClient.ensureQueryData(subjectQuery(params.id));
    if (!s) throw notFound();
    return { title: s.title, code: s.code };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Ramo no encontrado — AngelitoStudy" },
          { name: "robots", content: "noindex" },
        ],
      };
    const t = `${loaderData.title} (${loaderData.code}) — AngelitoStudy`;
    const d = `Videos y apuntes de ${loaderData.title}, ordenados por unidad.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <main className="p-screen flex items-center justify-center">
      <div className="paper max-w-md text-center">
        No se pudo cargar el ramo. {error.message}
      </div>
    </main>
  ),
  notFoundComponent: () => {
    return (
      <main className="p-screen flex items-center justify-center">
        <div className="paper max-w-md text-center">
          <p className="font-mono text-lg font-bold text-ink">
            Ese ramo no existe.
          </p>
          <a href="/" className="cv-btn mt-4">
            <span>◀ Volver a la Malla</span>
          </a>
        </div>
      </main>
    );
  },
  component: RamoPage,
});

function RamoPage() {
  const { id } = Route.useParams();
  const { data: s } = useSuspenseQuery(subjectQuery(id));
  const { goToScreen, playSelect } = usePersona();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        goToScreen("malla");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToScreen]);

  if (!s) return null;

  return (
    <main className="p-screen" aria-label={s.title}>
      <div className="mx-auto w-full max-w-4xl pb-12">
        <div className="flex flex-wrap items-center gap-3">
          <div className="screen-head">
            <Ransom text={s.code} />
          </div>
          <button
            type="button"
            onClick={() => goToScreen("malla")}
            className="back-hint"
          >
            ESC · Volver a la Malla
          </button>
          <span className="hud-tag">NIVEL {s.level}</span>
        </div>

        <div className="mt-2 inline-block bg-ink px-4 py-2 font-mono text-xl font-bold uppercase tracking-wide text-foreground shadow-halo sm:text-2xl">
          {s.title}
        </div>

        {s.units.length === 0 ? (
          <div className="paper mt-8">
            <p className="font-bold">
              Todavía no hay unidades subidas para este ramo.
            </p>
            <p className="mt-1 text-base">
              Mientras tanto, puedes revisar las clases de los profesores en la
              sección{" "}
              <button
                type="button"
                onClick={() => goToScreen("drive")}
                className="cursor-pointer border-0 bg-transparent font-bold text-halo underline"
              >
                Material Drive
              </button>
              .
            </p>
          </div>
        ) : (
          <ol className="mt-8 space-y-6">
            {s.units.map((u, i) => (
              <li
                key={u.id}
                className="p-card !cursor-default"
                style={
                  {
                    "--tilt": `${i % 2 === 0 ? -0.4 : 0.4}deg`,
                  } as React.CSSProperties
                }
              >
                <span className="lang">
                  UNIDAD {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 font-mono text-lg font-bold uppercase text-foreground sm:text-xl">
                  <span className="mr-2 inline-block bg-halo px-2 py-0.5 text-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {u.title}
                </h2>

                {u.resources.length === 0 ? (
                  <p className="mt-3 font-mono text-sm text-muted-foreground">
                    Sin material todavía.
                  </p>
                ) : (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {u.resources.map((r) => (
                      <li key={r.id}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onMouseEnter={() => playSelect()}
                          className="flex items-center gap-3 border-2 border-halo/60 bg-panel px-3.5 py-2.5 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-foreground hover:bg-halo hover:text-ink"
                        >
                          {r.kind === "pdf" ? (
                            <FileText
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <PlayCircle
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <span className="min-w-0 flex-1 truncate">
                            {r.label}
                          </span>
                          <span className="bg-ink px-2 py-0.5 font-mono text-[11px] uppercase text-halo">
                            {r.kind === "pdf" ? "PDF" : "VIDEO"}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
