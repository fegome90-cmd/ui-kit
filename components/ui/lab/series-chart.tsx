import type * as React from "react";
import { escala, extension, marcasEje, trazoSuave } from "@/lib/lab/graficos";
import { cn } from "@/lib/utils";

// Magnitud + secuencia: varias series en el tiempo, con pocas destacadas sobre el resto atenuado como
// contexto. Observado en BioAge (platform t02: riesgo por edad, «Heart disease» y «Diabetes» destacadas
// sobre muchas líneas tenues). Las destacadas llevan su nombre al final de la línea; el contexto no se
// rotula, por eso la tabla (desplegable) trae todas las series. El gráfico es aria-hidden.

export interface Serie {
  id: string;
  label: string;
  values: number[];
}

type SeriesChartProps = Omit<React.ComponentProps<"figure">, "children"> & {
  title: string;
  /** Etiquetas del eje x, una por valor. */
  x: (string | number)[];
  series: Serie[];
  /** Ids de las series destacadas (1 o 2 se leen bien). */
  highlight: string[];
  format?: (v: number) => string;
};

const W = 640;
const H = 280;
const M = { top: 16, right: 110, bottom: 28, left: 40 };
const COLOR = ["var(--lab-accent)", "var(--lab-ink)"];

function SeriesChart({
  title,
  x,
  series,
  highlight,
  format = (v) => v.toLocaleString("es-CL"),
  className,
  ...props
}: SeriesChartProps) {
  const [lo, hi] = extension(series.flatMap((s) => s.values));
  const ticks = marcasEje(Math.min(0, lo), hi, 4);
  const y = escala(ticks[0], ticks[ticks.length - 1], H - M.bottom, M.top);
  const sx = escala(0, Math.max(1, x.length - 1), M.left, W - M.right);
  const puntos = (s: Serie) => s.values.map((v, i) => [sx(i), y(v)] as [number, number]);
  const destacadas = highlight.map((id) => series.find((s) => s.id === id)).filter((s): s is Serie => !!s);
  const contexto = series.filter((s) => !highlight.includes(s.id));

  return (
    <figure data-slot="series-chart" className={cn("m-0 grid gap-[10px]", className)} {...props}>
      <figcaption className="text-[15px] font-semibold text-lab-ink">{title}</figcaption>
      <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="stroke-lab-line" />
            <text x={M.left - 8} y={y(t) + 4} textAnchor="end" className="fill-lab-muted text-[11px]">
              {format(t)}
            </text>
          </g>
        ))}
        {x.map((etiqueta, i) =>
          i === 0 || i === x.length - 1 || i === Math.floor((x.length - 1) / 2) ? (
            <text key={String(etiqueta)} x={sx(i)} y={H - 8} textAnchor="middle" className="fill-lab-muted text-[11px]">
              {etiqueta}
            </text>
          ) : null,
        )}
        <g data-marks="context">
          {contexto.map((s) => (
            <path key={s.id} d={trazoSuave(puntos(s))} fill="none" strokeWidth={1} className="stroke-lab-context" />
          ))}
        </g>
        <g data-marks="highlight">
          {destacadas.map((s, k) => {
            const p = puntos(s);
            const fin = p[p.length - 1];
            return (
              <g key={s.id}>
                <path d={trazoSuave(p)} fill="none" strokeWidth={2.5} stroke={COLOR[k % COLOR.length]} />
                <circle cx={fin[0]} cy={fin[1]} r={3.5} fill={COLOR[k % COLOR.length]} />
                <text x={fin[0] + 8} y={fin[1] + 4} className="fill-lab-ink text-[12px] font-semibold">
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <details className="text-[13px] text-lab-ink">
        <summary className="cursor-pointer text-lab-muted">Ver datos ({series.length} series)</summary>
        <div className="overflow-x-auto">
          <table className="mt-[8px] w-full border-collapse">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr>
                <th scope="col" className="py-[4px] text-left font-medium text-lab-muted">
                  Serie
                </th>
                {x.map((e) => (
                  <th key={String(e)} scope="col" className="py-[4px] text-right font-medium text-lab-muted">
                    {e}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...destacadas, ...contexto].map((s) => (
                <tr key={s.id} className="border-t border-lab-line">
                  <th scope="row" className="py-[4px] text-left font-normal">
                    {s.label}
                    {highlight.includes(s.id) && <span className="text-lab-muted"> · destacada</span>}
                  </th>
                  {s.values.map((v, i) => (
                    <td key={`${s.id}-${x[i]}`} className="py-[4px] text-right">
                      {format(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

export { SeriesChart };
