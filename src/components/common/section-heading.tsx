import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Monospace comment marker rendered before the title, e.g. "// ramos" */
  marker: string;
  title: string;
  description?: string;
  /** Right-aligned meta text, hidden on small screens. */
  meta?: string;
  className?: string;
  id?: string;
}

export function SectionHeading({
  marker,
  title,
  description,
  meta,
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn("grid gap-3 sm:flex sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <span className="label-mono text-halo/70">{marker}</span>
        <h2
          id={id}
          className="mt-1 font-mono text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {meta ? (
        <span className="label-mono shrink-0 text-muted-foreground/70 sm:pb-1">
          {meta}
        </span>
      ) : null}
    </div>
  );
}
