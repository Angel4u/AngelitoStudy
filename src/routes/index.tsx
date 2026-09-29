import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Hero } from "@/components/sections/hero";
import { Malla } from "@/components/sections/malla";
import { catalogQuery } from "@/data/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AngelitoStudy — Malla de Ingeniería Civil Informática con videos y apuntes" },
      {
        name: "description",
        content: "Malla interactiva de Ingeniería Civil Informática: cada ramo con sus unidades, videos resueltos y apuntes en PDF.",
      },
      { property: "og:title", content: "AngelitoStudy — tu malla con videos y apuntes" },
      { property: "og:description", content: "Toca un ramo y encuentra sus clases y apuntes ordenados por unidad." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_CL" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery()),
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-xl px-4 py-24 text-center font-mono text-sm text-muted-foreground">
      No se pudo cargar el contenido. {error.message}
    </main>
  ),
  notFoundComponent: () => null,
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(catalogQuery());
  return (
    <main id="top" className="min-h-dvh bg-background">
      <Hero />
      <Malla subjects={data.subjects} />
    </main>
  );
}
