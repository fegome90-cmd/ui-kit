import type * as React from "react";
import { OPACIDAD_TRAMO, tramoLog } from "@/lib/lab/graficos";
import { cn } from "@/lib/utils";

// Mapa de calor divergente: una grilla de celdas donde el color dice hacia qué lado va el valor y la
// opacidad, cuánto (tramos logarítmicos). Medido en el portal de Voices from the Frontlines
// (explore-the-data, «Internal climate mobility»): coral rgb(250 86 50) para quienes se van, verde
// rgb(0 160 122) para quienes llegan, opacidades 0,15 / 0,3 / 0,5 / 0,68 / 0,85, cortes 100, 1k, 10k, 100k.
// El esquema por defecto es naranja/azul: rojo contra verde es lo que peor distingue la deuteranopia. El
// medido queda como `scheme="voices"`. El gráfico es aria-hidden; la tabla desplegable trae los valores.

const ESQUEMAS = {
  accesible: { neg: "rgb(230 97 1)", pos: "rgb(33 102 172)" },
  voices: { neg: "rgb(250 86 50)", pos: "rgb(0 160 122)" },
} as const;

type DivergingHeatmapProps = Omit<React.ComponentProps<"figure">, "children"> & {
  title: string;
  rows: string[];
  cols: string[];
  /** values[fila][columna]; negativo = un lado, positivo = el otro. */
  values: number[][];
  /** Qué significan los dos lados («Se van» / «Llegan»). */
  negativeLabel: string;
  positiveLabel: string;
  scheme?: keyof typeof ESQUEMAS;
  format?: (v: number) => string;
};

const CORTES = ["100", "1k", "10k", "100k", "1M+"];

function DivergingHeatmap({
  title,
  rows,
  cols,
  values,
  negativeLabel,
  positiveLabel,
  scheme = "accesible",
  format = (v) => v.toLocaleString("es-CL"),
  className,
  ...props
}: DivergingHeatmapProps) {
  const { neg, pos } = ESQUEMAS[scheme];
  const color = (v: number) => {
    const t = tramoLog(v);
    if (t === 0) return "transparent";
    return `color-mix(in oklab, ${t < 0 ? neg : pos} ${OPACIDAD_TRAMO[Math.abs(t)] * 100}%, transparent)`;
  };
  const celda = 14;
  return (
    <figure
      data-slot="diverging-heatmap"
      data-scheme={scheme}
      className={cn("m-0 grid gap-[12px]", className)}
      {...props}
    >
      <figcaption className="text-[15px] font-semibold text-lab-ink">{title}</figcaption>
      <div className="overflow-x-auto">
        <svg
          aria-hidden
          viewBox={`0 0 ${cols.length * celda} ${rows.length * celda}`}
          className="block w-full min-w-[280px]"
          data-marks="cells"
        >
          {values.map((fila, r) =>
            fila.map((v, c) => (
              <rect
                // biome-ignore lint/suspicious/noArrayIndexKey: posición fija en la grilla.
                key={`${r}-${c}`}
                x={c * celda + 0.5}
                y={r * celda + 0.5}
                width={celda - 1}
                height={celda - 1}
                style={{ fill: color(v) }}
              />
            )),
          )}
        </svg>
      </div>
      <div className="grid gap-[4px]" aria-hidden>
        <div className="flex justify-between text-[13px] text-lab-ink">
          <span>{negativeLabel}</span>
          <span>{positiveLabel}</span>
        </div>
        <div className="flex gap-[3px]">
          {[5, 4, 3, 2, 1].map((t) => (
            <span key={`n${t}`} className="h-[14px] flex-1" style={{ background: color(-(10 ** (t + 1)) + 1) }} />
          ))}
          {[1, 2, 3, 4, 5].map((t) => (
            <span key={`p${t}`} className="h-[14px] flex-1" style={{ background: color(10 ** (t + 1) - 1) }} />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-lab-muted tabular-nums">
          {[...CORTES].reverse().map((c) => (
            <span key={`n${c}`}>{c}</span>
          ))}
          <span>0</span>
          {CORTES.map((c) => (
            <span key={`p${c}`}>{c}</span>
          ))}
        </div>
      </div>
      <details className="text-[13px] text-lab-ink">
        <summary className="cursor-pointer text-lab-muted">
          Ver datos ({rows.length} × {cols.length})
        </summary>
        <div className="max-h-[260px] overflow-auto">
          <table className="mt-[8px] border-collapse">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr>
                <td />
                {cols.map((c) => (
                  <th key={c} scope="col" className="px-[6px] py-[2px] text-right font-medium text-lab-muted">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r} className="border-t border-lab-line">
                  <th scope="row" className="px-[6px] py-[2px] text-left font-normal">
                    {r}
                  </th>
                  {cols.map((c, j) => (
                    <td key={c} className="px-[6px] py-[2px] text-right tabular-nums">
                      {format(values[i]?.[j] ?? 0)}
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

export { DivergingHeatmap };
