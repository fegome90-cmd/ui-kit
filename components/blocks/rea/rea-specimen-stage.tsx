"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { ReaNote } from "@/components/ui/rea/rea-note";
import { pad2 } from "@/lib/rea/rea-utils";
import { useReducedMotion } from "@/lib/rea/use-reduced-motion";
import { cn } from "@/lib/utils";

export type ReaStageItem = {
  id: string;
  title: string;
  /** Rótulo en acento, p. ej. "01 · REA / COMPONENT". */
  tag?: string;
  description?: string;
  /** Nombre corto del paso inferior. */
  short?: string;
  render: () => ReactNode;
};

const PILL =
  "rounded-full border border-rea-line-strong bg-transparent px-[15px] py-[9px] text-[0.8rem] hover:border-rea-accent hover:text-rea-accent-text";

/**
 * Escenario de muestras: contador grande, ficha, Anterior/Siguiente y pasos a la izquierda;
 * la muestra interactiva a la derecha entra con un barrido. Controlado (selectedId/onSelect).
 * El scrollytelling sticky del sitio original no se incluye: aquí el avance es explícito.
 */
export function ReaSpecimenStage({
  items,
  selectedId,
  onSelect,
  caption = "FIG. 02 / INTERACTIVE SPECIMEN",
}: {
  items: ReaStageItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  caption?: string;
}) {
  const reduced = useReducedMotion();
  const index = Math.max(
    0,
    items.findIndex((i) => i.id === selectedId),
  );
  const current = items[index];
  const prevId = useRef(current?.id);
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    if (!current || prevId.current === current.id) return;
    prevId.current = current.id;
    if (reduced) return;
    setAnimating(true);
    const t = window.setTimeout(() => setAnimating(false), 1200);
    return () => window.clearTimeout(t);
  }, [current, reduced]);

  if (!current) return null;
  const move = (dir: number) => onSelect(items[(index + dir + items.length) % items.length].id);
  return (
    <section
      data-slot="rea-specimen-stage"
      aria-label="Muestras"
      className="grid min-w-0 grid-cols-12 gap-(--rea-col-gap) max-[1099px]:grid-cols-1"
    >
      <div className="col-span-4 flex min-h-[420px] min-w-0 flex-col max-[1099px]:col-span-1 max-[1099px]:min-h-0">
        <span
          className="text-rea-step-4 leading-[0.87] font-medium tracking-[-0.065em] tabular-nums max-[1099px]:text-rea-step-3"
          aria-hidden="true"
        >
          {pad2(index + 1)}/{pad2(items.length)}
        </span>
        <div className="pt-[18px] pb-[5px]">
          {current.tag && <ReaNote tone="accent">{current.tag}</ReaNote>}
          <h3 className="mt-3 mb-2.5 text-rea-step-2 leading-[1.05] font-medium tracking-[-0.055em]" aria-live="polite">
            {current.title}
          </h3>
          {current.description && <p className="m-0 mb-4 max-w-[37ch] text-rea-muted">{current.description}</p>}
          <div className="mt-2 flex items-center gap-3">
            <button type="button" className={PILL} onClick={() => move(-1)} aria-label="Muestra anterior">
              ← Anterior
            </button>
            <button type="button" className={PILL} onClick={() => move(1)} aria-label="Muestra siguiente">
              Siguiente ↗
            </button>
          </div>
        </div>
        <fieldset
          className="m-0 mt-auto grid min-w-0 gap-2.5 border-0 p-0 max-[1099px]:mt-[22px]"
          style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
        >
          <legend className="sr-only">Elegir muestra</legend>
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === current.id ? "true" : undefined}
              aria-label={`Ver ${item.title}`}
              onClick={() => onSelect(item.id)}
              className="relative w-full border-0 border-t-2 border-rea-line bg-transparent py-2.5 text-left text-[0.73rem] text-rea-muted before:absolute before:-top-0.5 before:left-0 before:h-0.5 before:w-full before:origin-left before:scale-x-0 before:bg-rea-ink before:transition-transform before:duration-400 before:ease-rea-out aria-[current=true]:text-rea-accent-text aria-[current=true]:before:scale-x-100"
            >
              <ReaNote aria-hidden="true">{pad2(i + 1)}</ReaNote>
              <br />
              <span aria-hidden="true">{item.short ?? item.title}</span>
            </button>
          ))}
        </fieldset>
      </div>
      <div
        data-caption={caption}
        className="relative isolate col-span-8 grid min-h-[370px] min-w-0 place-items-center overflow-hidden rounded-[4px] bg-rea-bg-raised max-[1099px]:col-span-1 max-[1099px]:min-h-80 after:absolute after:right-[18px] after:bottom-4 after:font-rea-mono after:text-[0.64rem] after:font-medium after:tracking-[0.03em] after:text-rea-muted after:content-[attr(data-caption)_/_'']"
      >
        <div className="rea-grid-paper pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
        <div
          key={current.id}
          data-animating={animating || undefined}
          className={cn(
            "relative z-1 grid size-full min-h-[370px] min-w-0 place-items-center p-[clamp(20px,3vw,48px)] max-[1099px]:min-h-80",
            "data-animating:animate-rea-stage-in",
          )}
        >
          {current.render()}
        </div>
      </div>
    </section>
  );
}
