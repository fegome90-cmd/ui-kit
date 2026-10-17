// Paletas de Lab: la neutra propia y una por referencia, medidas con Playwright sobre los sitios vivos
// (evidencia/2026-10-17-*, relevamiento por área y por texto). Cada rol dice de dónde sale:
// medido (el valor está en el sitio), derivado (composición de valores medidos, p. ej. un color al 80 %
// sobre la superficie) o propio (Lab). styles/lab.css repite estos valores; un test exige que coincidan.

export const ROLES_COLOR = [
  "bg",
  "surface",
  "ink",
  "on-ink",
  "muted",
  "line",
  "accent",
  "accent-soft",
  "context",
] as const;
export type RolColor = (typeof ROLES_COLOR)[number];

export type Origen = "medido" | "derivado" | "propio";
export interface Color {
  hex: string;
  origen: Origen;
  nota?: string;
}

export const PALETAS_LAB = ["neutral", "bioage", "meridian", "paradigm", "voices"] as const;
export type PaletaLab = (typeof PALETAS_LAB)[number];

const m = (hex: string, nota?: string): Color => ({ hex, origen: "medido", nota });
const d = (hex: string, nota: string): Color => ({ hex, origen: "derivado", nota });
const p = (hex: string): Color => ({ hex, origen: "propio" });

export const PALETAS: Record<PaletaLab, { nombre: string; fuente: string; colores: Record<RolColor, Color> }> = {
  neutral: {
    nombre: "Neutra",
    fuente: "Lab",
    colores: {
      bg: p("#f6f7f9"),
      surface: p("#ffffff"),
      ink: p("#14171c"),
      "on-ink": p("#ffffff"),
      muted: p("#5b6270"),
      line: p("#dfe3ea"),
      accent: p("#1d5bd8"),
      "accent-soft": p("#e3ecfd"),
      context: p("#b9c0cc"),
    },
  },
  bioage: {
    nombre: "BioAge",
    fuente: "bioagelabs.com/platform",
    colores: {
      bg: m("#1c0835", "fondo de página"),
      surface: d("#342059", "gradiente #57438f al 40 % sobre el fondo"),
      ink: m("#ffffff"),
      "on-ink": d("#1c0835", "el fondo, sobre la tinta blanca"),
      muted: m("#c0b3d0", "texto secundario"),
      line: d("#503f70", "blanco al 14 % sobre la superficie"),
      accent: m("#a56cff", "acento violeta; 4,1:1 sobre la superficie: para marcas, no para texto"),
      "accent-soft": d("#462c74", "acento al 16 % sobre la superficie"),
      context: d("#655383", "texto secundario al 35 % sobre la superficie"),
    },
  },
  meridian: {
    nombre: "Meridian",
    fuente: "meridian-ai.com",
    colores: {
      bg: m("#f7f7f7"),
      surface: m("#ffffff"),
      ink: m("#1e1e1e"),
      "on-ink": m("#ffffff"),
      muted: d("#4b4b4b", "tinta al 80 % de opacidad, como la usa el sitio"),
      line: d("#e1e9e8", "verde #07483d al 12 %"),
      accent: m("#07483d", "verde profundo"),
      "accent-soft": m("#c6e0d9", "menta del degradado del hero"),
      context: d("#b5c8c5", "verde al 30 %"),
    },
  },
  paradigm: {
    nombre: "Paradigm",
    fuente: "paradigm-solutions.io",
    colores: {
      bg: m("#010e16"),
      surface: m("#01121e"),
      ink: m("#e5e8ec"),
      "on-ink": m("#01121e"),
      muted: d("#9ca4aa", "tinta al 68 % sobre la superficie"),
      line: d("#1a2a35", "blanco al 10 %, como sus bordes de vidrio"),
      accent: m("#139bfd", "cian del gradiente; el azul de texto #1863dc da 3,5:1 y no alcanza"),
      "accent-soft": d("#042842", "acento al 16 % sobre la superficie"),
      context: d("#3a4852", "tinta al 25 %"),
    },
  },
  voices: {
    nombre: "Voices from the Frontlines",
    fuente: "africa.climatemobility.org",
    colores: {
      bg: m("#f3efe9", "crema"),
      surface: m("#ffffff"),
      ink: m("#000000"),
      "on-ink": m("#ffffff"),
      muted: d("#575757", "negro al 66 %"),
      line: d("#e8dce1", "burdeos #5c072b al 14 %"),
      accent: m("#a5104f", "magenta"),
      "accent-soft": d("#f1d9e3", "magenta al 16 %"),
      context: d("#d1bac4", "burdeos al 28 %"),
    },
  },
};

/** Contraste WCAG entre dos colores hex (#rrggbb). */
export function contraste(a: string, b: string): number {
  const lum = (h: string) => {
    const [r, g, bl] = [1, 3, 5]
      .map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((p1, p2) => p2 - p1);
  return (x + 0.05) / (y + 0.05);
}
