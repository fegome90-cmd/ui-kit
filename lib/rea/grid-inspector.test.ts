import { describe, expect, it } from "vitest";
import { measureBox, measureDistance } from "../../public/rea-grid-inspector/inspector.js";

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
