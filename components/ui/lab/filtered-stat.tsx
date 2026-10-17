"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Magnitud por segmento: una sola cifra grande y un selector que la cambia, para comparar segmentos sin
// cambiar de vista. Medido en Adobe «Running on Experience», sección Summary
// (evidencia/2026-10-17-adobe-dms, home t07–t08; DOM leído el 2026-10-17): General 24 % (+118 % desde 2016),
// Tech 28 % (+115 %), Finance 19 % (+171 %). Selector: píldora de 830 × 43 px, fondo negro al 30 %, radio
// 24 px, 4 px de relleno; seis botones de 130 × 35 px, radio 17 px, 12 px en negrita, versales, 4 px de
// interletra; el elegido pasa a fondo blanco y texto negro con transición de 0,5 s
// cubic-bezier(0.19, 1, 0.22, 1). La cifra cambia con un fundido (observado en cuadros a 150 ms; duración
// inferida). Un segmento con punto rojo («notification») abre un modal con una nota.
// Cambios respecto del original: allí son div sin rol ni teclado; aquí son radios nativos en un fieldset
// (Tab entra al elegido, las flechas cambian), la cifra se anuncia con aria-live y la nota va debajo de la cifra en vez de en un modal. Además,
// con `reference`, el segmento elegido muestra la cifra de referencia al lado (en Adobe hay que recordarla).

export interface Segmento {
  id: string;
  label: string;
  value: number;
  /** Texto bajo la cifra («+118 % desde 2016»). */
  detail?: React.ReactNode;
  /** Aclaración del dato (muestra chica, definición distinta…). Marca el segmento con un punto. */
  note?: React.ReactNode;
}

type FilteredStatProps = Omit<React.ComponentProps<"figure">, "children" | "title" | "onChange"> & {
  title: string;
  /** Nombre del selector para lectores de pantalla («Industria»). */
  label: string;
  segments: Segmento[];
  /** Unidad tras la cifra («%»). */
  unit?: string;
  /** Segmento contra el que se compara (suele ser el total). Se muestra al elegir otro. */
  reference?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
};

export function textoCifra(v: number, unit = ""): string {
  return `${v.toLocaleString("es-CL")}${unit ? ` ${unit}` : ""}`;
}

function FilteredStat({
  title,
  label,
  segments,
  unit = "",
  reference,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: FilteredStatProps) {
  const [interno, setInterno] = React.useState(defaultValue ?? segments[0]?.id);
  const activo = segments.find((s) => s.id === (value ?? interno)) ?? segments[0];
  const ref = reference ? segments.find((s) => s.id === reference) : undefined;
  const nombre = React.useId();
  const elegir = (id: string) => {
    if (value === undefined) setInterno(id);
    onValueChange?.(id);
  };
  if (!activo) return null;

  return (
    <figure
      data-slot="filtered-stat"
      className={cn("m-0 grid justify-items-center gap-[20px] text-center", className)}
      {...props}
    >
      <figcaption className="text-[15px] font-semibold text-lab-ink">{title}</figcaption>
      <div aria-live="polite" aria-atomic className="grid justify-items-center gap-[8px]">
        <span className="sr-only">{activo.label}: </span>
        {/* key: al cambiar de segmento se remonta y corre el fundido. */}
        <span
          key={activo.id}
          data-value
          className="text-[clamp(56px,12vw,112px)] font-bold leading-none tracking-[-0.03em] text-lab-ink tabular-nums motion-safe:animate-lab-fade"
        >
          {activo.value.toLocaleString("es-CL")}
          {unit && <span className="ml-[0.08em] text-[0.55em]">{unit}</span>}
        </span>
        {activo.detail && (
          <span className="text-[12px] font-bold uppercase tracking-[3px] text-lab-muted">{activo.detail}</span>
        )}
        {ref && ref.id !== activo.id && (
          <span data-reference className="text-[13px] text-lab-muted">
            {ref.label}: <span className="font-semibold text-lab-ink">{textoCifra(ref.value, unit)}</span>
          </span>
        )}
        {activo.note && (
          <span className="max-w-[44ch] rounded-[8px] bg-lab-accent-soft px-[12px] py-[8px] text-[13px] leading-[1.45] text-lab-ink">
            {activo.note}
          </span>
        )}
      </div>
      <fieldset className="m-0 flex w-full max-w-[830px] min-w-0 flex-wrap gap-[8px] rounded-[24px] border-0 bg-lab-ink p-[4px] max-[560px]:rounded-[20px]">
        <legend className="sr-only">{label}</legend>
        {segments.map((s) => {
          const sel = s.id === activo.id;
          return (
            <label
              key={s.id}
              className={cn(
                "relative grid h-[35px] min-w-[96px] flex-[1_1_auto] cursor-pointer place-items-center whitespace-nowrap rounded-[17px] px-[12px] text-[12px] font-bold uppercase tracking-[4px] max-[560px]:tracking-[2px] [transition-property:background-color,color] [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] motion-safe:duration-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lab-accent",
                sel ? "bg-lab-surface text-lab-ink" : "text-lab-on-ink hover:bg-lab-on-ink/15",
              )}
            >
              <input
                type="radio"
                name={nombre}
                value={s.id}
                checked={sel}
                onChange={() => elegir(s.id)}
                className="sr-only"
              />
              <span>
                {s.label}
                {s.note && (
                  <>
                    <span
                      aria-hidden
                      className="absolute top-[8px] ml-[-2px] size-[6px] rounded-full bg-lab-danger ring-2 ring-lab-ink"
                    />
                    <span className="sr-only"> (con nota)</span>
                  </>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>
    </figure>
  );
}

export { FilteredStat };
