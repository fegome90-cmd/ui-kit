import { describe, expect, it } from "vitest";
import {
  compareBoxSnapshots,
  createBoxSnapshot,
  measureBox,
  measureDistance,
} from "../../public/rea-grid-inspector/inspector.js";

describe("geometría local del inspector", () => {
  it.each([NaN, Infinity, -Infinity, 0, -1])("rechaza dimensión local inválida %s", (width) => {
    expect(() =>
      measureBox(
        { left: 0, top: 0, width: 100, height: 100 },
        { left: 0, top: 0, width: 10, height: 10 },
        { width, height: 100 },
      ),
    ).toThrow(RangeError);
  });
  it.each([0.5, 1, 1.75, 2])("escala/zoom %s y scroll no cambian coordenadas locales", (scale) => {
    const slide = { left: -100, top: 75, width: 960 * scale, height: 540 * scale };
    const m = measureBox(
      slide,
      { left: -100 + 48 * scale, top: 75 + 54 * scale, width: 240 * scale, height: 108 * scale },
      { width: 960, height: 540 },
    );
    expect(m).toMatchObject({
      x: 48,
      y: 54,
      width: 240,
      height: 108,
      percent: { x: 5, y: 10, width: 25, height: 20 },
      edges: { left: 48, top: 54, right: 672, bottom: 378 },
      overflow: false,
    });
  });
  it("conserva desborde y distancias firmadas con escala no uniforme", () => {
    const m = measureBox(
      { left: 0, top: 0, width: 480, height: 540 },
      { left: -10, top: 500, width: 500, height: 80 },
      { width: 960, height: 540 },
    );
    expect(m.overflow).toBe(true);
    expect(m.x).toBeCloseTo(-20);
    expect(m.width).toBeCloseTo(1000);
    expect(m.edges.right).toBeCloseTo(-20);
    expect(m.edges.bottom).toBeCloseTo(-40);
  });
  it("rechaza diapositivas sin tamaño y calcula separación entre bordes", () => {
    expect(() =>
      measureBox(
        { left: 0, top: 0, width: 0, height: 10 },
        { left: 0, top: 0, width: 1, height: 1 },
        { width: 10, height: 10 },
      ),
    ).toThrow(RangeError);
    const rect = { left: 0, top: 0, width: 100, height: 100 };
    const size = { width: 100, height: 100 };
    const a = measureBox(rect, { left: 0, top: 0, width: 10, height: 10 }, size);
    const distance = measureDistance(a, measureBox(rect, { left: 13, top: 14, width: 10, height: 10 }, size));
    expect(distance.horizontal).toBeCloseTo(3);
    expect(distance.vertical).toBeCloseTo(4);
    expect(distance.distance).toBeCloseTo(5);
    expect(measureDistance(a, a).distance).toBe(0);
  });
});

describe("referencias históricas de caja", () => {
  it("copia valores inmutables y no conserva el objeto original", () => {
    const box = { x: 10, y: 20, width: 30, height: 40 };
    const size = { width: 100, height: 200 };
    const snapshot = createBoxSnapshot(box, size, "Título", "2026-11-16T00:00:00Z");
    box.x = 999;
    size.width = 999;
    expect(snapshot).toMatchObject({
      pixels: { x: 10 },
      percent: { y: 10 },
      size: { width: 100 },
      label: "Título",
      timestamp: "2026-11-16T00:00:00Z",
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.pixels)).toBe(true);
    expect(Object.isFrozen(snapshot.percent)).toBe(true);
    expect(Object.isFrozen(snapshot.size)).toBe(true);
  });
  it("compara actual menos referencia en px y puntos porcentuales, no gap", () => {
    const size = { width: 100, height: 200 };
    const reference = createBoxSnapshot({ x: 10, y: 20, width: 30, height: 40 }, size);
    const current = createBoxSnapshot({ x: 5, y: 30, width: 50, height: 20 }, size);
    expect(compareBoxSnapshots(reference, current)).toEqual({
      sameSize: true,
      pixels: { x: -5, y: 10, width: 20, height: -20 },
      percent: { x: -5, y: 5, width: 20, height: -10 },
    });
  });
  it("no entrega delta px entre tamaños distintos aunque coincidan porcentajes", () => {
    const a = createBoxSnapshot({ x: 10, y: 20, width: 30, height: 40 }, { width: 100, height: 200 });
    const b = createBoxSnapshot({ x: 20, y: 40, width: 60, height: 80 }, { width: 200, height: 400 });
    expect(compareBoxSnapshots(a, b)).toEqual({
      sameSize: false,
      pixels: null,
      percent: { x: 0, y: 0, width: 0, height: 0 },
    });
  });
  it.each([NaN, Infinity, 0, -1])("rechaza tamaño inválido %s", (width) => {
    expect(() => createBoxSnapshot({ x: 0, y: 0, width: 10, height: 10 }, { width, height: 100 })).toThrow(RangeError);
  });
});
