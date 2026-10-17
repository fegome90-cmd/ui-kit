import type * as React from "react";
import { colorCategoria, polar, sectores } from "@/lib/lab/graficos";
import { cn } from "@/lib/utils";

// Categoría: un conjunto de clases del mismo nivel alrededor de un centro que las nombra. Observado en
// BioAge (platform t05: «Known hallmarks of aging», ocho sectores con un ícono cada uno). Los sectores son
// iguales a propósito: la rueda distingue clases, no mide cuánto pesa cada una. Colores: la paleta
// categórica de Voices (--lab-cat-1…5), que se repite desde la sexta sin que dos vecinas compartan color.
// Cada sector lleva su número y la leyenda numerada es la fuente accesible: el color nunca es la única
// forma de identificar la clase.

export interface Categoria {
  label: string;
  description?: string;
}

type CategoryWheelProps = Omit<React.ComponentProps<"figure">, "children" | "title"> & {
  /** Lo que tienen en común las categorías; va al centro. */
  title: string;
  /** De 2 a 8 categorías. */
  categories: Categoria[];
  /** Diámetro en px. */
  size?: number;
};

const CATS = 5;

function CategoryWheel({ title, categories, size = 240, className, ...props }: CategoryWheelProps) {
  const cats = categories.slice(0, 8);
  const r = 100;
  const rIn = 46;
  const s = sectores(cats.length, 0.035);
  return (
    <figure
      data-slot="category-wheel"
      className={cn("m-0 flex flex-wrap items-center gap-[24px]", className)}
      {...props}
    >
      <svg aria-hidden viewBox="0 0 220 220" style={{ width: size, height: size }} className="shrink-0">
        {s.map((sec, i) => {
          const n = colorCategoria(i, cats.length, CATS);
          const [ax, ay] = polar(110, 110, r, sec.inicio);
          const [bx, by] = polar(110, 110, r, sec.fin);
          const [cx, cy] = polar(110, 110, rIn, sec.fin);
          const [dx, dy] = polar(110, 110, rIn, sec.inicio);
          const grande = sec.fin - sec.inicio > Math.PI ? 1 : 0;
          const [tx, ty] = polar(110, 110, (r + rIn) / 2, sec.medio);
          return (
            <g key={cats[i].label}>
              <path
                d={`M${ax} ${ay}A${r} ${r} 0 ${grande} 1 ${bx} ${by}L${cx} ${cy}A${rIn} ${rIn} 0 ${grande} 0 ${dx} ${dy}Z`}
                style={{ fill: `var(--lab-cat-${n})` }}
              />
              <text
                x={tx}
                y={ty + 5}
                textAnchor="middle"
                className="text-[14px] font-bold"
                style={{ fill: `var(--lab-cat-${n}-text)` }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}
        <circle cx={110} cy={110} r={rIn - 4} className="fill-lab-surface" />
        <foreignObject x={110 - rIn + 8} y={110 - rIn + 8} width={(rIn - 8) * 2} height={(rIn - 8) * 2}>
          <div className="flex size-full items-center justify-center text-center text-[11px] leading-[1.2] font-semibold text-lab-ink">
            {title}
          </div>
        </foreignObject>
      </svg>
      <div className="grid min-w-[200px] flex-1 gap-[8px]">
        <figcaption className="text-[15px] font-semibold text-lab-ink">{title}</figcaption>
        <ol className="m-0 grid list-none gap-[6px] p-0">
          {cats.map((c, i) => {
            const n = colorCategoria(i, cats.length, CATS);
            return (
              <li key={c.label} className="flex items-start gap-[10px] text-[13px] text-lab-ink">
                <span
                  aria-hidden
                  className="grid size-[22px] shrink-0 place-items-center rounded-full text-[12px] font-bold"
                  style={{ background: `var(--lab-cat-${n})`, color: `var(--lab-cat-${n}-text)` }}
                >
                  {i + 1}
                </span>
                <span>
                  <strong className="font-semibold">{c.label}</strong>
                  {c.description && <span className="text-lab-muted"> · {c.description}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}

export { CategoryWheel };
