import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES, COMPONENTS, FAMILIES } from "./component-registry";

const listSources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return listSources(path);
    return /\.(tsx?)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [path] : [];
  });

describe("registro del banco de componentes", () => {
  it("slugs únicos", () => {
    const slugs = COMPONENTS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("cada archivo citado existe", () => {
    for (const c of COMPONENTS) for (const f of c.files) expect(existsSync(f), `${c.slug}: ${f}`).toBe(true);
  });
  it("cada categoría y cada familia tienen al menos un componente", () => {
    for (const cat of CATEGORIES)
      expect(
        COMPONENTS.some((c) => c.category === cat),
        cat,
      ).toBe(true);
    for (const fam of FAMILIES)
      expect(
        COMPONENTS.some((c) => c.family === fam),
        fam,
      ).toBe(true);
  });
  // El banco es la documentación viva: un módulo sin entrada quedaría invisible.
  it("todo módulo de components/ui y components/blocks aparece en alguna entrada", () => {
    const cited = new Set(COMPONENTS.flatMap((c) => c.files));
    const missing = [...listSources("components/ui"), ...listSources("components/blocks")].filter((f) => !cited.has(f));
    expect(missing).toEqual([]);
  });
});
