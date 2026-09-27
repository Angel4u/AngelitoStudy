import avatar from "@/assets/avatar-angelito.png";
import { SearchField } from "@/components/common/search-field";

interface HeroProps {
  query: string;
  onQueryChange: (value: string) => void;
  suggestions: string[];
  resultLabel: string;
}

export function Hero({
  query,
  onQueryChange,
  suggestions,
  resultLabel,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-background">
      {/* Ambient halo + wing glow, purely decorative. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 surface-grid opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-halo/10 blur-3xl animate-halo-drift"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-[-6rem] size-80 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="relative">
            <span
              aria-hidden
              className="absolute -inset-3 rounded-full border border-halo/25"
            />
            <span
              aria-hidden
              className="absolute -inset-6 rounded-full border border-gold/15"
            />
            <img
              src={avatar}
              alt="Avatar de AngelitoStudy: un ángel pixelado con halo celeste"
              width={128}
              height={128}
              className="size-24 rounded-full border border-halo/40 object-cover shadow-halo sm:size-28"
            />
          </div>

          <p className="label-mono mt-7 text-gold/80">
            // repositorio de la carrera
          </p>

          <h1 className="mt-3 font-mono text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            Sobrevivir a Ingeniería Civil Informática{" "}
            <span className="text-halo text-halo-glow">es una habilidad</span>
            <span className="animate-caret text-gold">_</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Aquí están, ordenados y sin publicidad, los videos resolviendo los
            ejercicios que duelen y los apuntes que uno escribe a las 3 AM. Nada
            de cursilería: la materia que entra, entra.
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <SearchField
              size="lg"
              value={query}
              onChange={onQueryChange}
              label="¿Qué materia o ejercicio necesitas estudiar hoy?"
              placeholder="¿Qué materia o ejercicio necesitas estudiar hoy?"
              placeholderNarrow="materia, guía o tema…"
              hint={resultLabel}
            />
          </div>

          {query ? null : (
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => onQueryChange(suggestion)}
                    className="rounded-full border border-line bg-panel/60 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-halo/45 hover:text-halo"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
