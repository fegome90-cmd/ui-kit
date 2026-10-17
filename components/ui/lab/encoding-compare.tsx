"use client";

import * as React from "react";
import { arcos, type Dato, type Encoding, longitudes, radios, trazoArco } from "@/lib/lab/encodings";
import { cn } from "@/lib/utils";

// Magnitud: la misma tabla en tres codificaciones, para comparar qué se lee mejor. Mecanismo observado
// en Google Data GIF Maker (evidencia/2026-10-17-data-gif-maker); la interfaz es propia.
// Longitud y área comparan con el valor mayor; el arco muestra la parte del total. La tabla queda
// siempre visible: ninguna forma reemplaza al número.

const ETIQUETAS: Record<Encoding, string> = { length: "Longitud", area: "Área", arc: "Arco" };
const ORDEN: Encoding[] = ["length", "area", "arc"];
// Opacidades del acento para distinguir ítems sin sumar colores con otro significado.
const OPACIDAD = [1, 0.72, 0.5, 0.34, 0.22];

type EncodingCompareProps = Omit<React.ComponentProps<"figure">, "onChange"> & {
  /** De 1 a 5 datos. */
  data: Dato[];
  /** Título de la tabla y del gráfico. */
  title: string;
  encoding?: Encoding;
  defaultEncoding?: Encoding;
  onEncodingChange?: (encoding: Encoding) => void;
  /** Formato de los valores en etiquetas y tabla. */
  format?: (value: number) => string;
};

function EncodingCompare({
  data,
  title,
  encoding: encodingProp,
  defaultEncoding = "length",
  onEncodingChange,
  format = (v) => v.toLocaleString("es-CL"),
  className,
  ...props
}: EncodingCompareProps) {
  const [encodingState, setEncodingState] = React.useState(defaultEncoding);
  const encoding = encodingProp ?? encodingState;
  const datos = data.slice(0, 5);
  const elegir = (e: Encoding) => {
    if (encodingProp === undefined) setEncodingState(e);
    onEncodingChange?.(e);
  };

  return (
    <figure
      data-slot="encoding-compare"
      data-encoding={encoding}
      className={cn(
        "m-0 flex flex-col gap-[14px] rounded-[12px] border border-lab-line bg-lab-surface p-[16px]",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <figcaption className="text-[15px] font-semibold text-lab-ink">{title}</figcaption>
        {/* biome-ignore lint/a11y/useSemanticElements: grupo de botones conmutables, no un formulario. */}
        <div role="group" aria-label="Codificación" className="flex rounded-full border border-lab-line p-[2px]">
          {ORDEN.map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={encoding === e}
              onClick={() => elegir(e)}
              className={cn(
                "rounded-full px-[12px] py-[4px] text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent",
                encoding === e ? "bg-lab-ink text-white" : "text-lab-muted",
              )}
            >
              {ETIQUETAS[e]}
            </button>
          ))}
        </div>
      </div>

      <Grafico datos={datos} encoding={encoding} format={format} />

      <table className="w-full border-collapse text-[13px]">
        <caption className="sr-only">{title}</caption>
        <thead>
          <tr className="text-left text-lab-muted">
            <th scope="col" className="py-[4px] font-medium">
              Variable
            </th>
            <th scope="col" className="py-[4px] text-right font-medium">
              Valor
            </th>
            {encoding === "arc" && (
              <th scope="col" className="py-[4px] text-right font-medium">
                Del total
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {datos.map((d, i) => (
            <tr key={d.label} className="border-t border-lab-line">
              <th scope="row" className="py-[4px] text-left font-normal">
                <span
                  aria-hidden
                  className="mr-[8px] inline-block size-[8px] rounded-full bg-lab-accent"
                  style={{ opacity: OPACIDAD[i] }}
                />
                {d.label}
              </th>
              <td className="py-[4px] text-right">{format(d.value)}</td>
              {encoding === "arc" && (
                <td className="py-[4px] text-right">{Math.round(arcos(datos)[i].parte * 100)} %</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const ANCHO = 320;

/** El gráfico es una vista de la tabla: aria-hidden, porque la tabla ya lo dice todo. */
function Grafico({ datos, encoding, format }: { datos: Dato[]; encoding: Encoding; format: (v: number) => string }) {
  if (encoding === "length") {
    const l = longitudes(datos);
    const fila = 28;
    return (
      <svg aria-hidden viewBox={`0 0 ${ANCHO} ${datos.length * fila}`} className="w-full" data-marks="length">
        {datos.map((d, i) => (
          <g key={d.label} transform={`translate(0 ${i * fila})`}>
            <rect
              width={Math.max(2, l[i] * (ANCHO - 64))}
              height={fila - 10}
              rx={3}
              className="fill-lab-accent"
              style={{ opacity: OPACIDAD[i] }}
            />
            <text x={l[i] * (ANCHO - 64) + 8} y={fila / 2 - 1} className="fill-lab-ink text-[12px]">
              {format(d.value)}
            </text>
          </g>
        ))}
      </svg>
    );
  }
  if (encoding === "area") {
    const r = radios(datos);
    const celda = ANCHO / Math.max(1, datos.length);
    const rMax = Math.min(celda / 2 - 4, 56);
    return (
      <svg aria-hidden viewBox={`0 0 ${ANCHO} ${rMax * 2 + 22}`} className="w-full" data-marks="area">
        {datos.map((d, i) => (
          <g key={d.label} transform={`translate(${celda * i + celda / 2} ${rMax})`}>
            <circle r={Math.max(1.5, r[i] * rMax)} className="fill-lab-accent" style={{ opacity: OPACIDAD[i] }} />
            <text y={rMax + 16} textAnchor="middle" className="fill-lab-ink text-[12px]">
              {format(d.value)}
            </text>
          </g>
        ))}
      </svg>
    );
  }
  const a = arcos(datos);
  return (
    <svg aria-hidden viewBox="0 0 160 160" className="mx-auto w-[160px]" data-marks="arc">
      {a.map((s, i) =>
        s.parte > 0 ? (
          <path
            key={datos[i].label}
            d={trazoArco(80, 80, 72, 44, s.inicio, s.fin)}
            className="fill-lab-accent stroke-lab-surface"
            strokeWidth={2}
            style={{ opacity: OPACIDAD[i] }}
          />
        ) : null,
      )}
    </svg>
  );
}

export { EncodingCompare };
