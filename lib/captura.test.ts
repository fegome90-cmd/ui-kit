import { describe, expect, it } from "vitest";
import {
  fechaSantiago,
  fusionarTipografias,
  lineasSha256,
  motivoBloqueo,
  nombreCaptura,
  parseEstado,
  primeraFamilia,
  resumirTipografias,
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

  it("resumirTipografias agrupa por familia y omite las genéricas", () => {
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
      usadas: ['"Marca", sans-serif', "Helvetica, Arial", "system-ui"],
    });
    expect(r).toEqual([
      { familia: "Helvetica", pesos: [], estilos: [], archivos: [], cargada: false, usada: true, licencia: null },
      {
        familia: "Marca",
        pesos: ["400", "700"],
        estilos: ["normal"],
        archivos: ["https://x.cl/marca-400.woff2", "https://x.cl/m.woff"],
        cargada: true,
        usada: true,
        licencia: null,
      },
      {
        familia: "Sin Usar",
        pesos: ["400"],
        estilos: ["normal"],
        archivos: [],
        cargada: true,
        usada: false,
        licencia: null,
      },
    ]);
  });

  it("fusionarTipografias suma vistas y conserva la licencia anotada", () => {
    const base = { pesos: ["400"], estilos: ["normal"], archivos: ["a.woff2"], cargada: true, usada: false };
    const r = fusionarTipografias(
      [{ familia: "Marca", ...base, licencia: "OFL" }],
      [
        { familia: "marca", ...base, pesos: ["700"], archivos: ["b.woff2"], usada: true, licencia: null },
        { familia: "Otra", ...base, licencia: null },
      ],
    );
    expect(r).toEqual([
      {
        familia: "Marca",
        ...base,
        pesos: ["400", "700"],
        archivos: ["a.woff2", "b.woff2"],
        usada: true,
        licencia: "OFL",
      },
      { familia: "Otra", ...base, licencia: null },
    ]);
  });
});
