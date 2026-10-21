import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PersonaShell, usePersona } from "@/components/persona/persona-shell";
import { Ransom } from "@/components/persona/ransom";

function NotFoundComponent() {
  const { goToScreen } = usePersona();
  return (
    <div className="p-screen flex items-center justify-center">
      <div className="paper max-w-md text-center">
        <div className="mb-3">
          <Ransom text="404" className="text-5xl" />
        </div>
        <h2 className="font-mono text-lg font-bold text-ink">
          $ ramo o ruta no encontrada
        </h2>
        <p className="mt-2 text-base">
          Esa ruta no existe en el repositorio. Puede que el apunte se haya
          movido o que nunca se subió.
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => goToScreen("home")}
            className="cv-btn"
          >
            <span>◀ Volver al Menú</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="p-screen flex items-center justify-center">
      <div className="paper max-w-md text-center">
        <h1 className="font-mono text-xl font-bold text-ink">
          Esto no debería pasar
        </h1>
        <p className="mt-2 text-base">
          Algo falló de nuestro lado. Puedes reintentar o volver al inicio.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="cv-btn"
          >
            <span>Reintentar</span>
          </button>
          <a href="/" className="back-hint">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AngelitoStudy" },
      {
        name: "description",
        content:
          "Videos de resolución de ejercicios y apuntes universitarios para estudiantes de Ingeniería Civil Informática.",
      },
      { name: "author", content: "AngelitoStudy" },
      { name: "theme-color", content: "#0b0b0d" },
      { property: "og:title", content: "AngelitoStudy" },
      {
        property: "og:description",
        content:
          "El repositorio ordenado de clases y apuntes para sobrevivir a la carrera.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=M+PLUS+1p:wght@500;700;800;900&family=Space+Grotesk:wght@600;700&family=Syne:wght@700;800&family=Zen+Kaku+Gothic+New:wght@500;700;900&family=JetBrains+Mono:wght@500;700&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/assets/solace-mark.svg" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PersonaShell>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </PersonaShell>
    </QueryClientProvider>
  );
}
