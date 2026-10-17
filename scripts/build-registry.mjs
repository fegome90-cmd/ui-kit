// Genera registry.json (formato shadcn) desde lib/component-registry.ts, que sigue siendo la
// única fuente: cada entrada del banco es un item instalable con `npx shadcn add <url>`.
// Después `shadcn build` produce public/r/<item>.json, que Next sirve en /r/<item>.json.
//
// Decisiones:
// - Dependencias npm y registryDependencies salen de los imports reales de cada archivo,
//   así el registry no puede desalinearse del código.
// - Los target conservan la subcarpeta de la familia (@ui/rea/…, @components/blocks/rea/…,
//   @lib/rea/…) para que los imports "@/components/ui/rea/…" sigan resolviendo tras instalar.
// - Cada familia trae un item <familia>-tokens con su CSS como archivo (styles/<familia>.css).
//   No se convierte a cssVars/css: el CSS usa @theme inline sobre tokens acotados, @layer base
//   con media queries y @utility, y llega tal cual. El mensaje `docs` indica el @import.
// - cn() va como item propio (ui-kit-utils): extiende tailwind-merge con las escalas
//   tipográficas de las familias; el `utils` estándar de shadcn las descartaría.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { COMPONENTS, provenanceOf, statusOf } from "../lib/component-registry.ts";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const versions = { ...pkg.dependencies, ...pkg.devDependencies };

/** Paquetes npm que el proyecto que instala ya tiene (o que no deben forzarse). */
const PROVIDED = new Set(["react", "react-dom", "next"]);

const THEMES = {
  REMI: { css: ["styles/remi.css"], deps: [], imports: ['@import "../styles/remi.css";'] },
  Ninja: {
    css: ["styles/ninja.css"],
    deps: ["@fontsource-variable/hanken-grotesk"],
    imports: ['@import "@fontsource-variable/hanken-grotesk";', '@import "../styles/ninja.css";'],
  },
  Kraa: {
    css: ["styles/kraa-theme.css", "styles/kraa-fonts.css"],
    deps: [],
    imports: ['@import "../styles/kraa-theme.css";', '@import "../styles/kraa-fonts.css";'],
  },
  REA: {
    css: ["styles/rea.css"],
    deps: ["@fontsource-variable/geist", "@fontsource-variable/geist-mono"],
    imports: [
      '@import "@fontsource-variable/geist";',
      '@import "@fontsource-variable/geist-mono";',
      '@import "../styles/rea.css";',
    ],
  },
  Lab: {
    css: ["styles/lab.css"],
    deps: ["@fontsource/bebas-neue"],
    imports: ['@import "@fontsource/bebas-neue";', '@import "../styles/lab.css";'],
  },
};

const themeName = (family) => `${family.toLowerCase()}-tokens`;

// Las dependencias entre items van con namespace: un nombre suelto se buscaría en el registry
// oficial de shadcn. Cada proyecto mapea @ui-kit a la URL del banco en su components.json.
const NS = "@ui-kit";
const ref = (name) => `${NS}/${name}`;

// Módulos de lib que se publican como items propios (los datos de demo no se publican).
const LIB_ITEMS = {
  "lib/utils.ts": {
    name: "ui-kit-utils",
    title: "cn() de UI Kit",
    description: "clsx + tailwind-merge con las escalas tipográficas de las familias.",
  },
  "lib/kraa/kraa-model.ts": {
    name: "kraa-model",
    title: "Modelo Kraa",
    description: "Tipos y normalización de documentos y tipografía de Kraa.",
  },
  "lib/rea/rea-utils.ts": {
    name: "rea-utils",
    title: "Utilidades REA",
    description: "Búsqueda sin tildes, pad2 y clamp.",
  },
  "lib/lab/graficos.ts": {
    name: "lab-graficos",
    title: "Geometría de gráficos Lab",
    description: "Escalas, trazos suaves, marcas y sectores para los gráficos de Lab.",
  },
  "lib/lab/semantica.ts": {
    name: "lab-semantica",
    title: "Estados y categóricas Lab",
    description: "Colores de estado (claro y oscuro) y paleta categórica.",
  },
  "lib/lab/paletas.ts": {
    name: "lab-paletas",
    title: "Paletas Lab",
    description: "Paletas medidas por rol, con su origen, y contraste WCAG.",
  },
  "lib/lab/encodings.ts": {
    name: "lab-encodings",
    title: "Codificaciones Lab",
    description: "Longitud, área (radio por raíz) y arco (parte del total) para comparar magnitudes.",
  },
  "lib/rea/use-reduced-motion.ts": {
    name: "rea-use-reduced-motion",
    title: "useReducedMotion",
    description: "Sigue prefers-reduced-motion (fail-closed: asume reducido hasta medir).",
  },
};

const isComponentFile = (f) => /^components\/(ui|blocks)\//.test(f);
const fileType = (f) => (f.startsWith("components/blocks/") ? "registry:block" : "registry:ui");
const fileTarget = (f) =>
  f.startsWith("components/ui/")
    ? `@ui/${f.slice("components/ui/".length)}`
    : f.startsWith("components/blocks/")
      ? `@components/${f.slice("components/".length)}`
      : `@lib/${f.slice("lib/".length)}`;

/** Resuelve "@/x/y" o "./y" (desde `from`) a la ruta del archivo del repo. */
function resolveImport(spec, from) {
  let base;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith("./") || spec.startsWith("../")) {
    const parts = from.split("/").slice(0, -1);
    for (const seg of spec.split("/")) {
      if (seg === "..") parts.pop();
      else if (seg !== ".") parts.push(seg);
    }
    base = parts.join("/");
  } else return null;
  for (const ext of [".tsx", ".ts"]) {
    try {
      readFileSync(base + ext);
      return base + ext;
    } catch {}
  }
  throw new Error(`No se resuelve el import "${spec}" desde ${from}`);
}

const pkgName = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

/** Imports de un archivo: paquetes npm y archivos internos. */
function scan(file) {
  const src = readFileSync(file, "utf8");
  const specs = [...src.matchAll(/(?:^|\n)\s*import\s[^;]*?from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const npm = new Set();
  const local = new Set();
  for (const s of specs) {
    const r = resolveImport(s, file);
    if (r) local.add(r);
    else npm.add(pkgName(s));
  }
  return { npm, local };
}

// Qué item publica cada archivo de componente: la primera entrada del banco que lo cita.
const owner = new Map();
for (const c of COMPONENTS) for (const f of c.files) if (isComponentFile(f) && !owner.has(f)) owner.set(f, c.slug);

/**
 * package.json instalado de un paquete, buscando node_modules hacia arriba como Node: un worktree de git
 * sin dependencias propias usa las del checkout que lo contiene.
 */
function installedPackageJson(name) {
  for (let dir = resolve("."); ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name, "package.json");
    if (existsSync(candidate)) return candidate;
    if (dirname(dir) === dir) throw new Error(`${name} no está instalado (npm install)`);
  }
}

// Versión instalada (la que pasó los tests), no el rango de package.json.
const withVersion = (name) => {
  if (!versions[name]) throw new Error(`Dependencia ${name} sin declarar en package.json`);
  const installed = JSON.parse(readFileSync(installedPackageJson(name), "utf8")).version;
  return `${name}@${installed}`;
};

function itemFor(name, files, family) {
  const npm = new Set();
  const regDeps = new Set();
  for (const f of files) {
    const { npm: n, local } = scan(f);
    for (const p of n) if (!PROVIDED.has(p)) npm.add(p);
    for (const l of local) {
      if (files.includes(l)) continue;
      if (LIB_ITEMS[l]) regDeps.add(LIB_ITEMS[l].name);
      else if (owner.has(l)) regDeps.add(owner.get(l));
      else throw new Error(`${f} importa ${l}, que no está publicado en ningún item`);
    }
  }
  if (family) regDeps.add(themeName(family));
  regDeps.delete(name);
  return {
    dependencies: [...npm].sort().map(withVersion),
    registryDependencies: [...regDeps].sort().map(ref),
  };
}

const items = [];

// Utilidades y modelos de lib.
for (const [file, meta] of Object.entries(LIB_ITEMS)) {
  const deps = itemFor(meta.name, [file], null);
  items.push({
    name: meta.name,
    type: "registry:lib",
    title: meta.title,
    description: meta.description,
    ...deps,
    files: [{ path: file, type: "registry:lib", target: fileTarget(file) }],
  });
}

// Temas por familia.
for (const [family, theme] of Object.entries(THEMES)) {
  items.push({
    name: themeName(family),
    type: "registry:theme",
    title: `Tema ${family}`,
    description: `Tokens, reset acotado y utilidades de la familia ${family}.`,
    dependencies: theme.deps.map(withVersion),
    files: theme.css.map((f) => ({ path: f, type: "registry:file", target: `~/${f}` })),
    // El CLI deja los archivos en ~/styles; la ruta del @import es relativa al CSS global.
    docs: `Importa el tema una vez en tu CSS global, después de @import "tailwindcss". Desde app/globals.css:\n${theme.imports.join("\n")}`,
  });
}

// Un item por entrada del banco. meta lleva la madurez y la procedencia al proyecto que instala.
for (const c of COMPONENTS) {
  const meta = { status: statusOf(c), provenance: provenanceOf(c) };
  const files = c.files.filter(isComponentFile);
  if (!files.length) {
    // Recetas que viven solo en el tema (p. ej. rea-hover-lift): el item instala el tema.
    items.push({
      name: c.slug,
      type: "registry:item",
      title: c.name,
      description: c.description,
      registryDependencies: [ref(themeName(c.family))],
      files: [],
      meta,
    });
    continue;
  }
  items.push({
    name: c.slug,
    type: files.some((f) => f.startsWith("components/blocks/")) ? "registry:block" : "registry:ui",
    title: c.name,
    description: c.description,
    categories: [c.family.toLowerCase(), c.category.toLowerCase()],
    ...itemFor(c.slug, files, c.family),
    files: files.map((f) => ({ path: f, type: fileType(f), target: fileTarget(f) })),
    meta,
  });
}

const names = items.map((i) => i.name);
const dup = names.filter((n, i) => names.indexOf(n) !== i);
if (dup.length) throw new Error(`Items duplicados: ${dup.join(", ")}`);

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "ui-kit",
  // Sin URL pública todavía: el banco sirve /r/<item>.json desde el mismo origen.
  homepage: "http://localhost:3000/componentes",
  items,
};
writeFileSync("registry.json", `${JSON.stringify(registry, null, 2)}\n`);
console.log(`build-registry: ${items.length} items`);
