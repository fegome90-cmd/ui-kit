"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Scrollytelling: una escena fija a un lado y los pasos del relato al otro; al avanzar con el scroll, el
// paso que cruza el centro de la pantalla se vuelve el activo y la escena cambia. Observado en BioAge
// (platform, capturado por tramos t01–t09 en evidencia/2026-10-17-bioage): cada dato llega en su escena.
// El cambio de escena es un fundido de 0,4 s (inferido: BioAge usa transiciones de opacidad de 0,4–0,5 s).
// Recuperable: cada paso lleva su texto; las escenas inactivas son inert. Bajo 760 px no hay escena fija:
// cada escena va antes de su texto. Sin IntersectionObserver (o en tests) se ve el primer paso.

export interface PasoRelato {
  id: string;
  title: string;
  body?: React.ReactNode;
  /** La escena de este paso. Es decorativa: se muestra inerte y oculta a lectores de pantalla, así que
   * no debe llevar links ni controles; lo que haya que leer o accionar va en `body`. */
  visual: React.ReactNode;
}

type ScrollySectionProps = Omit<React.ComponentProps<"section">, "onChange"> & {
  steps: PasoRelato[];
  /** Aviso al cambiar de paso. */
  onStepChange?: (id: string) => void;
};

function ScrollySection({ steps, onStepChange, className, ...props }: ScrollySectionProps) {
  const [activo, setActivo] = React.useState(steps[0]?.id);
  const refs = React.useRef(new Map<string, HTMLElement>());
  const aviso = React.useRef(onStepChange);
  aviso.current = onStepChange;

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Una franja angosta en el centro de la pantalla: el paso que la cruza es el activo.
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas)
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.paso;
            if (id) {
              setActivo(id);
              aviso.current?.(id);
            }
          }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of refs.current.values()) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      data-slot="scrolly-section"
      className={cn("grid gap-[24px] min-[760px]:grid-cols-2 min-[760px]:gap-[48px]", className)}
      {...props}
    >
      <div aria-hidden className="hidden min-[760px]:block">
        <div className="sticky top-[10vh] grid h-[80vh] place-items-center">
          {steps.map((s) => (
            <div
              key={s.id}
              inert
              data-escena={s.id}
              className={cn(
                "col-start-1 row-start-1 size-full motion-safe:transition-opacity motion-safe:duration-[400ms]",
                s.id === activo ? "opacity-100" : "opacity-0",
              )}
            >
              {s.visual}
            </div>
          ))}
        </div>
      </div>
      <ol className="m-0 grid list-none gap-[24px] p-0">
        {steps.map((s, i) => (
          <li
            key={s.id}
            data-paso={s.id}
            aria-current={s.id === activo ? "step" : undefined}
            ref={(el) => {
              if (el) refs.current.set(s.id, el);
              else refs.current.delete(s.id);
            }}
            className="grid content-center gap-[12px] min-[760px]:min-h-[80vh]"
          >
            <div aria-hidden inert className="min-[760px]:hidden">
              {s.visual}
            </div>
            <span className="text-[12px] font-semibold tracking-[0.08em] text-lab-muted uppercase">
              {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </span>
            <h3
              className={cn(
                "m-0 text-[28px] leading-[1.15] font-semibold motion-safe:transition-colors motion-safe:duration-[400ms]",
                s.id === activo ? "text-lab-ink" : "text-lab-muted",
              )}
            >
              {s.title}
            </h3>
            {s.body && <div className="text-[16px] leading-[1.6] text-lab-muted">{s.body}</div>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export { ScrollySection };
