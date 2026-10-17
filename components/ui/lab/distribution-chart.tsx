import type * as React from "react";
import { escala, extension, trazoArea, trazoSuave } from "@/lib/lab/graficos";
import { cn } from "@/lib/utils";

// Distribución con individuos anotados: una curva de cuántos casos hay en cada valor y uno o más casos
// concretos marcados sobre ella. Observado en BioAge (platform t03: proporción de personas por edad de
// muerte, con dos individuos en los extremos de la curva). La curva sale de `points` ya calculados (el
// componente no estima densidades). Las anotaciones van también en una lista, que es la fuente accesible.

export interface Anotacion {
  x: number;
  label: string;
}

type DistributionChartProps = Omit<React.ComponentProps<"figure">, "children"> & {
  title: string;
  /** Pares [valor, cantidad] en orden creciente de valor. */
  points: [number, number][];
  annotations?: Anotacion[];
  xLabel: string;
  yLabel: string;
  format?: (v: number) => string;
};

const W = 640;
const H = 260;
const M = { top: 34, right: 16, bottom: 34, left: 16 };

/** Altura de la curva en `x`, interpolando linealmente entre los puntos vecinos. */
export function alturaEn(points: [number, number][], x: number): number {
  if (!points.length) return 0;
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (x <= x1) return x1 === x0 ? y1 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return points[points.length - 1][1];
}

function DistributionChart({
  title,
  points,
  annotations = [],
  xLabel,
  yLabel,
  format = (v) => v.toLocaleString("es-CL"),
  className,
  ...props
}: DistributionChartProps) {
  const [x0, x1] = extension(points.map((p) => p[0]));
  const [, ymax] = extension(points.map((p) => p[1]));
  const sx = escala(x0, x1, M.left, W - M.right);
  const sy = escala(0, ymax || 1, H - M.bottom, M.top);
  const p = points.map(([a, b]) => [sx(a), sy(b)] as [number, number]);

  return (
    <figure data-slot="distribution-chart" className={cn("m-0 grid gap-[10px]", className)} {...props}>
      <figcaption className="text-[15px] font-semibold text-lab-ink">{title}</figcaption>
      <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        <path d={trazoArea(p, H - M.bottom)} className="fill-lab-accent-soft" />
        <path d={trazoSuave(p)} fill="none" strokeWidth={2} className="stroke-lab-accent" />
        <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="stroke-lab-line" />
        <text x={M.left} y={H - 10} className="fill-lab-muted text-[11px]">
          {format(x0)}
        </text>
        <text x={W - M.right} y={H - 10} textAnchor="end" className="fill-lab-muted text-[11px]">
          {format(x1)}
        </text>
        <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-lab-muted text-[11px]">
          {xLabel}
        </text>
        <g data-marks="annotations">
          {annotations.map((a) => {
            const cx = sx(a.x);
            const cy = sy(alturaEn(points, a.x));
            return (
              <g key={a.label}>
                <line
                  x1={cx}
                  x2={cx}
                  y1={cy}
                  y2={H - M.bottom}
                  strokeDasharray="3 3"
                  className="stroke-lab-ink"
                  strokeWidth={1}
                />
                <circle cx={cx} cy={cy} r={5} className="fill-lab-surface stroke-lab-ink" strokeWidth={2} />
                <text x={cx} y={cy - 12} textAnchor="middle" className="fill-lab-ink text-[12px] font-semibold">
                  {a.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <p className="m-0 text-[12px] text-lab-muted">
        Eje vertical: {yLabel}. Eje horizontal: {xLabel}.
      </p>
      {annotations.length > 0 && (
        <ul className="m-0 grid list-none gap-[2px] p-0 text-[13px] text-lab-ink">
          {annotations.map((a) => (
            <li key={a.label}>
              <strong>{a.label}</strong>: {xLabel.toLowerCase()} {format(a.x)}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

export { DistributionChart };
