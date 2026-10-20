import { ArrowDown, ArrowUpRight, Check, FolderOpen, Share2 } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/common/reveal";

const PROFESSORS_DRIVE_URL =
  "https://drive.google.com/drive/folders/105LusvpAwcjucIFQe4o5p7BGFEdgJLOd?usp=sharing";

function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: "AngelitoStudy — Malla de Ingeniería Civil Informática",
      text: "Videos resolviendo ejercicios y apuntes ordenados por ramo y unidad.",
      url: window.location.href,
    };

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // Fall back to clipboard if user cancels or share fails
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartir AngelitoStudy"
        className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-ink/60 text-foreground/80 backdrop-blur-sm transition-colors hover:border-halo/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:border-none sm:bg-transparent"
      >
        {copied ? (
          <Check size={18} aria-hidden="true" className="text-halo" />
        ) : (
          <Share2 size={18} aria-hidden="true" />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Enlace copiado al portapapeles" : ""}
      </span>
      {copied && (
        <span
          aria-hidden="true"
          className="ml-2 font-mono text-xs text-foreground/80 text-cinematic-shadow"
        >
          enlace copiado
        </span>
      )}
    </div>
  );
}

export function Hero() {
  const [ritualStarted, setRitualStarted] = useState(false);

  function handlePrimaryAction() {
    setRitualStarted(true);
    const el = document.getElementById("malla");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    window.setTimeout(() => setRitualStarted(false), 2600);
  }

  return (
    <section
      id="top"
      aria-label="Presentación principal"
      className="relative flex min-h-screen flex-col justify-end pt-20 supports-[height:100svh]:min-h-[100svh] sm:pt-28"
    >
      <div className="relative flex flex-col gap-7 px-5 pb-20 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:px-8 sm:pb-16 md:px-12 md:pb-20">
        <h1 className="max-w-xl text-[2.25rem] font-medium uppercase leading-[1.06] tracking-tight text-foreground text-cinematic-shadow sm:text-5xl md:text-6xl lg:text-7xl">
          <Reveal as="span" delay={100} className="block sm:pl-12">
            Sobrevivir
          </Reveal>
          <Reveal as="span" delay={220} className="block">
            a la{" "}
            <span className="font-light italic lowercase text-halo text-halo-glow">
              carrera
            </span>
          </Reveal>
          <Reveal as="span" delay={340} className="block pl-4 sm:pl-20">
            // Paso a
          </Reveal>
          <Reveal as="span" delay={460} className="block pl-8 sm:pl-32">
            Paso
          </Reveal>
        </h1>

        <div className="flex w-full max-w-sm flex-col items-start rounded-2xl border border-line bg-ink/65 p-4 backdrop-blur-md sm:max-w-xs sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <Reveal
            delay={400}
            className="mb-3 flex w-full items-center justify-between font-mono sm:mb-8"
          >
            <span className="text-sm text-halo sm:text-lg sm:text-foreground/70 text-cinematic-shadow">
              ( A )
            </span>
            <span className="text-xs text-foreground/70 text-cinematic-shadow">
              [ 001 /003 ]
            </span>
          </Reveal>

          <Reveal delay={520} className="mb-5 sm:mb-8">
            <p className="text-sm leading-relaxed text-foreground/85 text-cinematic-shadow">
              AngelitoStudy transforma un semestre pesado en el siguiente
              ejercicio resuelto. Revisa tu ramo, entiende la pizarra y quédate
              con lo que sirve.
            </p>
          </Reveal>

          <Reveal delay={640} className="w-full">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="pill-cta w-full cursor-pointer"
            >
              {ritualStarted ? "Bajando a la Malla..." : "Explorar la Malla"}
            </button>
          </Reveal>
        </div>
      </div>

      {/* Bottom-left Share2 control */}
      <ShareButton className="absolute bottom-4 left-5 z-20 flex items-center sm:bottom-6 sm:left-8 md:left-12" />

      {/* Bottom-center scroll cue */}
      <a
        href="#metodo"
        aria-label="Desplazar hacia la siguiente sección"
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full p-1.5 text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:bottom-6"
      >
        <ArrowDown
          size={18}
          aria-hidden="true"
          className="animate-bounce motion-reduce:animate-none"
        />
      </a>
    </section>
  );
}

export function StatementSection() {
  const [checkedIn, setCheckedIn] = useState(false);

  function handleCheckIn() {
    setCheckedIn(true);
    const el = document.getElementById("malla");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    window.setTimeout(() => setCheckedIn(false), 2600);
  }

  return (
    <section
      id="metodo"
      aria-label="Método de estudio"
      className="relative flex min-h-screen flex-col justify-between py-20 supports-[height:100svh]:min-h-[100svh] sm:py-0"
    >
      {/* Middle row */}
      <div className="relative flex flex-1 flex-col justify-center gap-6 px-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 md:px-12">
        <h2 className="max-w-sm text-[2.25rem] font-medium uppercase leading-[1.06] tracking-tight text-foreground text-cinematic-shadow sm:text-5xl md:text-6xl">
          <Reveal as="span" delay={100} className="block">
            Entiende{" "}
            <span className="font-light italic lowercase text-gold text-gold-glow">
              cada unidad
            </span>
          </Reveal>
          <Reveal as="span" delay={220} className="block">
            Sin Ruido.
          </Reveal>
        </h2>

        <Reveal
          delay={340}
          className="flex w-full items-center justify-between font-mono text-foreground/70 text-cinematic-shadow sm:w-auto sm:justify-start sm:gap-16 md:gap-24"
        >
          <span className="text-sm text-gold sm:text-lg sm:text-foreground/70">
            ( B )
          </span>
          <span className="text-xs">[ 002 /003 ]</span>
        </Reveal>
      </div>

      {/* Bottom block */}
      <div className="relative flex flex-col gap-5 px-5 pb-14 sm:gap-8 sm:px-8 sm:pb-16 md:px-12 md:pb-20">
        <Reveal delay={460}>
          <div className="max-w-md space-y-4 rounded-2xl border border-line bg-ink/70 p-4 backdrop-blur-md sm:max-w-sm sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <p className="text-sm leading-relaxed text-foreground/85 text-cinematic-shadow">
              Abajo en la malla están mis videos y mis guías resueltas paso a
              paso. Y si buscas el material directo de los profesores (clases
              subidas, diapositivas y guías de ejercicios), entra al repositorio
              general en Drive:
            </p>
            <a
              href={PROFESSORS_DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-halo/80 bg-halo/15 px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-halo shadow-halo backdrop-blur-md transition-all duration-200 hover:bg-halo hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:w-auto sm:px-6 sm:py-3.5 sm:text-xs"
            >
              <FolderOpen size={16} aria-hidden="true" className="shrink-0" />
              <span className="truncate">Drive: Clases y Guías de Profes</span>
              <ArrowUpRight
                size={15}
                aria-hidden="true"
                className="shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </Reveal>

        <Reveal
          delay={580}
          className="w-full sm:absolute sm:bottom-16 sm:left-1/2 sm:w-auto sm:-translate-x-1/2 md:bottom-20"
        >
          <button
            type="button"
            onClick={handleCheckIn}
            className="pill-cta w-full cursor-pointer sm:w-auto"
          >
            {checkedIn ? "Abriendo Malla..." : "Elegir un Ramo"}
          </button>
        </Reveal>

        <Reveal
          delay={700}
          className="hidden sm:absolute sm:bottom-6 sm:left-8 sm:z-20 sm:flex sm:items-center md:left-12"
        >
          <ShareButton className="flex items-center" />
        </Reveal>
      </div>
    </section>
  );
}
