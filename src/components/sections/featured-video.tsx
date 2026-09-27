import { Play, Youtube } from "lucide-react";

import poster from "@/assets/featured-class.jpg";
import { featuredVideo } from "@/data/catalog";

interface FeaturedVideoProps {
  /** Hidden when the hero search is filtering the catalog. */
  visible: boolean;
}

export function FeaturedVideo({ visible }: FeaturedVideoProps) {
  if (!visible) return null;

  const posterSrc = featuredVideo.poster || poster;

  return (
    <section
      id="ultima-clase"
      aria-labelledby="ultima-clase-title"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="grid gap-3 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="label-mono inline-flex items-center gap-2 text-gold">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden />
            {featuredVideo.eyebrow}
          </span>
          <h2
            id="ultima-clase-title"
            className="mt-1 font-mono text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            {featuredVideo.title}
          </h2>
        </div>
        <span className="label-mono shrink-0 text-muted-foreground/70">
          {featuredVideo.series}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <a
          href={featuredVideo.watchUrl}
          target="_blank"
          rel="noreferrer"
          className="group relative block overflow-hidden rounded-2xl border border-line bg-panel shadow-panel transition-all duration-300 hover:border-halo/45 hover:shadow-raised"
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={posterSrc}
              alt="Miniatura de la última clase subida"
              width={1280}
              height={720}
              loading="lazy"
              className="size-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
            />
            <div aria-hidden className="absolute inset-0 scanlines" />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent"
            />

            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-halo/50 bg-background/70 text-halo backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-halo sm:size-20"
            >
              <Play className="size-6 fill-current sm:size-7" />
            </span>

            <span className="label-mono absolute bottom-3 right-3 rounded-md border border-line bg-ink/80 px-2 py-1 text-foreground backdrop-blur-sm">
              {featuredVideo.durationLabel}
            </span>
            <span className="label-mono absolute left-3 top-3 rounded-md border border-gold/40 bg-ink/80 px-2 py-1 text-gold backdrop-blur-sm">
              youtube embed
            </span>
          </div>
        </a>

        <div className="flex min-w-0 flex-col justify-between gap-5 rounded-2xl border border-line bg-panel/70 p-5 shadow-panel">
          <div className="min-w-0">
            <p className="label-mono text-muted-foreground">// metadatos</p>
            <dl className="mt-3 grid gap-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">Publicada</dt>
                <dd className="min-w-0 truncate font-mono text-foreground">
                  {featuredVideo.publishedLabel}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">Duración</dt>
                <dd className="min-w-0 truncate font-mono text-foreground">
                  {featuredVideo.durationLabel}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">Ramo</dt>
                <dd className="min-w-0 truncate font-mono text-foreground">
                  MAT-201
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Cambiar el orden de integración antes de sufrir con los límites.
              La guía resuelta y el PDF de la pizarra están en Apuntes.
            </p>
          </div>

          <a
            href={featuredVideo.watchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-halo/40 bg-halo/10 px-4 py-3 font-mono text-sm text-halo transition-all duration-200 hover:bg-halo/20 hover:shadow-halo"
          >
            <Youtube className="size-4 shrink-0" aria-hidden />
            Ver en YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
