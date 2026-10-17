"use client";

import { useEffect, useRef, useState } from "react";
import { pad2 } from "@/lib/rea/rea-utils";
import { useReducedMotion } from "@/lib/rea/use-reduced-motion";
import { cn } from "@/lib/utils";

const STROKE =
  "animate-rea-trace fill-none stroke-current stroke-[3.7] [stroke-dasharray:1] [stroke-dashoffset:1] [stroke-linecap:square] [stroke-linejoin:miter]";

/** Monograma "RA" que se traza al montar; el punto usa el color de acento. */
function ReaMonogram({ label, className }: { label?: string; className?: string }) {
  return (
    <svg
      data-slot="rea-monogram"
      className={cn("rea-monogram overflow-visible text-rea-ink", className)}
      viewBox="0 0 55 32"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path pathLength={1} d="M3 29V3h11a8 8 0 0 1 0 16H3m11 0 9 10" className={STROKE} />
      <path pathLength={1} d="M29 29 40 3l11 26m-18-8h14" className={cn(STROKE, "[animation-delay:0.29s]")} />
      <circle cx="51" cy="28" r="2.6" className="origin-[51px_28px] animate-rea-pop fill-rea-accent" />
    </svg>
  );
}

const INFO =
  "absolute inset-x-(--rea-gutter) flex items-center justify-between font-rea-mono text-[0.72rem] font-medium tracking-[0.02em] text-rea-muted uppercase";

/**
 * Pantalla de carga con el monograma y un porcentaje que avanza en `duration` ms.
 * Es decorativa: no espera recursos reales, así que no debe ocultar contenido ya listo.
 * Con movimiento reducido no se muestra.
 */
function ReaPreloader({
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
      data-slot="rea-preloader"
      className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center bg-rea-bg transition-[opacity,visibility] duration-600 ease-rea-out data-done:invisible data-done:opacity-0 data-fullscreen:fixed data-fullscreen:z-130"
      data-done={done || undefined}
      data-fullscreen={fullscreen || undefined}
      aria-hidden="true"
    >
      <div className={cn(INFO, "top-6")}>
        <span>{top[0]}</span>
        <span>{top[1]}</span>
      </div>
      <ReaMonogram className="h-[clamp(68px,11vw,150px)] w-auto" />
      <div className={cn(INFO, "bottom-6")}>
        <span>{bottom}</span>
        <span>{pad2(pct * 100)}%</span>
      </div>
    </div>
  );
}

export { ReaMonogram, ReaPreloader };
