"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { pad2 } from "@/lib/rea/rea-utils";
import { useReducedMotion } from "@/lib/rea/use-reduced-motion";

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
    <section className="rea-stage" aria-label="Muestras" style={{ ["--rea-steps" as string]: items.length }}>
      <div className="rea-stage-side">
        <span className="rea-stage-number" aria-hidden="true">
          {pad2(index + 1)}/{pad2(items.length)}
        </span>
        <div className="rea-stage-meta">
          {current.tag && (
            <span className="rea-note" data-tone="accent">
              {current.tag}
            </span>
          )}
          <h3 className="rea-stage-name" aria-live="polite">
            {current.title}
          </h3>
          {current.description && <p className="rea-stage-blurb">{current.description}</p>}
          <div className="rea-stage-controls">
            <button type="button" onClick={() => move(-1)} aria-label="Muestra anterior">
              ← Anterior
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Muestra siguiente">
              Siguiente ↗
            </button>
          </div>
        </div>
        <fieldset className="rea-stage-steps">
          <legend className="rea-sr">Elegir muestra</legend>
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === current.id ? "true" : undefined}
              aria-label={`Ver ${item.title}`}
              onClick={() => onSelect(item.id)}
            >
              <span className="rea-note" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <br />
              <span aria-hidden="true">{item.short ?? item.title}</span>
            </button>
          ))}
        </fieldset>
      </div>
      <div className="rea-stage-art" data-caption={caption}>
        <div key={current.id} className="rea-stage-pane" data-animating={animating || undefined}>
          {current.render()}
        </div>
      </div>
    </section>
  );
}
