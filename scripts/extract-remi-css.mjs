// Extrae de los estilos de REMI (app/globals.css + app/ui-kit.css del monitor) solo
// las reglas que alcanzan a los componentes genéricos copiados aquí, y las encierra
// bajo `.remi` para que sus resets (*, body, button…) no choquen con Tailwind ni Kraa.
//
// Criterio: un selector se conserva si todas sus clases pertenecen a los componentes
// REMI o al banco (cb-*). Un selector que exige un contenedor del monitor (p. ej.
// `.filters .filter-cell`) tampoco aplicaba en el banco original, así que se descarta.
//
// Uso: node scripts/extract-remi-css.mjs styles/remi-source.css styles/remi-kit-source.css > styles/remi.css
import { readFileSync } from "node:fs";

const KEEP = new Set(
  `action-blue action-cluster action-green action-red attend-button blue-button dark-button dark-button-icon
  filter-cell filter-count filter-layered has-count fld fld-calendar fld-chevron fld-control fld-date fld-unit
  is-placeholder icon icon-plus mini-button pager range-summary soft-button status-tab status-tabs
  status-triangle switch-field switch-text switch-thumb switch-track tool-buttons update-time cell-items qr
  visually-hidden is-active is-done`.split(/\s+/),
);
const allowed = (cls) => KEEP.has(cls) || cls.startsWith("icon-") || cls.startsWith("cb-");

/** Divide CSS en nodos {prelude, body} respetando llaves anidadas. */
function parse(css) {
  const nodes = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    nodes.push({ prelude, body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return nodes;
}

function scope(sel) {
  const s = sel.trim();
  if (/^(:root|html|body)\b/.test(s)) return s.replace(/^(:root|html|body)/, ".remi");
  return `.remi ${s}`;
}

function keepSelector(sel) {
  const classes = [...sel.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]);
  return classes.every(allowed);
}

function render(nodes, indent = "") {
  const out = [];
  for (const { prelude, body } of nodes) {
    if (prelude.startsWith("@keyframes")) continue; // se agregan al final si se usan
    if (prelude.startsWith("@media") || prelude.startsWith("@supports")) {
      const inner = render(parse(body), `${indent}  `);
      if (inner) out.push(`${indent}${prelude} {\n${inner}\n${indent}}`);
      continue;
    }
    if (prelude.startsWith("@")) continue;
    const sels = prelude.split(",").filter((s) => s.trim() && keepSelector(s));
    if (!sels.length) continue;
    const decls = body
      .split(/;(?![^(]*\))/)
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => `${indent}  ${d.replace(/\s+/g, " ")};`)
      .join("\n");
    out.push(`${indent}${sels.map(scope).join(`,\n${indent}`)} {\n${decls}\n${indent}}`);
  }
  return out.join("\n");
}

const all = process.argv
  .slice(2)
  .map((f) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""))
  .join("\n");
const nodes = parse(all);
let css = render(nodes);
for (const { prelude, body } of nodes) {
  const name = prelude.match(/^@keyframes\s+([\w-]+)/)?.[1];
  if (name && new RegExp(`\\b${name}\\b`).test(css)) css += `\n${prelude} {${body}}`;
}
process.stdout.write(
  `/* Extraído una vez de los estilos del monitor REMI (globals.css + ui-kit.css) con\n   scripts/extract-remi-css.mjs. Desde aquí se mantiene a mano. Medidas originales a 1920×1080. */\n${css}\n`,
);
