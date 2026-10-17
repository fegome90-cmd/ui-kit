// Colores con significado para Lab: estados (Carbon: informational, success, warning, error) y una paleta
// categórica (Voices from the Frontlines: los fondos de sus cinco capítulos, medidos). styles/lab.css
// repite estos valores; un test exige que coincidan y que el texto llegue a 4,5:1.
// Regla de uso: un estado se dice con texto o ícono además del color (Carbon y Atlassian lo exigen).

export const ESTADOS = ["info", "success", "warning", "danger"] as const;
export type Estado = (typeof ESTADOS)[number];

/** Texto/ícono (`fg`) y fondo suave (`soft`) de cada estado. Valores propios de Lab. */
export const ESTADOS_COLOR: Record<"claro" | "oscuro", Record<Estado, { fg: string; soft: string }>> = {
  claro: {
    info: { fg: "#1d5bd8", soft: "#e3ecfd" },
    success: { fg: "#17703a", soft: "#dcf3e3" },
    warning: { fg: "#8a5a00", soft: "#fff1cc" },
    danger: { fg: "#c42b1c", soft: "#fde3e0" },
  },
  oscuro: {
    info: { fg: "#7fb0ff", soft: "#14244a" },
    success: { fg: "#5fd08b", soft: "#0f3320" },
    warning: { fg: "#f2c14e", soft: "#3a2c08" },
    danger: { fg: "#ff8a80", soft: "#45161a" },
  },
};

/** Paletas de Lab con superficie oscura: usan los estados oscuros. */
export const PALETAS_OSCURAS = ["bioage", "paradigm"] as const;

/**
 * Categóricas: fondos de los capítulos de Voices, en su orden. `texto` es el que da AA sobre ese fondo
 * (Voices usa el color de otro capítulo, que no siempre llega a 4,5:1).
 */
export const CATEGORICAS = [
  { hex: "#e6503c", texto: "#000000" },
  { hex: "#068076", texto: "#ffffff" },
  { hex: "#001480", texto: "#ffffff" },
  { hex: "#fbd236", texto: "#000000" },
  { hex: "#f5a8c1", texto: "#000000" },
] as const;
