// Copia el código de los componentes a un JSON para la pestaña "Código" del banco.
// Se ejecuta antes de dev, build y typecheck, así la página no lee el disco en
// tiempo de ejecución (Vercel no empaqueta el repo).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIRS = ["components/ui", "components/blocks", "lib/kraa", "lib/rea", "styles"];
const FILES = ["lib/utils.ts"];
// Fuentes .ts/.tsx/.css; los tests (.test.ts y .test.tsx) no son código del componente.
// kraa-fonts.css es una fuente embebida (430 KB): no aporta como código y engordaría el JSON.
const SKIP = new Set(["kraa-fonts.css"]);
const isSource = (f) => /\.(tsx?|css)$/.test(f) && !/\.test\.tsx?$/.test(f) && !SKIP.has(f);

const out = {};
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (isSource(entry.name)) out[path] = readFileSync(path, "utf8");
  }
};
for (const dir of DIRS) walk(dir);
for (const f of FILES) out[f] = readFileSync(f, "utf8");
mkdirSync("lib/generated", { recursive: true });
writeFileSync("lib/generated/sources.json", JSON.stringify(out, null, 0));
console.log(`gen-sources: ${Object.keys(out).length} archivos`);
