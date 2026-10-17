// Reglas puras de scripts/capturar.mjs (skill capturar-diseno, compuertas G0 y G1). Viven aquí y no en el
// script para poder testearlas con vitest sin abrir un navegador.

/** Los dos viewports de G1. Siempre los mismos, para que las capturas sean comparables. */
export const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
] as const;
export type Viewport = (typeof VIEWPORTS)[number];

export const ACCIONES = ["hover", "focus", "click"] as const;
export type Accion = (typeof ACCIONES)[number];

/** Un estado observado: se provoca con una acción sobre un selector antes de capturar. */
export interface Estado {
  nombre: string;
  accion: Accion;
  selector: string;
}

/** Lee `nombre=accion:selector` (p. ej. `hover=hover:.btn-primary`). El selector puede llevar `:` y `=`. */
export function parseEstado(spec: string): Estado {
  const igual = spec.indexOf("=");
  const dos = spec.indexOf(":", igual + 1);
  if (igual <= 0 || dos < 0) throw new Error(`estado inválido «${spec}»: se espera nombre=accion:selector`);
  const nombre = slug(spec.slice(0, igual));
  const accion = spec.slice(igual + 1, dos);
  const selector = spec.slice(dos + 1).trim();
  if (!nombre || nombre === "reposo") throw new Error(`estado inválido «${spec}»: el nombre no puede ser «reposo»`);
  if (!ACCIONES.includes(accion as Accion))
    throw new Error(`estado inválido «${spec}»: la acción debe ser ${ACCIONES.join(", ")}`);
  if (!selector) throw new Error(`estado inválido «${spec}»: falta el selector`);
  return { nombre, accion: accion as Accion, selector };
}

/** Minúsculas, sin tildes, con guiones: apto para nombres de carpeta y archivo. */
export function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `<vista>--<estado>--<ancho>x<alto>.<ext>`, el nombre que espera la skill. */
export function nombreCaptura(vista: string, estado: string, vp: Viewport, ext = "png"): string {
  return `${slug(vista)}--${slug(estado)}--${vp.width}x${vp.height}.${ext}`;
}

/** Fecha AAAA-MM-DD en Santiago, que es la fecha que va en el nombre de la corrida. */
export function fechaSantiago(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(d);
}

const RUTA_LOGIN = /(^|[/._-])(log-?in|sign-?in|auth|sso|oauth|session)([/._?#-]|$)/i;

/**
 * G0: decide si la página está detrás de un muro de acceso. Devuelve el motivo, o null si se puede capturar.
 * Basta una señal: un 401/403, una URL final de login o un campo de contraseña visible.
 */
export function motivoBloqueo(p: { status: number | null; urlFinal: string; hayPassword: boolean }): string | null {
  if (p.status === 401 || p.status === 403) return `HTTP ${p.status}`;
  let ruta = p.urlFinal;
  try {
    const u = new URL(p.urlFinal);
    ruta = `${u.hostname}${u.pathname}`;
  } catch {}
  // Sin query ni hash: una redirección de login trae state, nonce o code_challenge, que no van a la evidencia.
  if (RUTA_LOGIN.test(ruta)) return `redirige a una página de acceso (${sinQuery(p.urlFinal)})`;
  if (p.hayPassword) return "la página pide contraseña";
  return null;
}

/** Una línea por archivo, en el mismo formato que `shasum -a 256` (se puede verificar con `shasum -c`). */
export function lineasSha256(hashes: ReadonlyArray<{ archivo: string; sha256: string }>): string {
  return [...hashes]
    .sort((a, b) => a.archivo.localeCompare(b.archivo))
    .map((h) => `${h.sha256}  ${h.archivo}\n`)
    .join("");
}

/** Para qué se usa una tipografía. Sale de la etiqueta del elemento que contiene el texto. */
export const ROLES = ["titular", "cuerpo", "interfaz", "otro"] as const;
export type Rol = (typeof ROLES)[number];

const TITULARES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const CUERPO = new Set(["p", "li", "blockquote", "dd", "dt", "td", "th", "figcaption", "caption", "cite", "q"]);
const INTERFAZ = new Set(["button", "a", "input", "label", "select", "option", "textarea", "summary", "legend"]);

/**
 * Selector CSS de los elementos que fijan un rol. El script busca con `closest()` el más cercano a cada texto, así
 * un `<span>` dentro de un `<h1>` cuenta como titular.
 */
export const SELECTOR_SEMANTICO = [
  ...TITULARES,
  ...INTERFAZ,
  ...CUERPO,
  "[role=heading]",
  "[role=button]",
  "[role=link]",
  "[role=tab]",
  "[role=menuitem]",
].join(",");

/** Rol de un elemento por su etiqueta y su atributo `role`. Lo ambiguo (span, div, strong…) queda como «otro». */
export function rolDe(tag: string, role: string | null = null): Rol {
  const t = tag.toLowerCase();
  if (TITULARES.has(t) || role === "heading") return "titular";
  if (INTERFAZ.has(t) || role === "button" || role === "link" || role === "tab" || role === "menuitem")
    return "interfaz";
  if (CUERPO.has(t)) return "cuerpo";
  return "otro";
}

/** Lo que el script lee de la página sobre tipografías (document.fonts, reglas @font-face y estilos computados). */
export interface TipografiasCrudas {
  caras: ReadonlyArray<{ family: string; weight: string; style: string; status: string }>;
  reglas: ReadonlyArray<{ family: string; src: string }>;
  /** Pila `font-family` computada y etiqueta de cada elemento visible con texto propio. */
  usadas: ReadonlyArray<{ pila: string; tag: string; role: string | null }>;
}

/** Una familia tipográfica observada. `licencia` la completa una persona en G0; el script nunca la adivina. */
export interface Tipografia {
  familia: string;
  pesos: string[];
  estilos: string[];
  archivos: string[];
  cargada: boolean;
  usada: boolean;
  /** Roles en que aparece (titular, cuerpo, interfaz, otro). Vacío si no la usa ningún texto visible. */
  roles: Rol[];
  licencia: string | null;
}

const GENERICAS = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "math",
  "emoji",
  "fangsong",
]);

const limpiarFamilia = (f: string) => f.trim().replace(/^["']|["']$/g, "");

/**
 * Quita query y hash: las URL firmadas de CDN pueden llevar tokens, y no deben quedar en la evidencia. Una fuente
 * embebida (`data:`) se resume, para no copiar el archivo entero al JSON.
 */
export function sinQuery(url: string): string {
  if (url.startsWith("data:")) return `${url.slice(0, url.search(/[;,]/))} (embebida)`;
  return url.replace(/[?#].*$/, "");
}

/** Primera familia de una pila `font-family` computada. */
export function primeraFamilia(pila: string): string {
  return limpiarFamilia(pila.split(",")[0] ?? "");
}

/**
 * Agrupa por familia lo observado en la página. Las genéricas (sans-serif, system-ui…) no cuentan: no hay archivo
 * ni licencia que revisar. Una familia usada que no se cargó es una fuente del sistema del que capturó.
 */
export function resumirTipografias(c: TipografiasCrudas): Tipografia[] {
  const por = new Map<string, Tipografia>();
  const de = (family: string) => {
    const familia = limpiarFamilia(family);
    const clave = familia.toLowerCase();
    if (!familia || GENERICAS.has(clave)) return null;
    let t = por.get(clave);
    if (!t) {
      t = { familia, pesos: [], estilos: [], archivos: [], cargada: false, usada: false, roles: [], licencia: null };
      por.set(clave, t);
    }
    return t;
  };
  const agregar = (lista: string[], v: string) => {
    if (v && !lista.includes(v)) lista.push(v);
  };
  for (const cara of c.caras) {
    const t = de(cara.family);
    if (!t || cara.status !== "loaded") continue;
    t.cargada = true;
    agregar(t.pesos, cara.weight);
    agregar(t.estilos, cara.style);
  }
  for (const regla of c.reglas) {
    const t = de(regla.family);
    if (!t) continue;
    for (const m of regla.src.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) agregar(t.archivos, sinQuery(m[1]));
  }
  for (const u of c.usadas) {
    const t = de(primeraFamilia(u.pila));
    if (!t) continue;
    t.usada = true;
    const rol = rolDe(u.tag, u.role);
    if (!t.roles.includes(rol)) t.roles.push(rol);
  }
  for (const t of por.values()) {
    t.pesos.sort();
    t.estilos.sort();
    t.roles.sort(porRol);
  }
  return [...por.values()].sort((a, b) => a.familia.localeCompare(b.familia));
}

/**
 * Archivos de fuente que la página pidió por red, sin query ni duplicados. Cuenta toda petición de tipo `font`
 * (aunque no tenga extensión, como las de Typekit) y cualquier otra con extensión de fuente: hay sitios que bajan
 * el archivo con `fetch` y lo registran con la API `FontFace`. Cubre además las `@font-face` de hojas de otro
 * origen, que el navegador no deja leer.
 */
export function archivosDeFuentes(pedidas: ReadonlyArray<{ url: string; tipo: string }>): string[] {
  const fuentes = pedidas
    .filter((p) => p.tipo === "font" || /\.(woff2?|ttf|otf|eot)([?#]|$)/i.test(p.url))
    .map((p) => sinQuery(p.url));
  return [...new Set(fuentes)].sort();
}

/** Suma lo de otra vista a la corrida sin perder la `licencia` que alguien ya anotó a mano. */
export function fusionarTipografias(
  previas: ReadonlyArray<Tipografia>,
  nuevas: ReadonlyArray<Tipografia>,
): Tipografia[] {
  const por = new Map(previas.map((t) => [t.familia.toLowerCase(), structuredClone(t)]));
  for (const n of nuevas) {
    const p = por.get(n.familia.toLowerCase());
    if (!p) {
      por.set(n.familia.toLowerCase(), structuredClone(n));
      continue;
    }
    p.pesos = [...new Set([...p.pesos, ...n.pesos])].sort();
    p.estilos = [...new Set([...p.estilos, ...n.estilos])].sort();
    p.archivos = [...new Set([...p.archivos, ...n.archivos])];
    p.cargada ||= n.cargada;
    p.usada ||= n.usada;
    p.roles = [...new Set([...(p.roles ?? []), ...n.roles])].sort(porRol);
  }
  return [...por.values()].sort((a, b) => a.familia.localeCompare(b.familia));
}

const porRol = (a: Rol, b: Rol) => ROLES.indexOf(a) - ROLES.indexOf(b);

/**
 * Qué familias cubre cada rol, para que G2 proponga tokens por rol (titular, cuerpo, interfaz) en vez de una lista
 * suelta. Un rol vacío significa que ese texto usa una familia genérica o del sistema.
 */
export function rolesTipograficos(familias: ReadonlyArray<Tipografia>): Record<Rol, string[]> {
  const r = Object.fromEntries(ROLES.map((rol) => [rol, [] as string[]])) as Record<Rol, string[]>;
  for (const t of familias) for (const rol of t.roles ?? []) r[rol].push(t.familia);
  return r;
}

/**
 * Estilos computados que pueden ser enormes o llevar datos: un `data:` (imagen o textura embebida) se resume y una
 * URL pierde query y hash. Lo demás se corta en `max` caracteres.
 */
export function recortarValor(valor: string, max = 300): string {
  const v = valor.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (_, u: string) => `url("${sinQuery(u)}")`);
  return v.length > max ? `${v.slice(0, max)}… (+${v.length - max})` : v;
}
