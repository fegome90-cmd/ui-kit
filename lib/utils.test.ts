import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("conserva el tamaño propio junto a un color", () => {
    expect(cn("text-rea-step-4 text-transparent", "text-rea-ink")).toBe("text-rea-step-4 text-rea-ink");
  });
  it("sigue resolviendo conflictos reales", () => {
    expect(cn("px-2 text-sm", "px-4 text-rea-step-2")).toBe("px-4 text-rea-step-2");
    expect(cn("bg-rea-ink", "bg-rea-bg")).toBe("bg-rea-bg");
  });
});
