import avatar from "@/assets/avatar-angelito.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 surface-grid opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 size-[24rem] -translate-x-1/2 rounded-full bg-halo/10 blur-3xl animate-halo-drift"
      />
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-4 py-10 text-center sm:flex-row sm:text-left sm:px-6">
        <img
          src={avatar}
          alt="Avatar de AngelitoStudy: un ángel pixelado con halo celeste"
          width={96}
          height={96}
          className="size-20 shrink-0 rounded-full border border-halo/40 object-cover shadow-halo"
        />
        <div>
          <p className="label-mono text-gold/80">// repositorio de la carrera</p>
          <h1 className="mt-2 font-mono text-xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Sobrevivir a Ingeniería Civil Informática{" "}
            <span className="text-halo text-halo-glow">es una habilidad</span>
            <span className="animate-caret text-gold">_</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Videos resolviendo ejercicios y apuntes, ordenados por ramo y unidad.
          </p>
        </div>
      </div>
    </section>
  );
}
