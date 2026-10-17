import type { ReaCatalogEntry } from "@/components/blocks/rea/rea-catalog";
import type { ReaCommand } from "@/components/ui/rea/rea-command-palette";

// Contenido de muestra del sitio REA Atlas (site-concept.html v4). Los estados
// candidate / ilustrativo / concepto se conservan tal cual: no se declaran verificados.
export const DEMO_REA_ENTRIES: ReaCatalogEntry[] = [
  {
    id: "navigator",
    title: "SlideNavigator",
    category: "Componentes",
    collection: "FALP",
    meta: "FALP / COMPONENT · TSX CANDIDATE",
    keywords: "slide navigator navegación diapositivas teclado progreso control",
    details: [
      { key: "Tipo", value: "Componente React" },
      { key: "Fuente", value: "FALP · patrón documentado" },
      { key: "QA", value: "candidate · visual QA pendiente" },
      { key: "Archivo", value: "components/ui/rea/slide-navigator.tsx" },
    ],
    code: "# Registry no publicado; sustituir OWNER/REPO por el repositorio real.\npnpm dlx shadcn@latest add OWNER/REPO/slide-navigator",
  },
  {
    id: "tokens",
    title: "Color Foundations",
    category: "Tokens",
    collection: "FALP",
    meta: "FALP / TOKENS · DTCG SAMPLE",
    keywords: "paleta colores institucionales tokens azul amarillo semántica",
    details: [
      { key: "Tipo", value: "DTCG Tokens" },
      { key: "Fuente", value: "FALP · paleta documentada" },
      { key: "QA", value: "muestra de valores, sin componente React" },
      { key: "Archivo", value: "docs/origen/rea-atlas/reference/foundations.tokens.json" },
    ],
    code: "/* Ejemplo de consumo CSS tras adaptar tokens */\ncolor: var(--brand-color-primary);",
  },
  {
    id: "motion",
    title: "Card Hover Lift",
    category: "Movimiento",
    collection: "REA",
    meta: "REA / MOTION RECIPE · ILLUSTRATIVE",
    keywords: "animation hover lift motion receta transición easing",
    details: [
      { key: "Tipo", value: "Movimiento" },
      { key: "Fuente", value: "REA · receta de autoría ilustrativa" },
      { key: "QA", value: "no extraída ni verificada 1:1" },
      { key: "Archivo", value: "styles/rea.css (.rea-lift)" },
    ],
    code: '<article className="rea-lift">…</article>',
  },
  {
    id: "compare",
    title: "Source Comparator",
    category: "Conceptos",
    collection: "REA",
    meta: "REA / UX CONCEPT · NOT IMPLEMENTED",
    keywords: "compare comparar original reconstrucción qa visual inspector",
    details: [
      { key: "Tipo", value: "Concepto de producto" },
      { key: "Fuente", value: "REA · idea del sitio" },
      { key: "QA", value: "solo concepto" },
      { key: "Archivo", value: "— (propuesto)" },
    ],
    code: "// FUTURO: no existe una implementación aún.\ncompare(sourceCapture, implementationCapture);",
  },
];

export const DEMO_REA_COMMANDS: ReaCommand[] = [
  { id: "go-catalog", label: "Ir a muestras", hint: "01 · Sección" },
  { id: "go-inspector", label: "Abrir inspector", hint: "02 · Sección" },
  { id: "navigator", label: "SlideNavigator", hint: "FALP · Component", keywords: "diapositivas" },
  { id: "theme", label: "Alternar tema claro / oscuro", hint: "Apariencia" },
  { id: "accent", label: "Cambiar color de acento", hint: "Apariencia" },
  { id: "grid", label: "Mostrar / ocultar retícula", hint: "Alt + G" },
];

export const DEMO_REA_NAV = [
  { href: "#catalogo", label: "Muestras" },
  { href: "#colecciones", label: "Colecciones" },
  { href: "#metodo", label: "Método" },
  { href: "#inspector", label: "Inspector" },
];

export const DEMO_REA_SWATCHES = [
  { value: "#f4f4f0", label: "Fondo", ink: "#0e0e0d" },
  { value: "#0e0e0d", label: "Tinta" },
  { value: "#2f5bff", label: "Azul" },
  { value: "#ff5a1f", label: "Naranjo", ink: "#0e0e0d" },
  { value: "#c6f432", label: "Lima", ink: "#0e0e0d" },
];
