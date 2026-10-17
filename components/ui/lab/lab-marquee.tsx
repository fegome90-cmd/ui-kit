import type * as React from "react";
import { cn } from "@/lib/utils";

// Marquesina: una fila de elementos que se desplaza sin fin. Medida en Meridian (@keyframes scroll y
// nsLogosMarquee, 45 s, infinite) para su fila de logos de clientes. El contenido va dos veces para que
// el bucle no tenga salto; la copia es aria-hidden e inerte. Se detiene al pasar el puntero o al enfocar
// dentro, y con movimiento reducido no se mueve: queda una fila que se puede recorrer con scroll.

type LabMarqueeProps = React.ComponentProps<"div"> & {
  /** Nombre del grupo para lectores de pantalla («Clientes», «Indicadores»…). */
  label: string;
  /** Segundos por vuelta. El valor medido es 45. */
  duration?: number;
};

function LabMarquee({ label, duration = 45, className, children, style, ...props }: LabMarqueeProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: un grupo con nombre, no un formulario (fieldset).
    <div
      data-slot="lab-marquee"
      role="group"
      aria-label={label}
      className={cn(
        "group/marquee overflow-x-auto motion-safe:overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
      style={style}
      {...props}
    >
      <div
        className="flex w-max motion-safe:animate-lab-marquee group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center gap-[48px] pr-[48px]">{children}</div>
        <div aria-hidden inert className="flex shrink-0 items-center gap-[48px] pr-[48px] motion-reduce:hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export { LabMarquee };
