import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contraste, PALETAS, PALETAS_LAB } from "./paletas";
import { CATEGORICAS, ESTADOS, ESTADOS_COLOR, PALETAS_OSCURAS } from "./semantica";

const css = readFileSync("styles/lab.css", "utf8");
const oscura = (p: string) => (PALETAS_OSCURAS as readonly string[]).includes(p);

describe("estados y categóricas de Lab", () => {
  it("styles/lab.css declara cada estado y categoría con el valor de los datos", () => {
    for (const tema of ["claro", "oscuro"] as const)
      for (const e of ESTADOS) {
        expect(css, `${tema} ${e}`).toContain(`--lab-${e}: ${ESTADOS_COLOR[tema][e].fg};`);
        expect(css, `${tema} ${e}-soft`).toContain(`--lab-${e}-soft: ${ESTADOS_COLOR[tema][e].soft};`);
      }
    CATEGORICAS.forEach((c, i) => {
      expect(css).toContain(`--lab-cat-${i + 1}: ${c.hex};`);
      expect(css).toContain(`--lab-cat-${i + 1}-text: ${c.texto};`);
    });
    for (const p of PALETAS_OSCURAS) expect(css).toContain(`.lab[data-lab-palette="${p}"]`);
  });

  it.each(PALETAS_LAB)(
    "%s: el texto de cada estado llega a 4,5:1 sobre su fondo suave, la superficie y el fondo",
    (p) => {
      const tema = oscura(p) ? "oscuro" : "claro";
      const { surface, bg } = PALETAS[p].colores;
      for (const e of ESTADOS) {
        const { fg, soft } = ESTADOS_COLOR[tema][e];
        expect(contraste(fg, soft), `${e} sobre suave`).toBeGreaterThanOrEqual(4.5);
        expect(contraste(fg, surface.hex), `${e} sobre superficie`).toBeGreaterThanOrEqual(4.5);
        expect(contraste(fg, bg.hex), `${e} sobre fondo`).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it("cada categoría lleva el texto de mayor contraste y llega a 4,5:1", () => {
    for (const c of CATEGORICAS) {
      const otro = c.texto === "#000000" ? "#ffffff" : "#000000";
      expect(contraste(c.texto, c.hex), c.hex).toBeGreaterThanOrEqual(4.5);
      expect(contraste(c.texto, c.hex)).toBeGreaterThan(contraste(otro, c.hex));
    }
  });
});
