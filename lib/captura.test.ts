import { describe, expect, it } from "vitest";
import {
  archivosDeFuentes,
  fechaSantiago,
  fusionarTipografias,
  lineasSha256,
  motivoBloqueo,
  nombreCaptura,
  parseEstado,
  primeraFamilia,
  recortarValor,
  resumirTipografias,
  rolDe,
  rolesTipograficos,
  SELECTOR_SEMANTICO,
  sinQuery,
  slug,
  VIEWPORTS,
} from "./captura";

describe("captura de diseño", () => {
  it("usa los viewports de G1", () => {
    expect(VIEWPORTS).toEqual([
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]);
  });

  it("parseEstado acepta selectores con : y =", () => {
    expect(parseEstado("Hover=hover:.btn")).toEqual({ nombre: "hover", accion: "hover", selector: ".btn" });
    expect(parseEstado("abierto=click:button[aria-expanded=false]:first-of-type")).toEqual({
      nombre: "abierto",
      accion: "click",
      selector: "button[aria-expanded=false]:first-of-type",
    });
  });

  it("parseEstado rechaza specs inválidas", () => {
    for (const spec of ["hover", "=hover:.a", "x=tap:.a", "x=hover:", "reposo=hover:.a"])
      expect(() => parseEstado(spec), spec).toThrow(/estado inválido/);
  });

  it("slug y nombreCaptura siguen la convención de la skill", () => {
    expect(slug("  Página Inicial / Atlas ")).toBe("pagina-inicial-atlas");
    expect(nombreCaptura("Home", "focus visible", VIEWPORTS[1])).toBe("home--focus-visible--390x844.png");
    expect(nombreCaptura("home", "reposo", VIEWPORTS[0], "json")).toBe("home--reposo--1440x900.json");
  });

  it("fechaSantiago usa la zona de Chile", () => {
    // 02:00 UTC del 17 es todavía el 16 en Santiago.
    expect(fechaSantiago(new Date("2026-10-17T02:00:00Z"))).toBe("2026-10-16");
  });

  it("motivoBloqueo detiene G0 ante cualquier señal de login", () => {
    const ok = { status: 200, urlFinal: "https://ejemplo.cl/componentes", hayPassword: false };
    expect(motivoBloqueo(ok)).toBeNull();
    expect(motivoBloqueo({ ...ok, urlFinal: "https://ejemplo.cl/author/ana" })).toBeNull();
    expect(motivoBloqueo({ ...ok, status: 401 })).toBe("HTTP 401");
    expect(motivoBloqueo({ ...ok, status: 403 })).toBe("HTTP 403");
    expect(motivoBloqueo({ ...ok, urlFinal: "https://ejemplo.cl/login?next=/" })).toMatch(/página de acceso/);
    expect(motivoBloqueo({ ...ok, urlFinal: "https://auth.ejemplo.cl/x" })).toMatch(/página de acceso/);
    expect(motivoBloqueo({ ...ok, hayPassword: true })).toBe("la página pide contraseña");
  });

  it("lineasSha256 imita shasum -a 256", () => {
    expect(
      lineasSha256([
        { archivo: "dom/b.json", sha256: "bb" },
        { archivo: "captures/a.png", sha256: "aa" },
      ]),
    ).toBe("aa  captures/a.png\nbb  dom/b.json\n");
  });

  it("sinQuery no deja tokens ni archivos embebidos", () => {
    expect(sinQuery("https://cdn.x/f/inter.woff2?token=abc#v")).toBe("https://cdn.x/f/inter.woff2");
    expect(sinQuery("data:font/woff2;base64,AAAA")).toBe("data:font/woff2 (embebida)");
    expect(primeraFamilia('"Inter Variable", system-ui, sans-serif')).toBe("Inter Variable");
  });

  it("rolDe clasifica por etiqueta y por role", () => {
    expect(rolDe("H1")).toBe("titular");
    expect(rolDe("div", "heading")).toBe("titular");
    expect(rolDe("p")).toBe("cuerpo");
    expect(rolDe("li")).toBe("cuerpo");
    expect(rolDe("button")).toBe("interfaz");
    expect(rolDe("a")).toBe("interfaz");
    expect(rolDe("div", "button")).toBe("interfaz");
    expect(rolDe("span")).toBe("otro");
    expect(rolDe("div")).toBe("otro");
  });

  it("resumirTipografias agrupa por familia, omite las genéricas y anota roles", () => {
    const r = resumirTipografias({
      caras: [
        { family: '"Marca"', weight: "700", style: "normal", status: "loaded" },
        { family: "Marca", weight: "400", style: "normal", status: "loaded" },
        { family: "Marca", weight: "400", style: "italic", status: "unloaded" },
        { family: "Sin Usar", weight: "400", style: "normal", status: "loaded" },
      ],
      reglas: [
        { family: "Marca", src: 'url("https://x.cl/marca-400.woff2?sig=1") format("woff2"), url(https://x.cl/m.woff)' },
        { family: "sans-serif", src: "url(https://x.cl/nada.woff2)" },
      ],
      usadas: [
        { pila: '"Marca", sans-serif', tag: "h1", role: null },
        { pila: '"Marca", sans-serif', tag: "button", role: null },
        { pila: "Helvetica, Arial", tag: "p", role: null },
        { pila: "system-ui", tag: "span", role: null },
      ],
    });
    const vacia = { pesos: [], estilos: [], archivos: [], licencia: null };
    expect(r).toEqual([
      { familia: "Helvetica", ...vacia, cargada: false, usada: true, roles: ["cuerpo"] },
      {
        familia: "Marca",
        pesos: ["400", "700"],
        estilos: ["normal"],
        archivos: ["https://x.cl/marca-400.woff2", "https://x.cl/m.woff"],
        cargada: true,
        usada: true,
        roles: ["titular", "interfaz"],
        licencia: null,
      },
      { familia: "Sin Usar", ...vacia, pesos: ["400"], estilos: ["normal"], cargada: true, usada: false, roles: [] },
    ]);
    expect(rolesTipograficos(r)).toEqual({ titular: ["Marca"], cuerpo: ["Helvetica"], interfaz: ["Marca"], otro: [] });
  });

  it("fusionarTipografias suma vistas, roles y conserva la licencia anotada", () => {
    const base = { pesos: ["400"], estilos: ["normal"], archivos: ["a.woff2"], cargada: true, usada: false };
    const r = fusionarTipografias(
      [{ familia: "Marca", ...base, roles: ["cuerpo"], licencia: "OFL" }],
      [
        {
          familia: "marca",
          ...base,
          pesos: ["700"],
          archivos: ["b.woff2"],
          usada: true,
          roles: ["titular"],
          licencia: null,
        },
        { familia: "Otra", ...base, roles: [], licencia: null },
      ],
    );
    expect(r).toEqual([
      {
        familia: "Marca",
        ...base,
        pesos: ["400", "700"],
        archivos: ["a.woff2", "b.woff2"],
        usada: true,
        roles: ["titular", "cuerpo"],
        licencia: "OFL",
      },
      { familia: "Otra", ...base, roles: [], licencia: null },
    ]);
  });

  it("recortarValor no deja tokens, data: enteros ni valores gigantes", () => {
    expect(recortarValor("none")).toBe("none");
    expect(recortarValor('url("https://cdn.x/grano.png?token=abc"), linear-gradient(red, blue)')).toBe(
      'url("https://cdn.x/grano.png"), linear-gradient(red, blue)',
    );
    expect(recortarValor(`url("data:image/png;base64,${"A".repeat(5000)}")`)).toBe('url("data:image/png (embebida)")');
    const largo = recortarValor("x".repeat(400));
    expect(largo).toBe(`${"x".repeat(300)}… (+100)`);
  });

  it("SELECTOR_SEMANTICO cubre los tres roles y los role ARIA", () => {
    const partes = SELECTOR_SEMANTICO.split(",");
    for (const x of ["h1", "h6", "p", "li", "button", "a", "label", "[role=heading]", "[role=button]"])
      expect(partes, x).toContain(x);
    expect(partes).not.toContain("span");
    expect(partes).not.toContain("div");
  });

  it("archivosDeFuentes toma peticiones font y fetch con extensión, sin query ni duplicados", () => {
    expect(
      archivosDeFuentes([
        { url: "https://x.cl/app.js", tipo: "script" },
        { url: "https://x.cl/f/mori.woff2?v=3", tipo: "fetch" },
        { url: "https://x.cl/f/mori.woff2?v=4", tipo: "font" },
        { url: "https://x.cl/f/viejo.TTF", tipo: "xhr" },
        { url: "https://use.typekit.net/af/abc/l?primer=1&fvd=n4", tipo: "font" },
        { url: "https://x.cl/estilos.css", tipo: "stylesheet" },
        { url: "https://x.cl/woff2-guia.html", tipo: "document" },
      ]),
    ).toEqual(["https://use.typekit.net/af/abc/l", "https://x.cl/f/mori.woff2", "https://x.cl/f/viejo.TTF"]);
  });
});
