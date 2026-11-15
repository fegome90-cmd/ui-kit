import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COMPONENTS } from "../component-registry";

describe("distribución del inspector", () => {
  it("publica núcleo y CSS junto al adaptador sin datos externos", () => {
    const entry = COMPONENTS.find((item) => item.slug === "rea-grid-overlay");
    expect(entry?.files).toContain("public/rea-grid-inspector/inspector.js");
    expect(entry?.files).toContain("public/rea-grid-inspector/inspector.css");
    expect(readFileSync("components/ui/rea/rea-grid-overlay.tsx", "utf8")).toContain(
      "@/public/rea-grid-inspector/inspector.js",
    );
    for (const demo of ["columns", "overflow"]) {
      const html = readFileSync(`public/rea-grid-inspector/${demo}.html`, "utf8");
      expect(html).toContain("sintétic");
      expect(html).toContain("./inspector.js");
      expect(html).not.toMatch(/https?:\/\//);
    }
    expect(readFileSync("public/rea-grid-inspector/inspector.css", "utf8")).toMatch(/@media print/);
  });
});
