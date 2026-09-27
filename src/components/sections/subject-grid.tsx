import { ArrowUpRight, FileText, PlayCircle } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { subjects, type Subject } from "@/data/catalog";
import { cn } from "@/lib/utils";

interface SubjectGridProps {
  items: Subject[];
  query: string;
  onQueryChange: (value: string) => void;
}

export function SubjectGrid({ items, query, onQueryChange }: SubjectGridProps) {
  return (
    <section
      id="ramos"
      aria-labelledby="ramos-title"
      className="scroll-mt-20 border-y border-line bg-panel/25"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading
          id="ramos-title"
          marker="// explorar por ramos"
          title="Elige la materia que te toca enfrentar hoy"
          description="Cada ramo agrupa sus clases grabadas y sus apuntes. Nada está suelto: si existe un ejercicio resuelto, vive dentro de uno de estos cinco cajones."
          meta={`${items.length} de ${subjects.length} ramos`}
        />

        {items.length === 0 ? (
          <EmptyState query={query} onQueryChange={onQueryChange} />
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  const isHalo = subject.accent === "halo";

  return (
    <li className="group min-w-0">
      <a
        href="#apuntes"
        className="flex h-full min-w-0 flex-col rounded-2xl border border-line bg-panel p-5 shadow-panel transition-all duration-300 hover:-translate-y-1 hover:border-halo/45 hover:shadow-raised"
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span
            className={cn(
              "label-mono shrink-0 rounded-md border px-2 py-1",
              isHalo
                ? "border-halo/35 bg-halo-soft text-halo"
                : "border-gold/35 bg-gold-soft text-gold",
            )}
          >
            {subject.code}
          </span>
          <ArrowUpRight
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-halo"
          />
        </div>

        <h3 className="mt-4 font-mono text-base font-semibold tracking-tight text-foreground">
          {subject.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {subject.blurb}
        </p>

        <div className="mt-5 flex min-w-0 items-center justify-between gap-3 border-t border-line pt-4">
          <span className="inline-flex min-w-0 items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="inline-flex shrink-0 items-center gap-1.5 text-halo/90">
              <PlayCircle className="size-3.5" aria-hidden />
              {subject.videos}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-gold/90">
              <FileText className="size-3.5" aria-hidden />
              {subject.notes}
            </span>
          </span>
          <span className="label-mono shrink-0 text-muted-foreground/70">
            {subject.term}
          </span>
        </div>
      </a>
    </li>
  );
}

function EmptyState({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-line bg-panel/50 px-6 py-12 text-center">
      <p className="font-mono text-sm text-foreground">
        <span className="text-muted-foreground">$ </span>
        buscar "{query}"
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Todavía no hay nada subido con ese nombre. Prueba con el código del ramo
        (MAT-201) o con el nombre del tema.
      </p>
      <button
        type="button"
        onClick={() => onQueryChange("")}
        className="label-mono mt-5 rounded-lg border border-halo/40 bg-halo/10 px-3 py-2 text-halo transition-colors hover:bg-halo/20"
      >
        limpiar búsqueda
      </button>
    </div>
  );
}
