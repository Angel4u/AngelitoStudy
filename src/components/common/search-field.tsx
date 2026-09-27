import { forwardRef, useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shorter placeholder used on narrow screens so the question never clips. */
  placeholderNarrow?: string;
  label?: string;
  hint?: string;
  className?: string;
  size?: "md" | "lg";
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      value,
      onChange,
      placeholder,
      placeholderNarrow,
      label,
      hint,
      className,
      size = "md",
    },
    ref,
  ) {
    const isLarge = size === "lg";
    const [narrow, setNarrow] = useState(false);

    useEffect(() => {
      if (!placeholderNarrow) return;
      const mq = window.matchMedia("(max-width: 47.9375rem)");
      const update = () => setNarrow(mq.matches);
      update();
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }, [placeholderNarrow]);

    return (
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            "group/search relative flex items-center gap-3 rounded-xl border border-input bg-panel/80 backdrop-blur-sm transition-all duration-200",
            "focus-within:border-halo/60 focus-within:shadow-halo",
            isLarge ? "px-4 py-3.5 sm:px-5 sm:py-4" : "px-3.5 py-2.5",
          )}
        >
          <Search
            aria-hidden
            className={cn(
              "shrink-0 text-halo/70 transition-colors group-focus-within/search:text-halo",
              isLarge ? "size-5" : "size-4",
            )}
          />
          <label className="sr-only" htmlFor="catalog-search">
            {label ?? "Buscar materia o ejercicio"}
          </label>
          <input
            ref={ref}
            id="catalog-search"
            type="search"
            role="searchbox"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={narrow ? placeholderNarrow : placeholder}
            autoComplete="off"
            className={cn(
              "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none",
              isLarge ? "font-mono text-base sm:text-lg" : "font-mono text-sm",
            )}
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="grid size-7 shrink-0 place-items-center rounded-md border border-line text-muted-foreground transition-colors hover:border-halo/50 hover:text-halo"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="label-mono hidden shrink-0 rounded-md border border-line px-1.5 py-1 text-muted-foreground/70 sm:block"
            >
              /
            </kbd>
          )}
        </div>
        {hint ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground/80">{hint}</p>
        ) : null}
      </div>
    );
  },
);
