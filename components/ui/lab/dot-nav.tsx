"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Secuencia y orientación en un relato largo: una columna de puntos, uno por sección, que marca la sección
// visible y salta a cualquiera. Medido en Adobe «Running on Experience» (nav fija del borde izquierdo; DOM
// leído el 2026-10-17, evidencia/2026-10-17-adobe-dms): píldora de 42 px de ancho, radio 20 px, fondo negro
// al 20 %; siete enlaces de 24 × 24 px cada 29 px, radio 12 px, borde de 2 px transparente que pasa a blanco
// en la sección actual (opacidad 0,8 → 1), transición de 0,5 s cubic-bezier(0.215, 0.61, 0.355, 1); punto
// de 6 × 6 px. Encima, el nombre de la sección actual girado 90°, 12 px en versales con 4 px de interletra.
// Cambios respecto del original: allí los enlaces no tienen nombre accesible (el texto va en un <p> de
// tamaño cero) ni aria-current; aquí cada enlace se nombra, el actual lleva aria-current="location" y el
// nombre se ve al pasar el puntero o con foco (el hover del original no se midió). La sección actual se
// calcula con IntersectionObserver: la que cruza una línea al 40 % del alto visible.

export interface SeccionNav {
  /** id del elemento de la sección en la página. */
  id: string;
  label: string;
}

type DotNavProps = Omit<React.ComponentProps<"nav">, "children"> & {
  sections: SeccionNav[];
  /** Nombre de la navegación para lectores de pantalla. */
  label: string;
  /** Sección actual, si la controla quien la usa. Sin valor, se calcula con el scroll. */
  current?: string;
  /** Contenedor con scroll, si no es la ventana. */
  root?: React.RefObject<Element | null>;
  /** Muestra el nombre de la sección actual girado sobre la columna. */
  showCurrentLabel?: boolean;
};

/** De las secciones que cruzan la línea, la última en el orden del relato; si ninguna, se mantiene la anterior. */
export function seccionVisible(orden: string[], cruzando: Set<string>, anterior?: string): string | undefined {
  for (let i = orden.length - 1; i >= 0; i--) if (cruzando.has(orden[i])) return orden[i];
  return anterior;
}

function DotNav({ sections, label, current, root, showCurrentLabel = true, className, ...props }: DotNavProps) {
  const [visible, setVisible] = React.useState<string | undefined>(sections[0]?.id);
  const actual = current ?? visible;
  const ids = sections.map((s) => s.id).join("|");

  React.useEffect(() => {
    if (current !== undefined || typeof IntersectionObserver === "undefined") return;
    const orden = ids.split("|");
    const cruzando = new Set<string>();
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) cruzando.add(e.target.id);
          else cruzando.delete(e.target.id);
        }
        setVisible((ant) => seccionVisible(orden, cruzando, ant));
      },
      // Una línea horizontal al 40 % del alto: la sección que la cruza es la actual.
      { root: root?.current ?? null, rootMargin: "-40% 0px -60% 0px" },
    );
    for (const id of orden) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids, current, root]);

  const ir = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reducir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });
    // El foco va a la sección, como haría el ancla nativa.
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    if (current === undefined) setVisible(id);
  };
  const nombreActual = sections.find((s) => s.id === actual)?.label;

  return (
    <nav
      data-slot="dot-nav"
      aria-label={label}
      className={cn("relative inline-grid justify-items-center", className)}
      {...props}
    >
      {showCurrentLabel && (
        <span
          aria-hidden
          // Fuera del flujo, como en el original: si cambia de largo, la columna no se mueve.
          className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap text-left text-[12px] font-semibold uppercase leading-none tracking-[4px] text-lab-muted [writing-mode:vertical-rl]"
        >
          {nombreActual}
        </span>
      )}
      <ul className="m-0 grid w-[42px] list-none justify-items-center gap-[5px] rounded-[20px] bg-lab-ink px-0 py-[11px]">
        {sections.map((s) => {
          const sel = s.id === actual;
          return (
            <li key={s.id} className="group relative">
              <a
                href={`#${s.id}`}
                aria-current={sel ? "location" : undefined}
                onClick={(e) => ir(e, s.id)}
                className={cn(
                  "grid size-[24px] place-items-center rounded-[12px] border-2 [transition-property:border-color,opacity] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] motion-safe:duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent",
                  sel ? "border-lab-on-ink opacity-100" : "border-transparent opacity-80 hover:opacity-100",
                )}
              >
                <span aria-hidden className="size-[6px] rounded-full bg-lab-on-ink" />
                <span
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-[calc(100%+12px)] -translate-y-1/2 whitespace-nowrap rounded-[6px] bg-lab-ink px-[8px] py-[4px] text-[12px] font-semibold text-lab-on-ink",
                    // Se ve al pasar el puntero o con foco; siempre es el nombre accesible del enlace.
                    "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
                  )}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { DotNav };
