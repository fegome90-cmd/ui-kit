import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Magnitud: una cifra total dentro de un anillo, con su explicación debajo. Reconstruido desde las
// cifras de BioAge (evidencia/2026-10-17-bioage, platform t02). El anillo siempre va cerrado: enmarca,
// no mide. Un anillo parcial se leería como porcentaje.
const statRingVariants = cva(
  "grid shrink-0 place-items-center rounded-full border bg-lab-surface font-semibold text-lab-ink",
  {
    variants: {
      size: {
        sm: "size-[88px] text-[20px]",
        md: "size-[120px] text-[28px]",
        lg: "size-[156px] text-[36px]",
      },
      tone: {
        neutral: "border-lab-line",
        accent: "border-2 border-lab-accent",
      },
    },
    defaultVariants: { size: "md", tone: "neutral" },
  },
);

type StatRingProps = React.ComponentProps<"figure"> &
  VariantProps<typeof statRingVariants> & {
    /** La cifra tal como se muestra («2B», «988 M», «47 %»). */
    value: string;
    /** Qué cuenta la cifra. Es lo que permite leerla sin contexto. */
    caption: string;
  };

function StatRing({ value, caption, size, tone, className, ...props }: StatRingProps) {
  return (
    <figure
      data-slot="stat-ring"
      className={cn("m-0 inline-flex flex-col items-center gap-[10px] text-center", className)}
      {...props}
    >
      <span className={statRingVariants({ size, tone })}>{value}</span>
      <figcaption className="max-w-[18ch] text-[13px] leading-[1.4] text-lab-muted">{caption}</figcaption>
    </figure>
  );
}

export { StatRing, statRingVariants };
