import { describe, expect, it } from "vitest";
import {
  colorCategoria,
  escala,
  extension,
  marcas,
  marcasEje,
  polar,
  sectores,
  tramoLog,
  trazoArea,
  trazoLinea,
  trazoSuave,
} from "./graficos";

describe("geometría de gráficos", () => {
  it("escala lineal, invertida y con dominio de ancho cero", () => {
    const y = escala(0, 100, 200, 0);
    expect(y(0)).toBe(200);
    expect(y(25)).toBe(150);
    expect(escala(5, 5, 0, 10)(5)).toBe(5);
  });

  it("extension ignora no finitos", () => {
    expect(extension([3, Number.NaN, -2, 8])).toEqual([-2, 8]);
    expect(extension([])).toEqual([0, 1]);
  });

  it("trazoLinea y trazoSuave pasan por cada punto", () => {
    const pts: [number, number][] = [
      [0, 10],
      [10, 0],
      [20, 10],
    ];
    expect(trazoLinea(pts)).toBe("M0 10L10 0L20 10");
    const d = trazoSuave(pts);
    expect(d.startsWith("M0 10")).toBe(true);
    expect(d).toContain(" 10 0C");
    expect(d.endsWith(" 20 10")).toBe(true);
    expect(trazoSuave(pts, 0)).toBe(trazoLinea(pts));
  });

  it("la curva suave no inventa picos fuera del rango de cada tramo", () => {
    const d = trazoSuave([
      [0, 50],
      [10, 0],
      [20, 0],
      [30, 50],
    ]);
    const ys = [...d.matchAll(/C([\d.]+) ([\d.-]+) ([\d.]+) ([\d.-]+)/g)].flatMap((m) => [+m[2], +m[4]]);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(50);
  });

  it("trazoArea cierra hasta la línea base", () => {
    expect(
      trazoArea(
        [
          [0, 5],
          [10, 2],
        ],
        20,
      ),
    ).toBe("M0 5L10 2L10 20L0 20Z");
    expect(trazoArea([], 0)).toBe("");
  });

  it("marcas redondas que cubren el rango", () => {
    expect(marcas(0, 100)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(marcas(0.3, 0.9, 3)).toEqual([0.4, 0.6, 0.8]);
    expect(marcas(5, 5)).toEqual([5]);
  });

  it("sectores iguales con hueco y polar desde las 12", () => {
    const s = sectores(4, 0);
    expect(s[0].inicio).toBe(0);
    expect(s[3].fin).toBeCloseTo(2 * Math.PI);
    expect(polar(50, 50, 10, 0)).toEqual([50, 40]);
    expect(polar(50, 50, 10, Math.PI / 2)).toEqual([60, 50]);
  });

  it("marcasEje cubre todo el dato (el eje no corta la serie)", () => {
    expect(marcas(0, 38, 4)).toEqual([0, 10, 20, 30]);
    expect(marcasEje(0, 38, 4)).toEqual([0, 10, 20, 30, 40]);
    expect(marcasEje(3, 37, 4)).toEqual([0, 10, 20, 30, 40]);
    expect(marcasEje(0, 40, 4)).toEqual([0, 10, 20, 30, 40]);
  });

  it("colorCategoria no repite el color entre la última y la primera de la rueda", () => {
    expect(Array.from({ length: 6 }, (_, i) => colorCategoria(i, 6))).toEqual([1, 2, 3, 4, 5, 2]);
    expect(Array.from({ length: 5 }, (_, i) => colorCategoria(i, 5))).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from({ length: 8 }, (_, i) => colorCategoria(i, 8))).toEqual([1, 2, 3, 4, 5, 1, 2, 3]);
  });

  it("tramoLog sigue los cortes de la leyenda de Voices, con signo", () => {
    expect([0, 50, 100, 999, 1000, 9999, 10_000, 99_999, 100_000, 5_000_000].map(tramoLog)).toEqual([
      0, 1, 2, 2, 3, 3, 4, 4, 5, 5,
    ]);
    expect(tramoLog(-1500)).toBe(-3);
    expect(tramoLog(Number.NaN)).toBe(0);
  });
});
