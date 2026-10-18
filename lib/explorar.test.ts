import { describe, expect, it } from "vitest";
import { COMPONENTS, statusOf } from "./component-registry";
import { conteos, escribirFiltros, filtrar, hayFiltros, leerFiltros, SIN_FILTROS } from "./explorar";

const url = (s: string) => new URLSearchParams(s);

describe("explorador del banco", () => {
  it("lee los filtros de la URL y descarta valores desconocidos", () => {
    expect(leerFiltros(url(""))).toEqual(SIN_FILTROS);
    expect(leerFiltros(url("q=%20botón%20&grupo=datos&familia=Lab&estado=candidate"))).toEqual({
      q: "botón",
      grupo: "datos",
      familia: "Lab",
      estado: "candidate",
    });
    expect(leerFiltros(url("grupo=nada&familia=lab&estado=beta"))).toEqual(SIN_FILTROS);
  });

  it("escribe solo los filtros activos, y la ida y vuelta conserva los filtros", () => {
    expect(escribirFiltros(SIN_FILTROS)).toBe("");
    expect(hayFiltros(SIN_FILTROS)).toBe(false);
    const f = { ...SIN_FILTROS, q: "slider", familia: "Kraa" as const };
    expect(escribirFiltros(f)).toBe("?q=slider&familia=Kraa");
    expect(leerFiltros(url(escribirFiltros(f)))).toEqual(f);
  });

  it("sin filtros devuelve todo, en el orden del registro", () => {
    expect(filtrar(COMPONENTS, SIN_FILTROS)).toEqual(COMPONENTS);
  });

  it("combina filtros y busca sin tildes en nombre, descripción, familia y categoría", () => {
    const datosLab = filtrar(COMPONENTS, { ...SIN_FILTROS, grupo: "datos", familia: "Lab" });
    expect(datosLab.length).toBeGreaterThan(0);
    expect(datosLab.every((c) => c.family === "Lab" && ["Indicadores", "Gráficos"].includes(c.category))).toBe(true);
    const graficos = filtrar(COMPONENTS, { ...SIN_FILTROS, q: "graficos" });
    expect(graficos.some((c) => c.category === "Gráficos")).toBe(true);
    expect(filtrar(COMPONENTS, { ...SIN_FILTROS, q: "zzz-no-existe" })).toEqual([]);
  });

  it("los conteos por faceta ignoran su propia dimensión y suman el total", () => {
    const f = { ...SIN_FILTROS, familia: "Lab" as const, estado: "stable" as const };
    const porFamilia = conteos(COMPONENTS, f, "familia");
    // Con estado estable, Lab no tiene ninguno (todos son candidatos), pero el conteo lo dice sin vaciar la vista.
    expect(porFamilia.Lab ?? 0).toBe(COMPONENTS.filter((c) => c.family === "Lab" && statusOf(c) === "stable").length);
    expect(porFamilia.todos).toBe(COMPONENTS.filter((c) => statusOf(c) === "stable").length);
    const porGrupo = conteos(COMPONENTS, SIN_FILTROS, "grupo");
    const suma = Object.entries(porGrupo)
      .filter(([k]) => k !== "todos")
      .reduce((s, [, n]) => s + n, 0);
    expect(suma).toBe(COMPONENTS.length);
    expect(porGrupo.todos).toBe(COMPONENTS.length);
  });
});
