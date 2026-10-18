import {
  type ComponentDoc,
  FAMILIES,
  type Family,
  GROUPS,
  type GroupId,
  groupOf,
  STATUSES,
  type Status,
  statusOf,
} from "@/lib/component-registry";
import { matchesQuery } from "@/lib/rea/rea-utils";

/**
 * Filtros del explorador del banco. Viven en la URL (?q=&grupo=&familia=&estado=) para que una vista filtrada se
 * pueda compartir y sobreviva a una recarga. "todos" significa sin filtro y no se escribe en la URL.
 */
export type Filtros = {
  q: string;
  grupo: GroupId | "todos";
  familia: Family | "todos";
  estado: Status | "todos";
};

export const SIN_FILTROS: Filtros = { q: "", grupo: "todos", familia: "todos", estado: "todos" };

const uno = <T extends string>(valor: string | null, validos: readonly T[]): T | "todos" =>
  validos.includes(valor as T) ? (valor as T) : "todos";

/** Lee los filtros de la URL. Un valor desconocido (un enlace viejo o mal escrito) cuenta como sin filtro. */
export function leerFiltros(params: Pick<URLSearchParams, "get">): Filtros {
  return {
    q: (params.get("q") ?? "").trim(),
    grupo: uno(
      params.get("grupo"),
      GROUPS.map((g) => g.id),
    ),
    familia: uno(params.get("familia"), FAMILIES),
    estado: uno(params.get("estado"), STATUSES),
  };
}

/** Query string con solo los filtros activos, en orden fijo; vacío si no hay ninguno. */
export function escribirFiltros(f: Filtros): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.grupo !== "todos") p.set("grupo", f.grupo);
  if (f.familia !== "todos") p.set("familia", f.familia);
  if (f.estado !== "todos") p.set("estado", f.estado);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const hayFiltros = (f: Filtros) => escribirFiltros(f) !== "";

function cumple(c: ComponentDoc, f: Filtros, ignorar?: keyof Filtros): boolean {
  if (ignorar !== "grupo" && f.grupo !== "todos" && groupOf(c.category).id !== f.grupo) return false;
  if (ignorar !== "familia" && f.familia !== "todos" && c.family !== f.familia) return false;
  if (ignorar !== "estado" && f.estado !== "todos" && statusOf(c) !== f.estado) return false;
  return ignorar === "q" || matchesQuery(f.q, c.name, c.description, c.slug, c.family, c.category);
}

/** Componentes que cumplen todos los filtros, en el orden del registro. */
export const filtrar = (componentes: readonly ComponentDoc[], f: Filtros) => componentes.filter((c) => cumple(c, f));

/**
 * Cuántos componentes quedarían al elegir cada opción de una dimensión, con los demás filtros como están
 * (conteo por faceta): así una opción con 0 avisa antes de vaciar la lista.
 */
export function conteos(
  componentes: readonly ComponentDoc[],
  f: Filtros,
  dimension: "grupo" | "familia" | "estado",
): Record<string, number> {
  const base = componentes.filter((c) => cumple(c, f, dimension));
  const valor = (c: ComponentDoc) =>
    dimension === "grupo" ? groupOf(c.category).id : dimension === "familia" ? c.family : statusOf(c);
  const out: Record<string, number> = { todos: base.length };
  for (const c of base) out[valor(c)] = (out[valor(c)] ?? 0) + 1;
  return out;
}
