import type * as React from "react";
import { cn } from "@/lib/utils";

// Texto con degradado: medido en los titulares de Paradigm (.word: radial-gradient(286.94% 255.84% at
// 43.93% 53.96%, blanco 0 %, #139bfd 100 %) recortado al texto). Aquí va de la tinta al acento de la
// paleta. El color sólido de respaldo es la tinta, así que sin background-clip el texto sigue legible.
// Ojo: el extremo de acento puede bajar de 4,5:1; úsalo en titulares grandes, no en texto corrido.

type LabGradientTextProps = React.ComponentProps<"span">;

function LabGradientText({ className, style, ...props }: LabGradientTextProps) {
  return (
    <span
      data-slot="lab-gradient-text"
      className={cn(
        "bg-clip-text text-lab-ink supports-[background-clip:text]:[-webkit-text-fill-color:transparent]",
        className,
      )}
      style={{
        backgroundImage: "radial-gradient(286.94% 255.84% at 43.93% 53.96%, var(--lab-ink) 0%, var(--lab-accent) 100%)",
        ...style,
      }}
      {...props}
    />
  );
}

export { LabGradientText };
