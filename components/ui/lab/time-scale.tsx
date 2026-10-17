"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Secuencia temporal: hitos ubicados en proporción al tiempo, no a intervalos iguales; el elegido muestra
// su contenido. Medido en Volume Industries (morevolume.com/story, evidencia/2026-10-17-volume): exactamente
// 90 px por año (2009 → 180 px, 2013 → 540, 2021 → 1260); año activo con rombo relleno. Los huecos dicen
// cuánto tiempo pasó, cosa que una línea equidistante esconde.
// Accesible como pestañas horizontales (flechas, Inicio, Fin). Con hitos muy juntos, `minUnitWidth` fija un
// ancho mínimo por unidad y la línea se desplaza horizontalmente en lugar de encimar rótulos.

export interface Hito {
  /** Posición en el tiempo (año, mes como número, timestamp…). */
  at: number;
  label: string;
  content: React.ReactNode;
}

type TimeScaleProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  events: Hito[];
  /** Nombre del grupo para lectores de pantalla. */
  label: string;
  /** Ancho mínimo en px por unidad de `at` (Volume: 90 px por año). */
  minUnitWidth?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (at: number) => void;
};

function TimeScale({
  events,
  label,
  minUnitWidth,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: TimeScaleProps) {
  const hitos = [...events].sort((a, b) => a.at - b.at);
  const [interno, setInterno] = React.useState(defaultValue ?? hitos[0]?.at);
  const activo = value ?? interno;
  const base = React.useId();
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const min = hitos[0]?.at ?? 0;
  const max = hitos[hitos.length - 1]?.at ?? 1;
  const rango = max - min || 1;
  const pos = (at: number) => ((at - min) / rango) * 100;
  const elegir = (at: number, enfocar = false) => {
    if (value === undefined) setInterno(at);
    onValueChange?.(at);
    if (enfocar) refs.current[hitos.findIndex((h) => h.at === at)]?.focus();
  };
  const tecla = (e: React.KeyboardEvent, i: number) => {
    const n = hitos.length;
    const d =
      e.key === "ArrowRight"
        ? Math.min(n - 1, i + 1)
        : e.key === "ArrowLeft"
          ? Math.max(0, i - 1)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : -1;
    if (d < 0) return;
    e.preventDefault();
    elegir(hitos[d].at, true);
  };
  const actual = hitos.find((h) => h.at === activo) ?? hitos[0];

  return (
    <div data-slot="time-scale" className={cn("grid gap-[20px]", className)} {...props}>
      <div className="overflow-x-auto px-[24px] pb-[4px]">
        <div
          role="tablist"
          aria-label={label}
          className="relative h-[56px]"
          style={{ minWidth: minUnitWidth === undefined ? undefined : `${rango * minUnitWidth}px` }}
        >
          <span aria-hidden className="absolute top-[11px] right-0 left-0 h-px bg-lab-line" />
          {hitos.map((h, i) => {
            const sel = h.at === actual?.at;
            return (
              <button
                key={h.at}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                id={`${base}-tab-${h.at}`}
                type="button"
                role="tab"
                aria-selected={sel}
                aria-controls={`${base}-panel`}
                tabIndex={sel ? 0 : -1}
                onClick={() => elegir(h.at)}
                onKeyDown={(e) => tecla(e, i)}
                className="absolute top-0 grid -translate-x-1/2 justify-items-center gap-[8px] rounded-[6px] px-[4px] pb-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent"
                style={{ left: `${pos(h.at)}%` }}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-[5px] size-[12px] rotate-45 border-2 border-lab-ink",
                    sel ? "bg-lab-ink" : "bg-lab-surface",
                  )}
                />
                <span className={cn("text-[12px] tabular-nums", sel ? "font-bold text-lab-ink" : "text-lab-muted")}>
                  {h.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={actual ? `${base}-tab-${actual.at}` : undefined}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA Tabs: el panel es enfocable si no tiene nada enfocable adentro.
        tabIndex={0}
        className="rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent"
      >
        {actual?.content}
      </div>
    </div>
  );
}

export { TimeScale };
