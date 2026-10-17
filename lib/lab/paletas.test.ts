import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contraste, PALETAS, PALETAS_LAB, ROLES_COLOR } from "./paletas";

const css = readFileSync("styles/lab.css", "utf8");

/** Variables --lab-* declaradas en el bloque de una paleta (la neutra está en `.lab {`). */
function bloque(paleta: string): Record<string, string> {
  const selector = paleta === "neutral" ? ".lab {" : `.lab[data-lab-palette="${paleta}"] {`;
  const inicio = css.indexOf(selector);
  expect(inicio, `falta el bloque de ${paleta} en styles/lab.css`).toBeGreaterThan(-1);
  const cuerpo = css.slice(inicio, css.indexOf("}", inicio));
  return Object.fromEntries([...cuerpo.matchAll(/--lab-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

describe("paletas de Lab", () => {
  it("contraste WCAG conocido", () => {
    expect(contraste("#ffffff", "#000000")).toBeCloseTo(21);
    expect(contraste("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });

  it.each(PALETAS_LAB)("%s: styles/lab.css repite exactamente los valores de los datos", (paleta) => {
    const declarado = bloque(paleta);
    for (const rol of ROLES_COLOR)
      expect(declarado[rol], `${paleta} --lab-${rol}`).toBe(PALETAS[paleta].colores[rol].hex);
  });

  it.each(PALETAS_LAB)("%s: texto y marcas cumplen AA", (paleta) => {
    const c = Object.fromEntries(ROLES_COLOR.map((r) => [r, PALETAS[paleta].colores[r].hex]));
    expect(contraste(c.ink, c.surface), "tinta").toBeGreaterThanOrEqual(4.5);
    expect(contraste(c.ink, c.bg), "tinta sobre fondo").toBeGreaterThanOrEqual(4.5);
    expect(contraste(c.muted, c.surface), "atenuado").toBeGreaterThanOrEqual(4.5);
    expect(contraste(c.muted, c.bg), "atenuado sobre fondo").toBeGreaterThanOrEqual(4.5);
    expect(contraste(c["on-ink"], c.ink), "texto sobre tinta").toBeGreaterThanOrEqual(4.5);
    expect(contraste(c.accent, c.surface), "acento como marca").toBeGreaterThanOrEqual(3);
  });

  it("cada valor que no es propio dice de dónde sale", () => {
    for (const p of PALETAS_LAB)
      for (const r of ROLES_COLOR) {
        const color = PALETAS[p].colores[r];
        if (color.origen === "derivado") expect(color.nota, `${p} ${r}`).toBeTruthy();
      }
  });
});
