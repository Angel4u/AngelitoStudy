import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { FeaturedVideo } from "@/components/sections/featured-video";
import { Hero } from "@/components/sections/hero";
import { NotesTable } from "@/components/sections/notes-table";
import { SubjectGrid } from "@/components/sections/subject-grid";
import {
  matchesQuery,
  notes as allNotes,
  subjects as allSubjects,
} from "@/data/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "AngelitoStudy — Videos y apuntes para sobrevivir a Ingeniería Civil Informática",
      },
      {
        name: "description",
        content:
          "Repositorio ordenado de clases grabadas y apuntes en PDF para estudiantes de Ingeniería Civil Informática: Cálculo Multivariable, Física, Estructuras de Datos, Programación Dinámica y Desarrollo Web.",
      },
      {
        property: "og:title",
        content: "AngelitoStudy — tu ángel de la guarda para los ramos",
      },
      {
        property: "og:description",
        content:
          "Videos resolviendo ejercicios y apuntes descargables, ordenados por ramo. Sin registro, sin rellenos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_CL" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "AngelitoStudy — videos y apuntes por ramo",
      },
      {
        name: "twitter:description",
        content:
          "Clases grabadas y PDFs resueltos para sobrevivir a la carrera de Ingeniería Civil Informática.",
      },
    ],
  }),
  component: Index,
});

const suggestions = [
  "Lagrange",
  "Gauss",
  "recursividad",
  "árboles",
  "hooks",
];

function Index() {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search field, like a dev tool.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable)
        return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const matchedSubjects = useMemo(
    () =>
      allSubjects.filter((subject) =>
        matchesQuery(query, [
          subject.title,
          subject.code,
          subject.blurb,
          subject.term,
          ...subject.tags,
        ]),
      ),
    [query],
  );

  const matchedNotes = useMemo(
    () =>
      allNotes.filter((note) =>
        matchesQuery(query, [
          note.title,
          note.subjectTitle,
          note.subjectCode,
          note.kind,
        ]),
      ),
    [query],
  );

  const isSearching = query.trim().length > 0;
  const totalMatches = matchedSubjects.length + matchedNotes.length;

  const resultLabel = isSearching
    ? totalMatches === 0
      ? `sin coincidencias para "${query.trim()}"`
      : `${totalMatches} coincidencia${totalMatches === 1 ? "" : "s"} · ${matchedSubjects.length} ramo${matchedSubjects.length === 1 ? "" : "s"} · ${matchedNotes.length} PDF${matchedNotes.length === 1 ? "" : "s"}`
    : `${allSubjects.length} ramos · ${allNotes.length} PDFs listos para descargar`;

  return (
    <main id="top" className="min-h-dvh bg-background">
      <Hero
        query={query}
        onQueryChange={setQuery}
        suggestions={suggestions}
        resultLabel={resultLabel}
      />

      <FeaturedVideo visible={!isSearching} />

      <SubjectGrid
        items={matchedSubjects}
        query={query}
        onQueryChange={setQuery}
      />

      <NotesTable items={matchedNotes} query={query} onQueryChange={setQuery} />
    </main>
  );
}
