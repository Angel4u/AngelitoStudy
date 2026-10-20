import { ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Reveal } from "@/components/common/reveal";
import { catalogQuery } from "@/data/catalog";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#top", label: "inicio" },
  { href: "/#metodo", label: "método" },
  { href: "/#malla", label: "malla" },
  { href: "/#redes", label: "redes" },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  const { data } = useQuery(catalogQuery());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const schedule = mounted && data?.scheduleLabel ? ` · ${data.scheduleLabel}` : "";

  return (
    <header className={cn("pointer-events-none", className)}>
      {/* Mobile compact frosted header bar (< sm) so text never collides while scrolling */}
      <div className="pointer-events-auto fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-ink/85 px-4 py-3 backdrop-blur-md sm:hidden">
        <a
          href="/#top"
          aria-label="AngelitoStudy, ir al inicio"
          className="font-mono text-sm font-semibold tracking-tight text-foreground"
        >
          (ANGELITO<span className="text-halo">_STUDY</span>)
        </a>
        <nav aria-label="Secciones principales móvil">
          <ul className="flex items-center gap-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-mono text-[11px] uppercase tracking-wider text-foreground/80 transition-colors hover:text-halo"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop & tablet editorial corner navigation (sm+) */}
      <div className="pointer-events-auto fixed left-8 top-7 z-50 hidden sm:block md:left-12">
        <Reveal>
          <a
            href="/#top"
            aria-label="AngelitoStudy, ir al inicio"
            className="inline-block rounded-sm font-mono text-xl font-medium tracking-tight text-foreground text-cinematic-shadow transition-colors hover:text-halo focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground md:text-2xl"
          >
            (ANGELITO_STUDY)
          </a>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-6 font-mono text-xs text-foreground/60 text-cinematic-shadow">
            [ v.01s{schedule} ]
          </p>
        </Reveal>
      </div>

      <nav
        aria-label="Secciones principales"
        className="pointer-events-auto fixed right-8 top-7 z-50 hidden sm:block md:right-12"
      >
        <ul className="flex flex-col items-end gap-2">
          {navItems.map((item, i) => (
            <li key={item.href}>
              <Reveal delay={100 + i * 120}>
                <a
                  href={item.href}
                  className="group inline-flex items-center gap-1 rounded-sm py-0.5 font-mono text-sm text-foreground/80 text-cinematic-shadow transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
