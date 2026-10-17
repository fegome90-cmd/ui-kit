import type * as React from "react";
import { cn } from "@/lib/utils";

// Tarjeta que se revela: en reposo la imagen va en escala de grises; al pasar el puntero o enfocar con
// teclado sube 2 px, gana sombra y la imagen toma color. Tiempos medidos en Voices from the Frontlines:
// transform 0,2 s, box-shadow 0,4 s, filter 0,5 s (y grayscale(1) en reposo). Que las tres transiciones
// formen esta tarjeta es inferido: en el sitio aparecen en tarjetas de capítulo y logos. Con movimiento
// reducido no sube; el color cambia igual, porque no es movimiento.

// `media` y `title` existen como atributos de <a>: se reemplazan por los de la tarjeta.
type LabRevealCardProps = Omit<React.ComponentProps<"a">, "media" | "title"> & {
  /** Imagen o ilustración. Se le aplica el filtro. */
  media: React.ReactNode;
  /** Etiqueta pequeña sobre el título (p. ej. «Capítulo 1»). */
  eyebrow?: string;
  title: string;
};

function LabRevealCard({ media, eyebrow, title, className, children, ...props }: LabRevealCardProps) {
  return (
    <a
      data-slot="lab-reveal-card"
      className={cn(
        "group/reveal grid overflow-hidden rounded-[12px] border border-lab-line bg-lab-surface text-lab-ink no-underline",
        "shadow-[0_4px_8px_0_rgb(0_0_0/0.1)] [transition:transform_0.2s,box-shadow_0.4s]",
        "hover:shadow-[0_4px_8px_0_rgb(0_0_0/0.2)] focus-visible:shadow-[0_4px_8px_0_rgb(0_0_0/0.2)]",
        "motion-safe:hover:-translate-y-[2px] motion-safe:focus-visible:-translate-y-[2px]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent",
        className,
      )}
      {...props}
    >
      <span className="block overflow-hidden grayscale transition-[filter] duration-500 group-hover/reveal:grayscale-0 group-focus-visible/reveal:grayscale-0">
        {media}
      </span>
      <span className="grid gap-[4px] p-[16px]">
        {eyebrow && (
          <span className="text-[12px] font-semibold tracking-[0.06em] text-lab-muted uppercase">{eyebrow}</span>
        )}
        <span className="text-[18px] leading-[1.15] font-bold">{title}</span>
        {children && <span className="text-[14px] text-lab-muted">{children}</span>}
      </span>
    </a>
  );
}

export { LabRevealCard };
