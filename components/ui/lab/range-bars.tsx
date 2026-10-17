import type * as React from "react";
import { escala, marcasEje } from "@/lib/lab/graficos";
import { cn } from "@/lib/utils";

// Magnitud como intervalo: cada fila es un rango (de… a…) sobre un eje con el cero marcado, para efectos
// que pueden ser positivos o negativos. Observado en Symbol Studio («Why is branding important?»: +30–40 %
// de ventas, −20–30 % de clientes perdidos; evidencia/2026-10-17-symbol-studio). Un rango comunica
// incertidumbre que un único número esconde. El valor va también como texto («+30–40 %»).

export interface Rango {
  label: string;
  min: number;
  max: number;
}

type RangeBarsProps = Omit<React.ComponentProps<"figure">, "children" | "title"> & {
  title: string;
  ranges: Rango[];
  /** Unidad tras el número («%», «días»). */
  unit?: string;
};

/** «+30–40 %», «−20–30 %», «−5–+10 %»: el signo va en cada extremo cuando cambia. */
export function textoRango(min: number, max: number, unit = ""): string {
  const fmt = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("es-CL")}`;
  const sufijo = unit ? ` ${unit}` : "";
  if (min >= 0 || max <= 0) {
    const [a, b] = min >= 0 ? [min, max] : [Math.abs(max), Math.abs(min)];
    const signo = min >= 0 ? (max > 0 ? "+" : "") : "−";
    return `${signo}${a.toLocaleString("es-CL")}–${b.toLocaleString("es-CL")}${sufijo}`;
  }
  return `${fmt(min)}–${fmt(max)}${sufijo}`;
}

const W = 560;
const FILA = 34;
const IZQ = 150;
const DER = 90;

function RangeBars({ title, ranges, unit = "", className, ...props }: RangeBarsProps) {
  const lo = Math.min(0, ...ranges.map((r) => Math.min(r.min, r.max)));
  const hi = Math.max(0, ...ranges.map((r) => Math.max(r.min, r.max)));
  const ticks = marcasEje(lo, hi, 4);
  const sx = escala(ticks[0], ticks[ticks.length - 1], IZQ, W - DER);
  const alto = ranges.length * FILA + 24;
  return (
    <figure data-slot="range-bars" className={cn("m-0 grid gap-[10px]", className)} {...props}>
      <figcaption className="text-[15px] font-semibold text-lab-ink">{title}</figcaption>
      <svg aria-hidden viewBox={`0 0 ${W} ${alto}`} className="w-full overflow-visible">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={sx(t)}
              x2={sx(t)}
              y1={0}
              y2={alto - 20}
              className={t === 0 ? "stroke-lab-ink" : "stroke-lab-line"}
            />
            <text x={sx(t)} y={alto - 4} textAnchor="middle" className="fill-lab-muted text-[11px]">
              {t > 0 ? "+" : ""}
              {t}
            </text>
          </g>
        ))}
        <g data-marks="ranges">
          {ranges.map((r, i) => {
            const a = Math.min(r.min, r.max);
            const b = Math.max(r.min, r.max);
            const y = i * FILA + 8;
            return (
              <g key={r.label}>
                <text x={IZQ - 10} y={y + 13} textAnchor="end" className="fill-lab-ink text-[12px]">
                  {r.label}
                </text>
                <rect
                  x={sx(a)}
                  y={y + 3}
                  width={Math.max(2, sx(b) - sx(a))}
                  height={14}
                  rx={7}
                  // Un solo color: el signo lo dicen el cero y el texto. Rojo para lo negativo lo leería como «malo».
                  className="fill-lab-accent"
                />
                <text x={W - DER + 10} y={y + 14} className="fill-lab-ink text-[12px] font-semibold tabular-nums">
                  {textoRango(r.min, r.max, unit)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <ul className="sr-only">
        {ranges.map((r) => (
          <li key={r.label}>
            {r.label}: {textoRango(r.min, r.max, unit)}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export { RangeBars };
