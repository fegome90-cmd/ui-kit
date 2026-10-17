import type * as React from "react";
import { escala, extension, marcasEje, trazoSuave } from "@/lib/lab/graficos";
import { cn } from "@/lib/utils";

// Magnitud + secuencia: varias series en el tiempo, con pocas destacadas sobre el resto atenuado como
// contexto. Observado en BioAge (platform t02: riesgo por edad, «Heart disease» y «Diabetes» destacadas
// sobre muchas líneas tenues). Las destacadas llevan su nombre al final de la línea; el contexto no se
// rotula, por eso la tabla (desplegable) trae todas las series. El gráfico es aria-hidden.
// Dos mecanismos más, como props:
//   events         hitos sobre el eje x con línea punteada y rótulo: el pico de «Snowy Owl» anotado en
//                  Searching for Birds (evidencia/2026-10-17-searching-birds, t03). También van en texto.
//   projectedFrom  desde ese índice la serie es proyección y se dibuja punteada (las ilustraciones de
//                  Greenlock separan lo real de lo proyectado así). La tabla marca esas columnas.

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
  /** Hitos anotados: índice del eje x y rótulo. */
  events?: { at: number; label: string }[];
  /** Índice desde el que los valores son proyección (se dibujan punteados). */
  projectedFrom?: number;
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
  events = [],
  projectedFrom,
  className,
  ...props
}: SeriesChartProps) {
  const pf =
    projectedFrom !== undefined && projectedFrom > 0 && projectedFrom < x.length - 1 ? projectedFrom : undefined;
  /** Tramo real continuo y, si hay proyección, tramo punteado que empieza donde termina el real. */
  const trazos = (p: [number, number][]) =>
    pf === undefined
      ? { real: trazoSuave(p) }
      : { real: trazoSuave(p.slice(0, pf + 1)), proy: trazoSuave(p.slice(pf)) };
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
          {contexto.map((s) => {
            const t = trazos(puntos(s));
            return (
              <g key={s.id}>
                <path d={t.real} fill="none" strokeWidth={1} className="stroke-lab-context" />
                {t.proy && (
                  <path d={t.proy} fill="none" strokeWidth={1} strokeDasharray="4 4" className="stroke-lab-context" />
                )}
              </g>
            );
          })}
        </g>
        <g data-marks="highlight">
          {destacadas.map((s, k) => {
            const p = puntos(s);
            const fin = p[p.length - 1];
            return (
              <g key={s.id}>
                <path d={trazos(p).real} fill="none" strokeWidth={2.5} stroke={COLOR[k % COLOR.length]} />
                {trazos(p).proy && (
                  <path
                    data-proyeccion
                    d={trazos(p).proy}
                    fill="none"
                    strokeWidth={2.5}
                    strokeDasharray="6 5"
                    stroke={COLOR[k % COLOR.length]}
                  />
                )}
                <circle cx={fin[0]} cy={fin[1]} r={3.5} fill={COLOR[k % COLOR.length]} />
                <text x={fin[0] + 8} y={fin[1] + 4} className="fill-lab-ink text-[12px] font-semibold">
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>
        <g data-marks="events">
          {events.map((ev) => (
            <g key={`${ev.at}-${ev.label}`}>
              <line
                x1={sx(ev.at)}
                x2={sx(ev.at)}
                y1={M.top}
                y2={H - M.bottom}
                strokeDasharray="3 3"
                strokeWidth={1}
                className="stroke-lab-ink"
              />
              <text x={sx(ev.at) + 6} y={M.top + 10} className="fill-lab-ink text-[11px] font-semibold">
                {ev.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
      {(events.length > 0 || pf !== undefined) && (
        <ul className="m-0 grid list-none gap-[2px] p-0 text-[12px] text-lab-muted">
          {events.map((ev) => (
            <li key={`${ev.at}-${ev.label}`}>
              {x[ev.at]}: <strong className="text-lab-ink">{ev.label}</strong>
            </li>
          ))}
          {pf !== undefined && <li>Desde {x[pf]}: proyección (línea punteada).</li>}
        </ul>
      )}
      <details className="text-[13px] text-lab-ink">
        <summary className="cursor-pointer text-lab-muted">
          Ver datos ({series.length} {series.length === 1 ? "serie" : "series"})
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-[8px] w-full border-collapse">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr>
                <th scope="col" className="py-[4px] text-left font-medium text-lab-muted">
                  Serie
                </th>
                {x.map((e, i) => (
                  <th key={String(e)} scope="col" className="py-[4px] text-right font-medium text-lab-muted">
                    {e}
                    {pf !== undefined && i > pf ? " (proy.)" : ""}
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
