"use client";

import * as React from "react";
import { squarify } from "@/lib/lab/graficos";
import { CATEGORICAS } from "@/lib/lab/semantica";
import { cn } from "@/lib/utils";

// Relación (jerarquía parte-todo): un nivel del árbol a la vez, como celdas de área proporcional a su
// valor; las celdas con hijos se abren y una miga de pan permite volver. Observado en Searching for Birds
// (evidencia/2026-10-17-searching-birds, t08–t12): un huevo dividido en celdas (todas las aves → formas →
// tipos) que se revela con el scroll. Allí son celdas de Voronoi; aquí es un treemap «squarified», que
// compara mejor las áreas. Cada celda dice nombre, valor y parte del total en texto: el área no es la
// única forma de leer el dato. Las celdas son botones (abrir) o elementos de lista (hojas).

export interface Nodo {
  id: string;
  label: string;
  /** Valor de una hoja. En un nodo con hijos se suma solo. */
  value?: number;
  children?: Nodo[];
}

/** Valor de un nodo: el propio o la suma de sus hijos. */
export function valorNodo(n: Nodo): number {
  if (n.children?.length) return n.children.reduce((s, h) => s + valorNodo(h), 0);
  return Number.isFinite(n.value) && (n.value ?? 0) > 0 ? (n.value as number) : 0;
}

type HierarchyCellsProps = Omit<React.ComponentProps<"figure">, "children" | "title"> & {
  root: Nodo;
  format?: (v: number) => string;
  /** Alto del área de celdas en px. */
  height?: number;
};

function HierarchyCells({
  root,
  format = (v) => v.toLocaleString("es-CL"),
  height = 320,
  className,
  ...props
}: HierarchyCellsProps) {
  const [camino, setCamino] = React.useState<Nodo[]>([root]);
  const actual = camino[camino.length - 1];
  const hijos = actual.children ?? [];
  const total = valorNodo(actual);
  const celdas = squarify(
    hijos.map((h) => valorNodo(h)),
    0,
    0,
    100,
    100,
  );
  const color = (i: number) => CATEGORICAS[i % CATEGORICAS.length];

  return (
    <figure data-slot="hierarchy-cells" className={cn("m-0 grid gap-[10px]", className)} {...props}>
      <figcaption className="grid gap-[4px]">
        <nav aria-label="Nivel">
          <ol className="m-0 flex list-none flex-wrap items-center gap-[6px] p-0 text-[13px]">
            {camino.map((n, i) => (
              <li key={n.id} className="flex items-center gap-[6px]">
                {i > 0 && (
                  <span aria-hidden className="text-lab-muted">
                    ›
                  </span>
                )}
                {i < camino.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCamino(camino.slice(0, i + 1))}
                    className="rounded-[4px] text-lab-muted underline underline-offset-2 hover:text-lab-ink focus-visible:outline-2 focus-visible:outline-lab-accent"
                  >
                    {n.label}
                  </button>
                ) : (
                  <span aria-current="location" className="font-semibold text-lab-ink">
                    {n.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <span className="text-[12px] text-lab-muted">
          {hijos.length} partes · total {format(total)}
        </span>
      </figcaption>
      <ul className="relative m-0 list-none p-0" style={{ height }}>
        {celdas.map((c) => {
          const h = hijos[c.i];
          const v = valorNodo(h);
          const col = color(c.i);
          const abre = !!h.children?.length;
          const contenido = (
            <>
              <span className="truncate font-semibold">{h.label}</span>
              <span className="tabular-nums opacity-90">
                {format(v)} · {Math.round((v / (total || 1)) * 100)} %
              </span>
              {abre && <span className="text-[11px] opacity-80">{h.children?.length} partes →</span>}
            </>
          );
          const caja =
            "absolute grid content-start gap-[2px] overflow-hidden border-2 border-lab-surface p-[8px] text-left text-[12px]";
          const estilo = {
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: `${c.w}%`,
            height: `${c.h}%`,
            background: col.hex,
            color: col.texto,
          };
          return (
            <li key={h.id} className="contents">
              {abre ? (
                <button
                  type="button"
                  onClick={() => setCamino([...camino, h])}
                  className={cn(
                    caja,
                    "cursor-pointer focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-lab-ink",
                  )}
                  style={estilo}
                  aria-label={`${h.label}: ${format(v)}, ${Math.round((v / (total || 1)) * 100)} %. Abrir ${h.children?.length} partes`}
                >
                  {contenido}
                </button>
              ) : (
                <div className={caja} style={estilo}>
                  {contenido}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

export { HierarchyCells };
