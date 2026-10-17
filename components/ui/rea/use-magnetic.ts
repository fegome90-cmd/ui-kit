"use client";

import { type RefObject, useEffect } from "react";

/**
 * Desplaza el elemento hacia el puntero (factor ~0,2), como los botones del sitio.
 * Solo con puntero fino, pantallas ≥900px y sin movimiento reducido; es una mejora, no una función.
 * Usa la propiedad `translate` (la misma que las utilidades translate-* de Tailwind).
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const ok = matchMedia("(pointer: fine) and (min-width: 900px)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok || reduced) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.19}px ${(e.clientY - r.top - r.height / 2) * 0.22}px`;
    };
    const leave = () => {
      el.style.translate = "0 0";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.style.translate = "";
    };
  }, [ref, enabled]);
}
