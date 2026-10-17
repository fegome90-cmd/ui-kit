import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Presencia: «hay algo aquí», no cuánto ni qué tan grave. Reconstruido desde los marcadores de
// punto con anillos del mapa de Voices from the Frontlines (evidencia/2026-10-17-voices-frontlines).
// El pulso no se observó (capturas sin animación): es inferido y solo corre con motion-safe.
const presenceDotVariants = cva("relative inline-flex shrink-0 rounded-full", {
  variants: {
    size: {
      sm: "size-[8px]",
      md: "size-[12px]",
      lg: "size-[16px]",
    },
    tone: {
      accent: "bg-lab-accent text-lab-accent",
      muted: "bg-lab-muted text-lab-muted",
    },
  },
  defaultVariants: { size: "md", tone: "accent" },
});

type PresenceDotProps = Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof presenceDotVariants> & {
    /** Qué significa el punto. Sin etiqueta, el punto es decorativo y se oculta a lectores de pantalla. */
    label?: string;
    /** Anillos concéntricos fijos (0–2): llaman la atención sin movimiento. */
    rings?: 0 | 1 | 2;
    /** Pulso que se expande y se apaga. Solo con prefers-reduced-motion: no-preference. */
    pulse?: boolean;
  };

function PresenceDot({ label, rings = 0, pulse = false, size, tone, className, ...props }: PresenceDotProps) {
  // Con etiqueta es una imagen con nombre; sin ella, decoración que el lector de pantalla salta.
  const a11y = label ? ({ role: "img", "aria-label": label } as const) : ({ "aria-hidden": true } as const);
  return (
    <span data-slot="presence-dot" {...a11y} className={cn(presenceDotVariants({ size, tone }), className)} {...props}>
      {Array.from({ length: rings }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: los anillos son posiciones fijas, no datos.
          key={i}
          aria-hidden
          className="absolute rounded-full border border-current opacity-35"
          style={{ inset: `${-(i + 1) * 4}px` }}
        />
      ))}
      {pulse && <span aria-hidden className="absolute inset-0 rounded-full bg-current motion-safe:animate-lab-pulse" />}
    </span>
  );
}

export { PresenceDot, presenceDotVariants };
