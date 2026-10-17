"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Lista que abre un panel: a la izquierda los temas; el elegido se expande con su descripción y a la
// derecha (o debajo, en pantallas angostas) se muestra su panel. Medido en Meridian, sección «Meridian
// features» (evidencia/2026-10-17-meridian-ai/captures/home--funciones-*): ítem activo 260 px, inactivos
// 64 px, cambio por clic, sin rotación automática ni barra de progreso.
// En el original son div sin roles ARIA; aquí es un tablist vertical: flechas arriba/abajo, Inicio y Fin
// mueven la selección, y la descripción se abre con la animación de filas de la grilla (0,3 s).

export interface Funcion {
  id: string;
  title: string;
  description?: React.ReactNode;
  panel: React.ReactNode;
}

type FeatureTabsProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  items: Funcion[];
  /** Nombre del grupo para lectores de pantalla. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
};

function FeatureTabs({ items, label, value, defaultValue, onValueChange, className, ...props }: FeatureTabsProps) {
  const [interno, setInterno] = React.useState(defaultValue ?? items[0]?.id);
  const activo = value ?? interno;
  const base = React.useId();
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const elegir = (id: string, enfocar = false) => {
    if (value === undefined) setInterno(id);
    onValueChange?.(id);
    if (enfocar) refs.current[items.findIndex((it) => it.id === id)]?.focus();
  };
  const tecla = (e: React.KeyboardEvent, i: number) => {
    const n = items.length;
    const destino =
      e.key === "ArrowDown"
        ? (i + 1) % n
        : e.key === "ArrowUp"
          ? (i - 1 + n) % n
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : -1;
    if (destino < 0) return;
    e.preventDefault();
    elegir(items[destino].id, true);
  };
  const actual = items.find((it) => it.id === activo) ?? items[0];

  return (
    <div
      data-slot="feature-tabs"
      className={cn("grid gap-[16px] min-[760px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", className)}
      {...props}
    >
      <div role="tablist" aria-label={label} aria-orientation="vertical" className="grid content-start gap-[8px]">
        {items.map((it, i) => {
          const sel = it.id === actual?.id;
          return (
            <div
              key={it.id}
              className={cn(
                "rounded-[12px] border bg-lab-surface",
                sel ? "border-lab-line shadow-[0_5px_10px_0_rgb(0_0_0/0.08)]" : "border-transparent",
              )}
            >
              <button
                ref={(el) => {
                  refs.current[i] = el;
                }}
                id={`${base}-tab-${it.id}`}
                type="button"
                role="tab"
                aria-selected={sel}
                aria-controls={`${base}-panel`}
                tabIndex={sel ? 0 : -1}
                onClick={() => elegir(it.id)}
                onKeyDown={(e) => tecla(e, i)}
                className="flex w-full items-center gap-[12px] rounded-[12px] px-[16px] py-[14px] text-left text-[15px] font-semibold text-lab-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent"
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-[14px] shrink-0 rounded-[4px] border-2 border-lab-accent",
                    sel && "bg-lab-accent",
                  )}
                />
                {it.title}
              </button>
              {it.description && (
                <div
                  className={cn(
                    "grid [transition-property:grid-template-rows,visibility] duration-0 motion-safe:duration-300",
                    sel ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="m-0 px-[16px] pb-[14px] pl-[42px] text-[14px] leading-[1.5] text-lab-muted">
                      {it.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={actual ? `${base}-tab-${actual.id}` : undefined}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA Tabs: el panel es enfocable si no tiene nada enfocable adentro.
        tabIndex={0}
        className="min-h-[240px] rounded-[16px] bg-lab-ink p-[24px] text-lab-on-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent"
      >
        {actual?.panel}
      </div>
    </div>
  );
}

export { FeatureTabs };
