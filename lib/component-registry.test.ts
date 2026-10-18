import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES, COMPONENTS, FAMILIES, GROUPS, groupOf, provenanceOf, statusOf } from "./component-registry";

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
  it("cada categoría está en exactamente un grupo, y los grupos siguen el orden de CATEGORIES", () => {
    const enGrupos = GROUPS.flatMap((g) => [...g.categories]);
    expect([...enGrupos].sort()).toEqual([...CATEGORIES].sort());
    expect(new Set(enGrupos).size).toBe(enGrupos.length);
    expect(new Set(GROUPS.map((g) => g.id)).size).toBe(GROUPS.length);
    for (const g of GROUPS) {
      const orden = g.categories.map((c) => CATEGORIES.indexOf(c));
      expect(orden, g.id).toEqual([...orden].sort((a, b) => a - b));
    }
    expect(groupOf("Gráficos").id).toBe("datos");
  });
  it("un candidato dice en notes qué le falta", () => {
    for (const c of COMPONENTS.filter((c) => statusOf(c) === "candidate"))
      expect(c.notes?.length, c.slug).toBeGreaterThan(0);
  });
  // Sin código ni DOM no hay fidelidad comprobada: no puede declararse estable.
  it("lo reconstruido desde capturas o inferido es candidato", () => {
    const loose = COMPONENTS.filter(
      (c) => ["observed-image", "inferred"].includes(provenanceOf(c)) && statusOf(c) !== "candidate",
    );
    expect(loose.map((c) => c.slug)).toEqual([]);
  });
  // El banco es la documentación viva: un módulo sin entrada quedaría invisible.
  it("todo módulo de components/ui y components/blocks aparece en alguna entrada", () => {
    const cited = new Set(COMPONENTS.flatMap((c) => c.files));
    const missing = [...listSources("components/ui"), ...listSources("components/blocks")].filter((f) => !cited.has(f));
    expect(missing).toEqual([]);
  });
});
