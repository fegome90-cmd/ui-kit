"use client";

import { type RefObject, useEffect, useState } from "react";
import { clamp, pad2 } from "@/lib/rea/rea-utils";

/** Regla graduada con barra de progreso y porcentaje. `value` va de 0 a 1. */
export function ReaScrollProgress({
  value,
  showLabel = true,
  label = "Progreso de lectura",
}: {
  value: number;
  showLabel?: boolean;
  label?: string;
}) {
  const pct = clamp(Number.isFinite(value) ? value : 0, 0, 1) * 100;
  return (
    <div
      data-slot="rea-scroll-progress"
      className="rea-ruler relative h-[7px]"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <span
        className="absolute bottom-0 left-0 h-0.5 bg-rea-accent transition-[width] duration-150 ease-linear"
        style={{ width: `${pct}%` }}
      />
      {showLabel && (
        <span
          className="absolute top-2.5 right-0 bg-rea-accent px-[0.35rem] py-[0.2rem] font-rea-mono text-[0.625rem] leading-none font-semibold text-rea-accent-ink"
          aria-hidden="true"
        >
          {pad2(pct)}%
        </span>
      )}
    </div>
  );
}

/** Progreso de desplazamiento (0..1) de la página o de un contenedor con scroll. */
export function useScrollProgress(target?: RefObject<HTMLElement | null>) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = target?.current ?? null;
    const source: HTMLElement | Window = el ?? window;
    let frame = 0;
    const read = () => {
      frame = 0;
      const top = el ? el.scrollTop : window.scrollY;
      const max = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      setValue(clamp(top / Math.max(1, max), 0, 1));
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    source.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(frame);
      source.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [target]);
  return value;
}
