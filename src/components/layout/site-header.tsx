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
      {/* Top-left fixed brand block */}
      <div className="pointer-events-auto fixed left-5 top-5 z-50 sm:left-8 sm:top-7 md:left-12">
        <Reveal>
          <a
            href="/#top"
            aria-label="AngelitoStudy, ir al inicio"
            className="inline-block rounded-sm font-mono text-lg font-medium tracking-tight text-foreground text-cinematic-shadow transition-colors hover:text-halo focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:text-xl md:text-2xl"
          >
            (ANGELITO_STUDY)
          </a>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-6 font-mono text-[10px] text-foreground/60 text-cinematic-shadow sm:mt-8 sm:text-xs">
            [ v.01s{schedule} ]
          </p>
        </Reveal>
      </div>

      {/* Top-right fixed vertical navigation */}
      <nav
        aria-label="Secciones principales"
        className="pointer-events-auto fixed right-5 top-5 z-50 sm:right-8 sm:top-7 md:right-12"
      >
        <ul className="flex flex-col items-end gap-1.5 sm:gap-2">
          {navItems.map((item, i) => (
            <li key={item.href}>
              <Reveal delay={100 + i * 120}>
                <a
                  href={item.href}
                  className="group inline-flex items-center gap-1 rounded-sm py-0.5 font-mono text-xs text-foreground/80 text-cinematic-shadow transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:text-sm"
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
