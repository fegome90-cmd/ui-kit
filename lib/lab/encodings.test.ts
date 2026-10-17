import { describe, expect, it } from "vitest";
import { arcos, longitudes, radios, trazoArco } from "./encodings";

const datos = [
  { label: "A", value: 20 },
  { label: "B", value: 80 },
];

describe("codificaciones de Lab", () => {
  it("longitud compara con el mayor", () => {
    expect(longitudes(datos)).toEqual([0.25, 1]);
  });

  it("área: el área del círculo es proporcional al valor, no el radio", () => {
    const [a, b] = radios(datos);
    expect(b).toBe(1);
    expect(a).toBeCloseTo(0.5);
    expect((a * a) / (b * b)).toBeCloseTo(0.25);
  });

  it("arco: parte del total, contigua desde las 12 y cerrando la vuelta", () => {
    const r = arcos(datos);
    expect(r.map((x) => x.parte)).toEqual([0.2, 0.8]);
    expect(r[0].inicio).toBe(0);
    expect(r[1].inicio).toBeCloseTo(r[0].fin);
    expect(r[1].fin).toBeCloseTo(2 * Math.PI);
  });

  it("negativos, NaN y todo en cero no rompen nada", () => {
    const raros = [
      { label: "x", value: -5 },
      { label: "y", value: Number.NaN },
    ];
    expect(longitudes(raros)).toEqual([0, 0]);
    expect(radios(raros)).toEqual([0, 0]);
    expect(arcos(raros).map((x) => x.parte)).toEqual([0, 0]);
  });

  it("trazoArco dibuja un sector y una vuelta completa sin colapsar", () => {
    expect(trazoArco(50, 50, 40, 20, 0, Math.PI / 2)).toBe("M50 10A40 40 0 0 1 90 50L70 50A20 20 0 0 0 50 30Z");
    const vuelta = trazoArco(50, 50, 40, 20, 0, 2 * Math.PI);
    expect(vuelta).toContain(" 1 1 ");
    expect(vuelta).not.toMatch(/NaN/);
  });
});
