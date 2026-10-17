import { describe, expect, it } from "vitest";
import { clamp, fold, matchesQuery, pad2 } from "./rea-utils";

describe("utilidades REA", () => {
  it("fold quita tildes, mayúsculas y espacios", () => {
    expect(fold("  Navegación ÁGIL ")).toBe("navegacion agil");
  });
  it("matchesQuery busca en todos los textos y acepta la consulta vacía", () => {
    expect(matchesQuery("diapositiva", "SlideNavigator", "Navegación de diapositivas")).toBe(true);
    expect(matchesQuery("TOKENS", undefined, "tokens de color")).toBe(true);
    expect(matchesQuery("", "lo que sea")).toBe(true);
    expect(matchesQuery("inexistente", "SlideNavigator")).toBe(false);
  });
  it("pad2 y clamp", () => {
    expect(pad2(3)).toBe("03");
    expect(pad2(42.4)).toBe("42");
    expect(pad2(-1)).toBe("00");
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-2, 0, 3)).toBe(0);
  });
});
