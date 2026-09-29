import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { catalogQuery } from "@/data/catalog";
import avatar from "@/assets/avatar-angelito.png";
import { cn } from "@/lib/utils";

const navItems = [{ href: "#malla", label: "malla" }] as const;

export function SiteHeader({ className }: { className?: string }) {
  const { data } = useQuery(catalogQuery());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a
          href="/#top"
          className="flex min-w-0 items-center gap-3"
          aria-label="AngelitoStudy, ir al inicio"
        >
          <span className="relative shrink-0">
            <img
              src={avatar}
              alt=""
              width={40}
              height={40}
              className="size-9 shrink-0 rounded-full border border-halo/30 object-cover shadow-halo"
            />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-gold" />
          </span>
          <span className="min-w-0 truncate font-mono text-sm font-semibold tracking-tight text-foreground">
            angelito<span className="text-halo">_study</span>
          </span>
        </a>

        <nav
          aria-label="Secciones"
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={`/${item.href}`}
              className="rounded-md px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-panel hover:text-halo"
            >
              ./{item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span className="label-mono hidden items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-muted-foreground lg:inline-flex">
            <Radio className="size-3 text-gold" aria-hidden />
            sube {mounted ? (data?.scheduleLabel ?? "") : ""}
          </span>
          <Link
            to="/"
            className="label-mono rounded-md border border-halo/40 bg-halo/10 px-3 py-1.5 text-halo transition-colors hover:bg-halo/20"
          >
            inicio
          </Link>
        </div>
      </div>
    </header>
  );
}
