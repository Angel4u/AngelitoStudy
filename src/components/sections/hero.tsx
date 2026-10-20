import { ArrowDown, Check, Share2 } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/common/reveal";

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
        className="inline-flex size-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
      className="relative flex min-h-screen flex-col justify-end pt-28 supports-[height:100svh]:min-h-[100svh]"
    >
      <div className="relative flex flex-col gap-10 px-5 pb-16 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:px-8 md:px-12 md:pb-20">
        <h1 className="max-w-xl text-4xl font-medium uppercase leading-[1.05] tracking-tight text-foreground text-cinematic-shadow sm:text-5xl md:text-6xl lg:text-7xl">
          <Reveal as="span" delay={100} className="block pl-6 sm:pl-12">
            Sobrevivir
          </Reveal>
          <Reveal as="span" delay={220} className="block">
            a la{" "}
            <span className="font-light italic lowercase text-halo text-halo-glow">
              carrera
            </span>
          </Reveal>
          <Reveal as="span" delay={340} className="block pl-10 sm:pl-20">
            // Paso a
          </Reveal>
          <Reveal as="span" delay={460} className="block pl-16 sm:pl-32">
            Paso
          </Reveal>
        </h1>

        <div className="flex w-full max-w-xs flex-col items-start">
          <Reveal
            delay={400}
            className="mb-6 flex w-full items-center justify-between font-mono sm:mb-8"
          >
            <span className="text-lg text-foreground/70 text-cinematic-shadow">
              ( A )
            </span>
            <span className="text-xs text-foreground/70 text-cinematic-shadow">
              [ 001 /003 ]
            </span>
          </Reveal>

          <Reveal delay={520} className="mb-6 sm:mb-8">
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
      <ShareButton className="absolute bottom-5 left-5 z-20 flex items-center sm:bottom-6 sm:left-8 md:left-12" />

      {/* Bottom-center scroll cue */}
      <a
        href="#metodo"
        aria-label="Desplazar hacia la siguiente sección"
        className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full p-1 text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:bottom-6"
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
      className="relative flex min-h-screen flex-col supports-[height:100svh]:min-h-[100svh]"
    >
      {/* Middle row */}
      <div className="relative flex flex-1 flex-col justify-center gap-10 px-5 pt-24 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:pt-0 md:px-12">
        <h2 className="max-w-sm text-4xl font-medium uppercase leading-[1.05] tracking-tight text-foreground text-cinematic-shadow sm:text-5xl md:text-6xl">
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
          <span className="text-lg">( B )</span>
          <span className="text-xs">[ 002 /003 ]</span>
        </Reveal>
      </div>

      {/* Bottom block */}
      <div className="relative flex flex-col gap-10 px-5 pb-16 sm:px-8 md:px-12 md:pb-20">
        <Reveal delay={460}>
          <p className="max-w-xs text-sm leading-relaxed text-foreground/85 text-cinematic-shadow">
            Cada ramo en AngelitoStudy está ordenado al grano: una clase en
            video, un apunte en PDF, una guía resuelta. Quédate con la señal;
            suelta el ruido.
          </p>
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
          className="absolute bottom-5 left-5 z-20 flex items-center sm:bottom-6 sm:left-8 md:left-12"
        >
          <ShareButton className="flex items-center" />
        </Reveal>
      </div>
    </section>
  );
}
