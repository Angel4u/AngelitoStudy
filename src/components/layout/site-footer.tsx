import { Github, Mail, Radio, Youtube } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { catalogQuery } from "@/data/catalog";

/** Twitch has no lucide glyph in this version, so it gets a small inline mark. */
function TwitchMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M4 3 3 6v13h4v3h3l3-3h4l5-5V3H4zm16 9-3 3h-5l-3 3v-3H6V5h14v7zm-6-5h-2v5h2V7zm5 0h-2v5h2V7z" />
    </svg>
  );
}

const icons = {
  youtube: Youtube,
  github: Github,
  twitch: TwitchMark,
  email: Mail,
} as const;

export function SiteFooter() {
  const { data: raw } = useQuery(catalogQuery());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = mounted ? raw : undefined;
  const socialLinks = data?.socialLinks ?? [];
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="min-w-0">
            <p className="font-mono text-sm text-foreground">
              <span className="text-muted-foreground"># </span>
              estudia como si te fuera la vida en ello,
              <br className="hidden sm:block" /> pero con pauses.
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              AngelitoStudy es un repositorio abierto de clases y apuntes hechos
              por un estudiante para otros estudiantes. Si un video te salvó de
              la ramificación, ya cumplió su trabajo.
            </p>
          </div>

          <ul className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
            {socialLinks.map((link) => {
              const Icon = icons[link.id];
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target={link.id === "email" ? undefined : "_blank"}
                    rel={link.id === "email" ? undefined : "noreferrer"}
                    className="group flex items-center gap-3 rounded-lg border border-line bg-panel/60 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-halo/40 hover:shadow-halo"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-halo" />
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-xs text-foreground">
                        {link.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {link.handle}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 font-mono text-xs text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} angelito_study — hecho entre ayudantías y cafés.</span>
          <span className="inline-flex items-center gap-2">
            <Radio className="size-3 text-gold" aria-hidden />
            próximo subido: {data?.scheduleLabel ?? ""}
          </span>
        </div>
      </div>
    </footer>
  );
}
