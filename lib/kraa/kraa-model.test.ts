import { describe, expect, it } from "vitest";
import {
  DEFAULT_TYPOGRAPHY,
  type DocumentItem,
  filterDocuments,
  normalizeTypography,
  type TypographyConfig,
  typographyFontSize,
} from "./kraa-model";

// Portado de tests/model.test.mjs del paquete Kraa original.
describe("normalizeTypography", () => {
  it("corrige entradas inválidas y fuera de rango", () => {
    expect(normalizeTypography({ size: Number.NaN, lineHeight: Number.POSITIVE_INFINITY, width: Number.NaN })).toEqual(
      DEFAULT_TYPOGRAPHY,
    );
    expect(normalizeTypography({ size: 300 }).size).toBe(40);
    expect(normalizeTypography({ width: -10 }).width).toBe(320);
    expect(normalizeTypography({ lineHeight: 0.1 }).lineHeight).toBe(1.2);
    const bogus = { font: "unknown", mode: "unknown" } as unknown as Partial<TypographyConfig>;
    expect(normalizeTypography(bogus).font).toBe("inter");
    expect(normalizeTypography(bogus).mode).toBe("static");
  });
});

describe("filterDocuments", () => {
  const docs: DocumentItem[] = [
    { id: "a", title: "Tipografía", excerpt: "Ritmo", author: "Ana" },
    { id: "b", title: "Movimiento" },
  ];
  it("busca en título, extracto y autor sin distinguir tildes ni mayúsculas", () => {
    expect(filterDocuments(docs, "tipografia").map((x) => x.id)).toEqual(["a"]);
    expect(filterDocuments(docs, " ANA ").map((x) => x.id)).toEqual(["a"]);
  });
  it("consulta vacía devuelve todo; sin coincidencias devuelve vacío", () => {
    expect(filterDocuments(docs, "")).toHaveLength(2);
    expect(filterDocuments(docs, "inexistente")).toHaveLength(0);
    expect(filterDocuments([], "a")).toHaveLength(0);
  });
  it("no muta los documentos", () => {
    filterDocuments(docs, "ana");
    expect(docs[0]).toEqual({ id: "a", title: "Tipografía", excerpt: "Ritmo", author: "Ana" });
  });
});

describe("typographyFontSize", () => {
  it("la escala fluida nunca fija un mínimo mayor que el tamaño pedido", () => {
    expect(typographyFontSize({ ...DEFAULT_TYPOGRAPHY, size: 12, mode: "fluid" })).toBe("clamp(12px, 1.2vw, 12px)");
    expect(typographyFontSize({ ...DEFAULT_TYPOGRAPHY, size: 16, mode: "static" })).toBe("16px");
  });
});
