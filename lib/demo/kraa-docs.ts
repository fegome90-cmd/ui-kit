import type { DocumentItem } from "@/lib/kraa/kraa-model";

// Documentos ficticios para las vistas previas de Kraa.
export const DEMO_DOCUMENTS: DocumentItem[] = [
  {
    id: "d1",
    title: "Plan de lectura",
    excerpt: "Tres capítulos por semana y notas al margen.",
    author: "Ana Ruiz",
    initials: "AR",
    date: "12 oct",
    favorite: true,
  },
  {
    id: "d2",
    title: "Ideas sueltas",
    excerpt: "Cosas para revisar con calma.",
    author: "Leo Paz",
    initials: "LP",
    date: "9 oct",
  },
  { id: "d3", title: "Borrador de ensayo", excerpt: "Sobre ritmo y espacio en la página.", date: "2 oct" },
];
