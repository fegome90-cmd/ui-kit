// Captura evidencia de una fuente de diseño autorizada (skill capturar-diseno, compuertas G0 y G1).
//
//   node scripts/capturar.mjs --fuente atlas --url https://… [--vista home] [--estado hover=hover:.btn]…
//        [--dom ".btn, .card"] [--pagina-completa | --tramos 8] [--esperar ".grafico"] [--ocultar ".cookie-banner"]…
//        [--autoriza "quién y para qué"] [--licencia "MIT"]
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
// - --tramos N captura N veces el viewport bajando con la rueda: para scrollytelling y secciones fijadas, donde
//   una captura de página completa no muestra lo que el scroll va revelando.
// - --esperar espera a que un selector sea visible (pantallas de carga). --ocultar esconde por CSS lo que tapa
//   la captura (banners de cookies, chats): no hace clic ni acepta ni rechaza nada. Con --pagina-completa,
//   antes de capturar recorre la página con scroll para que aparezca el contenido que se revela al entrar.
// - El DOM es opcional y acotado: bounds y una lista fija de estilos computados de los elementos visibles
//   que matchean --dom, más las variables CSS de :root. Nada de valores de formularios.
// - Las tipografías se leen siempre (en reposo, en cada viewport): familias cargadas por document.fonts, archivos
//   de las reglas @font-face y familias usadas por el texto visible. Van a dom/<vista>--tipografias.json y,
//   resumidas, a evidence.json con `licencia: null` para que G0 la complete. Las URL van sin query ni hash. Cada
//   familia lleva sus roles (titular, cuerpo, interfaz) y evidence.json resume qué familias cubre cada rol.
// - Las capturas se toman con las animaciones desactivadas: el movimiento nunca queda observado, solo declarado
//   (transition y animation en --dom). Cada captura de URL lo dice en `desconocido`.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";
import {
  archivosDeFuentes,
  fechaSantiago,
  fusionarTipografias,
  lineasSha256,
  motivoBloqueo,
  nombreCaptura,
  parseEstado,
  recortarValor,
  resumirTipografias,
  rolesTipograficos,
  SELECTOR_SEMANTICO,
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
  // énfasis: jerarquía por opacidad (Material 3: 100 % titular, 70–80 % apoyo, 50–60 % notas)
  "opacity",
  // profundidad: texturas, vidrio esmerilado, filtros
  "background-image",
  "backdrop-filter",
  "filter",
  // movimiento declarado (no observado: las capturas van sin animaciones)
  "transition",
  "animation",
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
    esperar: { type: "string" },
    ocultar: { type: "string", multiple: true, default: [] },
    tramos: { type: "string", default: "1" },
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
args.tramos = Number(args.tramos);
if (!Number.isInteger(args.tramos) || args.tramos < 1 || args.tramos > 40)
  fallar("--tramos debe ser un entero de 1 a 40");
if (args.tramos > 1 && args["pagina-completa"]) fallar("--tramos y --pagina-completa no se combinan");

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
// Cada corrida parte de cero (también con --imagen, que termina antes del navegador): un bloqueo anterior
// no debe quedar marcado si esta captura funciona.
delete evidencia.incompleta;
evidencia.estado = "ok";
delete evidencia.bloqueo;

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
  return page.evaluate((selectorSemantico) => {
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
    const usadas = new Map();
    for (const el of document.body.querySelectorAll("*")) {
      const conTexto = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (!conTexto || !el.checkVisibility()) continue;
      // El rol sale del ancestro semántico más cercano (o del propio elemento): un span dentro de un h1 es titular.
      const sem = el.closest(selectorSemantico) ?? el;
      const u = {
        pila: getComputedStyle(el).fontFamily,
        tag: sem.tagName.toLowerCase(),
        role: sem.getAttribute("role"),
      };
      usadas.set(`${u.pila}|${u.tag}|${u.role}`, u);
    }
    return { caras, reglas, usadas: [...usadas.values()], hojasIlegibles };
  }, SELECTOR_SEMANTICO);
}

/** Captura (imagen y, con --dom, estilos) en el estado y la posición de scroll actuales, y la registra. */
async function capturarAqui(page, vp, nombreEstado, extra = {}) {
  const archivo = `captures/${nombreCaptura(args.vista, nombreEstado, vp)}`;
  await page.screenshot({ path: join(dir, archivo), fullPage: args["pagina-completa"], animations: "disabled" });
  const datos = {
    vista: slug(args.vista),
    estado: nombreEstado,
    viewport: { ...vp, dpr: 1 },
    desconocido: ["movimiento (captura con animaciones desactivadas)"],
  };
  if (args.ocultar.length) datos.ocultos = args.ocultar;
  if (extra.accionForzada) datos.accionForzada = true;
  if (extra.tramo !== undefined) datos.tramo = extra.tramo;
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
    const recortar = (o) => Object.fromEntries(Object.entries(o).map(([p, v]) => [p, recortarValor(v)]));
    dom.variables = recortar(dom.variables);
    for (const el of dom.elementos) el.estilos = recortar(el.estilos);
    const archivoDom = `dom/${nombreCaptura(args.vista, nombreEstado, vp, "json")}`;
    writeFileSync(join(dir, archivoDom), `${JSON.stringify(dom, null, 2)}\n`);
    datos.dom = archivoDom;
  }
  registrar(archivo, datos);
}

/** Baja por la página de a 80 % de pantalla y vuelve arriba, para disparar lo que se revela al hacer scroll. */
async function recorrer(page) {
  await page.evaluate(async () => {
    const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0, pasos = 0; y < document.documentElement.scrollHeight && pasos < 60; pasos++) {
      window.scrollTo(0, y);
      await pausa(150);
      y += Math.round(window.innerHeight * 0.8);
    }
    window.scrollTo(0, 0);
    await pausa(400);
  });
}

const browser = await chromium.launch(
  process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
);
let codigo = 0;
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const page = await context.newPage();
    // Peticiones de la página, para sacar las fuentes. `performance` no sirve: Chrome omite las que pide una hoja
    // de otro origen.
    const pedidas = [];
    page.on("request", (r) => pedidas.push({ url: r.url(), tipo: r.resourceType() }));
    for (const estado of [null, ...estados]) {
      // `load` y no `networkidle`: un sitio con analítica o conexiones abiertas nunca queda en silencio. Se da un
      // margen corto para que termine lo que cargue después.
      const resp = await page.goto(args.url, { waitUntil: "load" });
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
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
      if (args.esperar) await page.locator(args.esperar).first().waitFor({ state: "visible", timeout: 20_000 });
      if (args.ocultar.length)
        await page.addStyleTag({ content: `${args.ocultar.join(", ")} { display: none !important; }` });
      if (args["pagina-completa"]) await recorrer(page);
      if (!estado) {
        const { hojasIlegibles, ...crudas } = await leerTipografias(page);
        const cargados = archivosDeFuentes(pedidas);
        const archivoTipos = `dom/${slug(args.vista)}--tipografias.json`;
        const rutaTipos = join(dir, archivoTipos);
        const previas = existsSync(rutaTipos) ? JSON.parse(readFileSync(rutaTipos, "utf8")).familias : [];
        const familias = fusionarTipografias(previas, resumirTipografias(crudas));
        mkdirSync(join(dir, "dom"), { recursive: true });
        const previosCargados = existsSync(rutaTipos)
          ? (JSON.parse(readFileSync(rutaTipos, "utf8")).archivosCargados ?? [])
          : [];
        const archivosCargados = [...new Set([...previosCargados, ...cargados])].sort();
        writeFileSync(
          rutaTipos,
          `${JSON.stringify({ vista: slug(args.vista), hojasIlegibles, archivosCargados, familias }, null, 2)}\n`,
        );
        evidencia.archivosDeFuentes = [...new Set([...(evidencia.archivosDeFuentes ?? []), ...cargados])].sort();
        evidencia.tipografias = fusionarTipografias(evidencia.tipografias ?? [], familias);
        evidencia.rolesTipograficos = rolesTipograficos(evidencia.tipografias);
        if (hojasIlegibles)
          console.warn(
            `capturar: ${hojasIlegibles} hoja(s) de estilo de otro origen no se pudieron leer (@font-face incompleto)`,
          );
      }
      const nombreEstado = estado?.nombre ?? "reposo";
      let accionForzada = false;
      if (estado) {
        const el = page.locator(estado.selector).first();
        if ((await el.count()) === 0) throw new Error(`el estado «${estado.nombre}» no encontró «${estado.selector}»`);
        // Un elemento animado en bucle nunca queda «estable» para Playwright: si la acción normal no llega, se
        // fuerza y queda anotado en la captura.
        accionForzada = await el[estado.accion]({ timeout: 5000 }).then(
          () => false,
          () => el[estado.accion]({ force: true }).then(() => true),
        );
        await page.waitForTimeout(300);
      }
      if (!estado && args.tramos > 1) {
        // Scrollytelling: una captura del viewport por tramo, bajando con la rueda (funciona también con
        // librerías de scroll suave, que ignoran scrollTo).
        for (let t = 0; t < args.tramos; t++) {
          if (t > 0) {
            await page.mouse.move(vp.width / 2, vp.height / 2);
            await page.mouse.wheel(0, Math.round(vp.height * 0.9));
            await page.waitForTimeout(700);
          }
          await capturarAqui(page, vp, `reposo-t${String(t + 1).padStart(2, "0")}`, { tramo: t + 1 });
        }
      } else await capturarAqui(page, vp, nombreEstado, { accionForzada });
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
