// Captura evidencia de una fuente de diseño autorizada (skill capturar-diseno, compuertas G0 y G1).
//
//   node scripts/capturar.mjs --fuente atlas --url https://… [--vista home] [--estado hover=hover:.btn]…
//        [--dom ".btn, .card"] [--pagina-completa] [--autoriza "quién y para qué"] [--licencia "MIT"]
//   node scripts/capturar.mjs --fuente kraa-figma --imagen ruta/a/captura.png [--vista home]
//
// Escribe en evidencia/<AAAA-MM-DD>-<fuente>/ (gitignored): captures/, dom/, evidence.json y SHA256SUMS.
// Correrlo otra vez con la misma fuente el mismo día agrega vistas (otras rutas, otras imágenes) a la corrida:
// cada captura guarda su propio origen y evidence.json lista todos en `fuentes`.
//
// Decisiones:
// - Contexto de navegador nuevo, sin storageState: nunca usa ni guarda la sesión del usuario. Si la página
//   pide login (401/403, URL de acceso o campo de contraseña), marca blocked-auth, no captura y sale con 2.
// - Por cada viewport y estado recarga la página, para que un estado no arrastre al siguiente.
// - El DOM es opcional y acotado: bounds y una lista fija de estilos computados de los elementos visibles
//   que matchean --dom, más las variables CSS de :root. Nada de valores de formularios.
// - Las tipografías se leen siempre (en reposo, en cada viewport): familias cargadas por document.fonts, archivos
//   de las reglas @font-face y familias usadas por el texto visible. Van a dom/<vista>--tipografias.json y,
//   resumidas, a evidence.json con `licencia: null` para que G0 la complete. Las URL van sin query ni hash.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";
import {
  fechaSantiago,
  fusionarTipografias,
  lineasSha256,
  motivoBloqueo,
  nombreCaptura,
  parseEstado,
  resumirTipografias,
  slug,
  VIEWPORTS,
} from "../lib/captura.ts";

const ESTILOS = [
  "color",
  "background-color",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "border-radius",
  "border",
  "padding",
  "gap",
  "box-shadow",
];
const MAX_ELEMENTOS = 20;

const { values: args } = parseArgs({
  options: {
    fuente: { type: "string" },
    url: { type: "string" },
    imagen: { type: "string" },
    vista: { type: "string", default: "pagina" },
    estado: { type: "string", multiple: true, default: [] },
    dom: { type: "string" },
    "pagina-completa": { type: "boolean", default: false },
    autoriza: { type: "string" },
    licencia: { type: "string" },
    salida: { type: "string", default: "evidencia" },
  },
});

function fallar(msg) {
  console.error(`capturar: ${msg}`);
  process.exit(1);
}

if (!args.fuente || !slug(args.fuente)) fallar("falta --fuente <slug>");
if (Boolean(args.url) === Boolean(args.imagen)) fallar("usa --url o --imagen (uno de los dos)");
const estados = args.estado.map((e) => {
  try {
    return parseEstado(e);
  } catch (err) {
    return fallar(err.message);
  }
});
if (args.imagen && (estados.length || args.dom)) fallar("--estado y --dom solo aplican a --url");

const dir = join(args.salida, `${fechaSantiago()}-${slug(args.fuente)}`);
const rutaEvidencia = join(dir, "evidence.json");
mkdirSync(join(dir, "captures"), { recursive: true });

const evidencia = existsSync(rutaEvidencia)
  ? JSON.parse(readFileSync(rutaEvidencia, "utf8"))
  : { fuentes: [], autoriza: null, licencia: null, fecha: fechaSantiago(), estado: "ok", capturas: [] };
const fuente = args.url ? { kind: "url", uri: args.url } : { kind: "image", uri: args.imagen };
if (!evidencia.fuentes.some((f) => f.kind === fuente.kind && f.uri === fuente.uri)) evidencia.fuentes.push(fuente);
evidencia.autoriza = args.autoriza ?? evidencia.autoriza;
evidencia.licencia = args.licencia ?? evidencia.licencia;

const sha256 = (ruta) => createHash("sha256").update(readFileSync(ruta)).digest("hex");

function registrar(archivo, datos) {
  evidencia.capturas = evidencia.capturas.filter((c) => c.archivo !== archivo);
  evidencia.capturas.push({
    archivo,
    fuente,
    ...datos,
    capturadaEn: new Date().toISOString(),
    sha256: sha256(join(dir, archivo)),
  });
}

function cerrar() {
  const hashes = ["captures", "dom"]
    .filter((sub) => existsSync(join(dir, sub)))
    .flatMap((sub) => readdirSync(join(dir, sub)).map((f) => `${sub}/${f}`))
    .map((archivo) => ({ archivo, sha256: sha256(join(dir, archivo)) }));
  writeFileSync(join(dir, "SHA256SUMS"), lineasSha256(hashes));
  writeFileSync(rutaEvidencia, `${JSON.stringify(evidencia, null, 2)}\n`);
}

if (args.imagen) {
  if (!existsSync(args.imagen)) fallar(`no existe ${args.imagen}`);
  // El original va tal cual, sin recomprimir.
  const archivo = `captures/${slug(args.vista)}--original--${slug(basename(args.imagen, extname(args.imagen)))}${extname(args.imagen).toLowerCase()}`;
  copyFileSync(args.imagen, join(dir, archivo));
  registrar(archivo, {
    vista: slug(args.vista),
    estado: "original",
    viewport: null,
    desconocido: ["dom", "tamaños CSS", "responsive", "focus", "interacciones"],
  });
  cerrar();
  console.log(`capturar: imagen guardada en ${dir}`);
  process.exit(0);
}

/** Lee en la página lo necesario para resumirTipografias. Las hojas de otro origen sin CORS no se pueden leer. */
async function leerTipografias(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const caras = [...document.fonts].map((f) => ({
      family: f.family,
      weight: f.weight,
      style: f.style,
      status: f.status,
    }));
    const reglas = [];
    let hojasIlegibles = 0;
    for (const hoja of document.styleSheets) {
      let reglasHoja;
      try {
        reglasHoja = hoja.cssRules;
      } catch {
        hojasIlegibles++;
        continue;
      }
      const base = hoja.href ?? location.href;
      for (const r of reglasHoja) {
        if (!(r instanceof CSSFontFaceRule)) continue;
        const src = r.style.getPropertyValue("src");
        const absoluto = src.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (_, u) => `url("${new URL(u, base).href}")`);
        reglas.push({ family: r.style.getPropertyValue("font-family"), src: absoluto });
      }
    }
    const usadas = new Set();
    for (const el of document.body.querySelectorAll("*")) {
      const conTexto = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (conTexto && el.checkVisibility()) usadas.add(getComputedStyle(el).fontFamily);
    }
    return { caras, reglas, usadas: [...usadas], hojasIlegibles };
  });
}

delete evidencia.incompleta;
const browser = await chromium.launch(
  process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
);
let codigo = 0;
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const estado of [null, ...estados]) {
      const resp = await page.goto(args.url, { waitUntil: "networkidle" });
      const bloqueo = motivoBloqueo({
        status: resp?.status() ?? null,
        urlFinal: page.url(),
        hayPassword: await page
          .locator("input[type=password]:visible")
          .count()
          .then((n) => n > 0),
      });
      if (bloqueo) {
        evidencia.estado = "blocked-auth";
        evidencia.bloqueo = bloqueo;
        console.error(`capturar: blocked-auth (${bloqueo}). No se captura nada.`);
        codigo = 2;
        break;
      }
      if (!estado) {
        const { hojasIlegibles, ...crudas } = await leerTipografias(page);
        const archivoTipos = `dom/${slug(args.vista)}--tipografias.json`;
        const rutaTipos = join(dir, archivoTipos);
        const previas = existsSync(rutaTipos) ? JSON.parse(readFileSync(rutaTipos, "utf8")).familias : [];
        const familias = fusionarTipografias(previas, resumirTipografias(crudas));
        mkdirSync(join(dir, "dom"), { recursive: true });
        writeFileSync(rutaTipos, `${JSON.stringify({ vista: slug(args.vista), hojasIlegibles, familias }, null, 2)}\n`);
        evidencia.tipografias = fusionarTipografias(evidencia.tipografias ?? [], familias);
        if (hojasIlegibles)
          console.warn(
            `capturar: ${hojasIlegibles} hoja(s) de estilo de otro origen no se pudieron leer (@font-face incompleto)`,
          );
      }
      const nombreEstado = estado?.nombre ?? "reposo";
      if (estado) {
        const el = page.locator(estado.selector).first();
        if ((await el.count()) === 0) throw new Error(`el estado «${estado.nombre}» no encontró «${estado.selector}»`);
        await el[estado.accion]();
        await page.waitForTimeout(300);
      }
      const archivo = `captures/${nombreCaptura(args.vista, nombreEstado, vp)}`;
      await page.screenshot({ path: join(dir, archivo), fullPage: args["pagina-completa"], animations: "disabled" });
      const datos = { vista: slug(args.vista), estado: nombreEstado, viewport: { ...vp, dpr: 1 } };
      if (args.dom) {
        mkdirSync(join(dir, "dom"), { recursive: true });
        const dom = await page.evaluate(
          ({ selector, estilos, max }) => {
            const raiz = getComputedStyle(document.documentElement);
            const variables = Object.fromEntries(
              [...raiz].filter((p) => p.startsWith("--")).map((p) => [p, raiz.getPropertyValue(p).trim()]),
            );
            const elementos = [...document.querySelectorAll(selector)]
              .filter((el) => el.checkVisibility())
              .slice(0, max)
              .map((el) => {
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return {
                  tag: el.tagName.toLowerCase(),
                  clase: el.getAttribute("class"),
                  bounds: { x: r.x, y: r.y, width: r.width, height: r.height },
                  estilos: Object.fromEntries(estilos.map((p) => [p, cs.getPropertyValue(p)])),
                };
              });
            return { selector, variables, elementos };
          },
          { selector: args.dom, estilos: ESTILOS, max: MAX_ELEMENTOS },
        );
        const archivoDom = `dom/${nombreCaptura(args.vista, nombreEstado, vp, "json")}`;
        writeFileSync(join(dir, archivoDom), `${JSON.stringify(dom, null, 2)}\n`);
        datos.dom = archivoDom;
      }
      registrar(archivo, datos);
    }
    await context.close();
    if (codigo) break;
  }
} catch (err) {
  // Lo ya capturado queda registrado con su hash; la corrida se marca incompleta.
  console.error(`capturar: ${err.message}`);
  evidencia.incompleta = err.message;
  codigo = 1;
} finally {
  await browser.close();
}
cerrar();
if (!codigo) console.log(`capturar: ${evidencia.capturas.length} capturas en ${dir}`);
process.exit(codigo);
