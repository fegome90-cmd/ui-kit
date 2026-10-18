"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ComponentCard } from "@/components/docs/component-card";
import { LabScope } from "@/components/ui/lab/lab-palette";
import { LabNotification } from "@/components/ui/lab/notification";
import { ReaFilterGroup } from "@/components/ui/rea/rea-filter-group";
import { ReaSearchBox } from "@/components/ui/rea/rea-search-box";
import { ReaProvider } from "@/components/ui/rea/rea-theme";
import { COMPONENTS, FAMILIES, GROUPS } from "@/lib/component-registry";
import { conteos, escribirFiltros, type Filtros, filtrar, hayFiltros, leerFiltros, SIN_FILTROS } from "@/lib/explorar";

const ESTADOS = [
  { value: "stable", label: "Estable" },
  { value: "candidate", label: "Candidato" },
] as const;

/**
 * Búsqueda y filtros del banco. Los filtros viven en la URL: se escriben con history.replaceState (no navega ni
 * suma entradas al historial; Next sincroniza useSearchParams) y se releen si la URL cambia por fuera.
 * Las piezas de búsqueda y filtro son de REA (dentro de su ReaProvider) y el aviso vacío es de Lab.
 */
export function Explorer() {
  const params = useSearchParams();
  const pathname = usePathname();
  const [f, setF] = useState<Filtros>(() => leerFiltros(params));

  // Atrás/adelante o un enlace con otros filtros: la URL manda. Se compara normalizado para no pisar lo que se
  // está escribiendo (un espacio al final no cambia la URL).
  const desdeUrl = params.toString();
  useEffect(() => {
    const enUrl = leerFiltros(new URLSearchParams(desdeUrl));
    setF((actual) => (escribirFiltros(actual) === escribirFiltros(enUrl) ? actual : enUrl));
  }, [desdeUrl]);

  const cambiar = (parcial: Partial<Filtros>) => {
    const nuevo = { ...f, ...parcial };
    setF(nuevo);
    window.history.replaceState(null, "", `${pathname}${escribirFiltros(nuevo)}`);
  };

  const resultado = filtrar(COMPONENTS, f);
  const porGrupo = conteos(COMPONENTS, f, "grupo");
  const porFamilia = conteos(COMPONENTS, f, "familia");
  const porEstado = conteos(COMPONENTS, f, "estado");

  return (
    <>
      <ReaProvider className="cb-explorer-bar">
        <ReaSearchBox
          label="Buscar componentes"
          placeholder="Buscar por nombre, descripción, familia o tipo…"
          value={f.q}
          onValueChange={(q) => cambiar({ q })}
        />
        <div className="cb-explorer-filter">
          <span aria-hidden>Grupo</span>
          <ReaFilterGroup
            label="Grupo"
            value={f.grupo}
            onValueChange={(grupo) => cambiar({ grupo: grupo as Filtros["grupo"] })}
            options={[
              { value: "todos", label: "Todos", count: porGrupo.todos },
              ...GROUPS.map((g) => ({ value: g.id, label: g.name, count: porGrupo[g.id] ?? 0 })),
            ]}
          />
        </div>
        <div className="cb-explorer-filter">
          <span aria-hidden>Familia</span>
          <ReaFilterGroup
            label="Familia"
            value={f.familia}
            onValueChange={(familia) => cambiar({ familia: familia as Filtros["familia"] })}
            options={[
              { value: "todos", label: "Todas", count: porFamilia.todos },
              ...FAMILIES.map((fam) => ({ value: fam, label: fam, count: porFamilia[fam] ?? 0 })),
            ]}
          />
        </div>
        <div className="cb-explorer-filter">
          <span aria-hidden>Estado</span>
          <ReaFilterGroup
            label="Estado"
            value={f.estado}
            onValueChange={(estado) => cambiar({ estado: estado as Filtros["estado"] })}
            options={[
              { value: "todos", label: "Todos", count: porEstado.todos },
              ...ESTADOS.map((e) => ({ ...e, count: porEstado[e.value] ?? 0 })),
            ]}
          />
        </div>
      </ReaProvider>

      <div className="cb-explorer-status">
        <p role="status">
          {resultado.length === 1 ? "1 componente" : `${resultado.length} componentes`}
          {hayFiltros(f) && ` de ${COMPONENTS.length}`}
        </p>
        {hayFiltros(f) && (
          <button type="button" className="cb-explorer-clear" onClick={() => cambiar(SIN_FILTROS)}>
            Limpiar filtros
          </button>
        )}
      </div>

      {resultado.length ? (
        <div className="cb-grid">
          {resultado.map((c) => (
            <ComponentCard key={c.slug} c={c} />
          ))}
        </div>
      ) : (
        <LabScope className="cb-explorer-empty">
          <LabNotification variant="callout" status="info" title="Ningún componente cumple estos filtros">
            Prueba con otra palabra o quita algún filtro. Los números de cada opción dicen cuántos quedarían.
          </LabNotification>
        </LabScope>
      )}
    </>
  );
}
