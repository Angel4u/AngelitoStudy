import { Download, FileText } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import {
  formatDate,
  formatFileSize,
  notes,
  type NoteResource,
} from "@/data/catalog";

interface NotesTableProps {
  items: NoteResource[];
  query: string;
  onQueryChange: (value: string) => void;
}

export function NotesTable({ items, query, onQueryChange }: NotesTableProps) {
  return (
    <section
      id="apuntes"
      aria-labelledby="apuntes-title"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
    >
      <SectionHeading
        id="apuntes-title"
        marker="// apuntes descargables"
        title="PDFs listos para la última noche"
        description="Guías resueltas, resúmenes y ayudantías en PDF. Se descargan directo, sin registro y sin rellenos."
        meta={`${items.length} archivos`}
      />

      <div className="mt-7 overflow-hidden rounded-2xl border border-line bg-panel shadow-panel">
        <div
          aria-hidden
          className="hidden grid-cols-[minmax(0,1fr)_9rem_7rem_6rem_auto] gap-4 border-b border-line bg-ink/40 px-5 py-3 sm:grid"
        >
          {["archivo", "ramo", "páginas", "peso", ""].map((label, index) => (
            <span key={index} className="label-mono text-muted-foreground">
              {label}
            </span>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              sin resultados para "{query}"
            </p>
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="label-mono mt-4 rounded-lg border border-line px-3 py-2 text-foreground transition-colors hover:border-halo/45 hover:text-halo"
            >
              ver todos los apuntes
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((note) => (
              <li key={note.id}>
                <a
                  href={note.href}
                  download
                  className="group grid min-w-0 grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-panel-2/70 focus-visible:bg-panel-2/70 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_6rem_auto] sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <FileText
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-halo/70 transition-colors group-hover:text-halo"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {note.title}
                      </p>
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                        {note.kind} · actualizado {formatDate(note.updated)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:block">
                    <span className="label-mono text-xs text-muted-foreground sm:hidden">
                      ramo:{" "}
                    </span>
                    <span className="label-mono truncate text-xs text-gold/90">
                      {note.subjectCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:block">
                    <span className="label-mono text-xs text-muted-foreground sm:hidden">
                      páginas:{" "}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {note.pages} pág.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:block">
                    <span className="label-mono text-xs text-muted-foreground sm:hidden">
                      peso:{" "}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatFileSize(note.sizeKb)}
                    </span>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-2 justify-self-start rounded-lg border border-line px-3 py-2 font-mono text-xs text-muted-foreground transition-all duration-200 group-hover:border-halo/45 group-hover:bg-halo/10 group-hover:text-halo sm:justify-self-end">
                    <Download className="size-3.5" aria-hidden />
                    pdf
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 font-mono text-xs text-muted-foreground/80">
        ¿Falta la resolución de tu guía?{" "}
        <a
          href="mailto:hola@angelitostudy.dev"
          className="text-halo underline decoration-halo/40 underline-offset-4 transition-colors hover:decoration-halo"
        >
          avísame
        </a>{" "}
        y la subo esta semana.
      </p>
    </section>
  );
}

