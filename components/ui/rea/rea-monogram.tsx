"use client";

import { useEffect, useRef, useState } from "react";
import { pad2 } from "@/lib/rea/rea-utils";
import { useReducedMotion } from "@/lib/rea/use-reduced-motion";

/** Monograma "RA" que se traza al montar; el punto usa el color de acento. */
export function ReaMonogram({ label, className }: { label?: string; className?: string }) {
  return (
    <svg
      className={["rea-monogram", className].filter(Boolean).join(" ")}
      viewBox="0 0 55 32"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path pathLength={1} d="M3 29V3h11a8 8 0 0 1 0 16H3m11 0 9 10" />
      <path pathLength={1} d="M29 29 40 3l11 26m-18-8h14" />
      <circle cx="51" cy="28" r="2.6" />
    </svg>
  );
}

/**
 * Pantalla de carga con el monograma y un porcentaje que avanza en `duration` ms.
 * Es decorativa: no espera recursos reales, así que no debe ocultar contenido ya listo.
 * Con movimiento reducido no se muestra.
 */
export function ReaPreloader({
  duration = 900,
  top = ["Plotting rea-atlas", "rev. 2026"],
  bottom = "Human + machine",
  fullscreen = false,
  onDone,
}: {
  duration?: number;
  top?: [string, string];
  bottom?: string;
  fullscreen?: boolean;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  // En ref: si el padre pasa una función nueva en cada render, la animación no se reinicia.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (reduced) return;
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(t) {
      const p = Math.min(1, (t - started) / duration);
      setPct(p);
      if (p < 1) frame = requestAnimationFrame(tick);
      else {
        setDone(true);
        doneRef.current?.();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [reduced, duration]);
  if (reduced) return null;
  return (
    <div
      className="rea-preloader"
      data-done={done || undefined}
      data-fullscreen={fullscreen || undefined}
      aria-hidden="true"
    >
      <div className="rea-preloader-info rea-note" data-edge="top">
        <span>{top[0]}</span>
        <span>{top[1]}</span>
      </div>
      <ReaMonogram />
      <div className="rea-preloader-info rea-note" data-edge="bottom">
        <span>{bottom}</span>
        <span>{pad2(pct * 100)}%</span>
      </div>
    </div>
  );
}
