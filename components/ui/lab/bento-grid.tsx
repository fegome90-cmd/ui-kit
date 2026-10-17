import type * as React from "react";
import { cn } from "@/lib/utils";
import { LabGlowCard } from "./lab-glow-card";

// Bento: tarjetas de dos anchos que se alternan por fila. Medido en Paradigm (servicios, evidencia/
// 2026-10-17-paradigm/captures/home--bento): contenedor de 1240 px, separación 16 px, tarjetas de 440 px de
// alto que alternan 498 / 726 px (2:3) y 726 / 498 en la fila siguiente; radio 26 px, borde de 1 px y
// transiciones de 0,5 s en el borde y en las capas de brillo. Cada celda es una LabGlowCard.
// Aquí es una grilla de 5 columnas: `sm` ocupa 2, `lg` 3 y `full` 5; bajo 760 px todo va a una columna.

type BentoGridProps = React.ComponentProps<"div">;

function BentoGrid({ className, ...props }: BentoGridProps) {
  return (
    <div
      data-slot="bento-grid"
      className={cn("grid grid-cols-1 gap-[16px] min-[760px]:grid-cols-5", className)}
      {...props}
    />
  );
}

const SPAN = { sm: "min-[760px]:col-span-2", lg: "min-[760px]:col-span-3", full: "min-[760px]:col-span-5" };

type BentoItemProps = React.ComponentProps<"div"> & {
  /** sm = 2/5 (498 px de 1240), lg = 3/5 (726 px), full = fila completa. */
  size?: keyof typeof SPAN;
};

function BentoItem({ size = "sm", className, ...props }: BentoItemProps) {
  return (
    <LabGlowCard
      data-bento-size={size}
      className={cn(
        "min-h-[220px] rounded-[26px] p-[28px] duration-500 min-[760px]:min-h-[440px]",
        SPAN[size],
        className,
      )}
      {...props}
    />
  );
}

export { BentoGrid, BentoItem };
