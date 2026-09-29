import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, PlayCircle } from "lucide-react";

import { subjectQuery } from "@/data/catalog";

export const Route = createFileRoute("/ramo/$id")({
  loader: async ({ context, params }) => {
    const s = await context.queryClient.ensureQueryData(subjectQuery(params.id));
    if (!s) throw notFound();
    return { title: s.title, code: s.code };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Ramo no encontrado — AngelitoStudy" }, { name: "robots", content: "noindex" }] };
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
    <main className="mx-auto max-w-xl px-4 py-24 text-center font-mono text-sm text-muted-foreground">
      No se pudo cargar el ramo. {error.message}
    </main>
  ),
  notFoundComponent: () => (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-foreground">Ese ramo no existe.</p>
      <Link to="/" className="label-mono mt-4 inline-block text-halo">volver a la malla</Link>
    </main>
  ),
  component: RamoPage,
});

function RamoPage() {
  const { id } = Route.useParams();
  const { data: s } = useSuspenseQuery(subjectQuery(id));
  if (!s) return null;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/" hash="malla" className="label-mono inline-flex items-center gap-1.5 text-muted-foreground hover:text-halo">
        <ArrowLeft className="size-3.5" /> malla
      </Link>
      <p className="label-mono mt-6 text-gold/80">
        {s.code} · nivel {s.level}
      </p>
      <h1 className="mt-2 font-mono text-2xl font-bold text-foreground sm:text-3xl">{s.title}</h1>

      {s.units.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-line bg-panel/50 px-6 py-10 text-center text-sm text-muted-foreground">
          Todavía no hay unidades subidas para este ramo.
        </p>
      ) : (
        <ol className="mt-8 space-y-4">
          {s.units.map((u, i) => (
            <li key={u.id} className="rounded-2xl border border-line bg-panel p-5 shadow-panel">
              <h2 className="font-mono text-base font-semibold text-foreground">
                <span className="text-halo">{String(i + 1).padStart(2, "0")}</span> {u.title}
              </h2>
              {u.resources.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Sin material todavía.</p>
              ) : (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {u.resources.map((r) => (
                    <li key={r.id}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-foreground transition-colors hover:border-halo/50"
                      >
                        {r.kind === "pdf" ? (
                          <FileText className="size-4 shrink-0 text-gold" aria-hidden />
                        ) : (
                          <PlayCircle className="size-4 shrink-0 text-halo" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1 truncate">{r.label}</span>
                        <span className="label-mono shrink-0 text-muted-foreground">{r.kind === "pdf" ? "pdf" : "video"}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
