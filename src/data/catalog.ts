/**
 * AngelitoStudy content catalog.
 *
 * Everything the UI renders lives here and is typed. This file is the single
 * seam to swap for a CMS / database later: keep the interfaces, replace the
 * literal arrays with a fetch (server function, Supabase table, Sanity, ...)
 * and the components keep working unchanged.
 */

export type Accent = "halo" | "gold";

export type SubjectCode =
  | "MAT-201"
  | "FIS-102"
  | "ICC-204"
  | "ICC-305"
  | "WEB-210";

export interface Subject {
  id: string;
  code: SubjectCode;
  title: string;
  blurb: string;
  /** Semesters / terms the subject spans, e.g. "2º semestre". */
  term: string;
  videos: number;
  notes: number;
  accent: Accent;
  tags: string[];
}

export type NoteKind = "Guía" | "Apuntes" | "Resumen" | "Ayudantía";

export interface NoteResource {
  id: string;
  title: string;
  subjectCode: SubjectCode;
  subjectTitle: string;
  kind: NoteKind;
  /** Page count of the PDF, shown as metadata. */
  pages: number;
  /** File size in kilobytes. */
  sizeKb: number;
  /** ISO date of the last upload. */
  updated: string;
  /** Points at the stored file; swap for a signed URL when a CMS is wired. */
  href: string;
}

export interface FeaturedVideo {
  id: string;
  eyebrow: string;
  title: string;
  series: string;
  durationLabel: string;
  publishedLabel: string;
  watchUrl: string;
  /** Absolute URL of the poster frame shown before the embed loads. */
  poster: string;
}

export interface SocialLink {
  id: "youtube" | "github" | "twitch" | "email";
  label: string;
  handle: string;
  href: string;
}

export const subjects: Subject[] = [
  {
    id: "calculo-multivariable",
    code: "MAT-201",
    title: "Cálculo Multivariable",
    blurb:
      "Derivadas parciales, gradientes, multiplicadores de Lagrange y las integrales triples que aprueban o hunden el semestre.",
    term: "2º semestre",
    videos: 18,
    notes: 7,
    accent: "halo",
    tags: ["gradiente", "jacobbiano", "campos", "integrales triples"],
  },
  {
    id: "fisica",
    code: "FIS-102",
    title: "Física",
    blurb:
      "Mecánica y electromagnetismo resueltos en la pizarra: diagrama de cuerpo libre, ley de Gauss y circuitos sin sustos.",
    term: "1º semestre",
    videos: 24,
    notes: 11,
    accent: "gold",
    tags: ["mecánica", "electricidad", "magnetismo", "ondas"],
  },
  {
    id: "estructuras-de-datos",
    code: "ICC-204",
    title: "Estructuras de Datos",
    blurb:
      "Árboles, heaps, tablas de hash y grafos implementados línea a línea, con su análisis de complejidad en voz alta.",
    term: "3º semestre",
    videos: 21,
    notes: 9,
    accent: "halo",
    tags: ["árboles", "heaps", "hash", "grafos", "big-o"],
  },
  {
    id: "programacion-dinamica",
    code: "ICC-305",
    title: "Programación Dinámica (C / C++)",
    blurb:
      "Del caso base a la tabla: cómo detectar subproblemas superpuestos y escribir la recurrencia en C/C++ sin memoria de más.",
    term: "4º semestre",
    videos: 14,
    notes: 6,
    accent: "gold",
    tags: ["recurrencia", "memoización", "mochila", "punteros"],
  },
  {
    id: "desarrollo-web",
    code: "WEB-210",
    title: "Desarrollo Web (React)",
    blurb:
      "Componentes, estado, hooks y despliegue. Construir interfaces que no se caigan cuando el profesor las abre en vivo.",
    term: "5º semestre",
    videos: 16,
    notes: 5,
    accent: "halo",
    tags: ["hooks", "estado", "routing", "accesibilidad"],
  },
];

export const notes: NoteResource[] = [
  {
    id: "guia-3-recursividad",
    title: "Resolución Guía 3 — Recursividad",
    subjectCode: "ICC-305",
    subjectTitle: "Programación Dinámica (C / C++)",
    kind: "Guía",
    pages: 22,
    sizeKb: 1840,
    updated: "2026-09-21",
    href: "/downloads/resolucion-guia-3-recursividad.pdf",
  },
  {
    id: "apuntes-lagrange",
    title: "Apuntes — Multiplicadores de Lagrange",
    subjectCode: "MAT-201",
    subjectTitle: "Cálculo Multivariable",
    kind: "Apuntes",
    pages: 14,
    sizeKb: 1120,
    updated: "2026-09-18",
    href: "/downloads/apuntes-lagrange.pdf",
  },
  {
    id: "ayudantia-gauss",
    title: "Ayudantía — Ley de Gauss paso a paso",
    subjectCode: "FIS-102",
    subjectTitle: "Física",
    kind: "Ayudantía",
    pages: 9,
    sizeKb: 760,
    updated: "2026-09-14",
    href: "/downloads/ayudantia-ley-de-gauss.pdf",
  },
  {
    id: "resumen-arboles-b",
    title: "Resumen — Árboles B y B+",
    subjectCode: "ICC-204",
    subjectTitle: "Estructuras de Datos",
    kind: "Resumen",
    pages: 7,
    sizeKb: 540,
    updated: "2026-09-09",
    href: "/downloads/resumen-arboles-b.pdf",
  },
  {
    id: "guia-1-mochila",
    title: "Resolución Guía 1 — Problema de la Mochila",
    subjectCode: "ICC-305",
    subjectTitle: "Programación Dinámica (C / C++)",
    kind: "Guía",
    pages: 16,
    sizeKb: 1310,
    updated: "2026-09-02",
    href: "/downloads/resolucion-guia-1-mochila.pdf",
  },
  {
    id: "apuntes-hooks",
    title: "Apuntes — Hooks y renderizado en React",
    subjectCode: "WEB-210",
    subjectTitle: "Desarrollo Web (React)",
    kind: "Apuntes",
    pages: 12,
    sizeKb: 980,
    updated: "2026-08-27",
    href: "/downloads/apuntes-hooks-react.pdf",
  },
];

export const featuredVideo: FeaturedVideo = {
  id: "ultima-clase",
  eyebrow: "Última clase subida",
  title: "Cálculo Multivariable · Integrales triples con cambios de orden",
  series: "Serie: Sobreviviendo a MAT-201",
  durationLabel: "48:12",
  publishedLabel: "hace 2 días",
  watchUrl: "https://www.youtube.com/watch?v=REPLACE_WITH_REAL_VIDEO_ID",
  poster: "",
};

export const socialLinks: SocialLink[] = [
  {
    id: "youtube",
    label: "YouTube",
    handle: "@angelitostudy",
    href: "https://www.youtube.com/@angelitostudy",
  },
  {
    id: "github",
    label: "GitHub",
    handle: "/angelitostudy",
    href: "https://github.com/angelitostudy",
  },
  {
    id: "twitch",
    label: "Twitch",
    handle: "/angelitostudy",
    href: "https://www.twitch.tv/angelitostudy",
  },
  {
    id: "email",
    label: "Correo",
    handle: "hola@angelitostudy.dev",
    href: "mailto:hola@angelitostudy.dev",
  },
];

/** Small helper so search + formatting stay consistent across sections. */
export function formatFileSize(sizeKb: number): string {
  return sizeKb >= 1024
    ? `${(sizeKb / 1024).toFixed(1)} MB`
    : `${sizeKb} KB`;
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Normalizes text for the hero search (accents and case insensitive). */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesQuery(query: string, parts: string[]): boolean {
  const needle = normalize(query.trim());
  if (!needle) return true;
  return parts.some((part) => normalize(part).includes(needle));
}
