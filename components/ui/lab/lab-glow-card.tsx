"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Tarjeta con brillo que sigue al puntero. Medido en Paradigm: borde de vidrio (blanco al 6 %), resplandor
// cian con drop-shadow de 12 px y transiciones de 0,2 s en las tarjetas. Que el brillo siga al puntero es
// inferido de su «Interactive Bento Grid» en Awwwards (bento, hover, glow, gradient), que solo está en video.
// Sin puntero (teclado o táctil) el brillo se centra al enfocar; con movimiento reducido no sigue al puntero.

type LabGlowCardProps = React.ComponentProps<"div">;

function LabGlowCard({ className, children, onPointerMove, style, ...props }: LabGlowCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lab-glow-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--lab-glow-y", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      data-slot="lab-glow-card"
      onPointerMove={mover}
      className={cn(
        "group/glow relative isolate overflow-hidden rounded-[16px] border border-[color-mix(in_oklab,var(--lab-ink)_6%,transparent)] bg-lab-surface p-[20px] text-lab-ink transition-[border-color] duration-200",
        "hover:border-[color-mix(in_oklab,var(--lab-accent)_40%,transparent)] focus-within:border-[color-mix(in_oklab,var(--lab-accent)_40%,transparent)]",
        className,
      )}
      style={style}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-focus-within/glow:opacity-100 group-hover/glow:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--lab-glow-x, 50%) var(--lab-glow-y, 50%), color-mix(in oklab, var(--lab-accent) 22%, transparent), transparent 70%)",
          filter: "drop-shadow(0 0 12px color-mix(in oklab, var(--lab-accent) 60%, transparent))",
        }}
      />
      {children}
    </div>
  );
}

export { LabGlowCard };
