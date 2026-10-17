import type * as React from "react";
import { cn } from "@/lib/utils";

// Secuencia: las etapas de un proceso en orden. Dos formas observadas: chevrones encadenados (BioAge,
// platform t06: Target ID → Target validation → Discovery & development) y una línea con un punto por
// etapa (Meridian: Direct CRM Import → Data Enrichment → Customizable Setup). La tercera, `staircase`, es una
// escalera de etapas que acumulan, medida en Symbol Studio («Our processes make us effective»; DOM leído el
// 2026-10-17, evidencia/2026-10-17-symbol-studio): los números (32 px) alineados arriba; cada etapa con un
// montante de 1 px al 20 % que baja hasta su peldaño (166, 118 y 64 px), un tramo de acento de 40 px en lo
// alto del montante, un peldaño de 4 px y el rótulo debajo (16 px). Los peldaños se ensanchan (106, 185 y
// 237 px: ~2 : 3,5 : 4,5; aquí 2 : 3 : 4…). En 390 px mantiene la escalera con números de 24 px.
// Riesgo de lectura: una etapa no es el estado actual. Sin `current`, ninguna se destaca; con `current`,
// esa etapa lleva aria-current="step" y su marca cambia de forma (relleno), no solo de color.

export interface Paso {
  title: string;
  description?: React.ReactNode;
}

type ProcessStepsProps = Omit<React.ComponentProps<"ol">, "children"> & {
  steps: Paso[];
  variant?: "chevrons" | "timeline" | "staircase";
  /** Índice (desde 0) de la etapa en curso. Sin valor, solo se muestra el orden. */
  current?: number;
};

/** Alto del montante de la etapa `i` de `n`: de 166 a 64 px en pasos iguales (medido con tres etapas). */
export function altoMontante(i: number, n: number, alto = 166, bajo = 64): number {
  return n <= 1 ? alto : Math.round(alto - ((alto - bajo) * i) / (n - 1));
}

function ProcessSteps({ steps, variant = "chevrons", current, className, ...props }: ProcessStepsProps) {
  if (variant === "staircase") {
    return (
      <ol
        data-slot="process-steps"
        data-variant={variant}
        className={cn("m-0 flex list-none items-start p-0", className)}
        {...props}
      >
        {steps.map((s, i) => {
          const esActual = current === i;
          return (
            <li
              key={s.title}
              aria-current={esActual ? "step" : undefined}
              // Peldaños cada vez más anchos: la etapa siguiente contiene a la anterior.
              style={{ flexGrow: i + 2, flexBasis: 0 }}
              className="grid min-w-0 content-start"
            >
              <span
                aria-hidden
                data-riser
                className="relative block border-l border-lab-ink/20"
                style={{ height: altoMontante(i, steps.length) }}
              >
                <span
                  className={cn("absolute top-0 left-[-1px] h-[40px] bg-lab-accent", esActual ? "w-[3px]" : "w-px")}
                />
                <span
                  className={cn(
                    "block pl-[15px] text-[32px] leading-[1.4] tracking-[-0.04em] text-lab-ink tabular-nums max-[560px]:text-[24px]",
                    esActual && "font-semibold",
                  )}
                >
                  {i + 1}
                </span>
              </span>
              <span aria-hidden className={cn("block h-[4px]", esActual ? "bg-lab-accent" : "bg-lab-ink")} />
              <span className="grid gap-[4px] pt-[10px] pr-[12px]">
                <span className="text-[16px] font-semibold leading-[1.4] text-lab-ink max-[560px]:text-[12px]">
                  <span className="sr-only">{i + 1}. </span>
                  {s.title}
                </span>
                {s.description && <span className="text-[13px] leading-[1.45] text-lab-muted">{s.description}</span>}
                {esActual && <span className="text-[12px] font-semibold text-lab-ink">En curso</span>}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }
  return (
    <ol
      data-slot="process-steps"
      data-variant={variant}
      className={cn(
        "m-0 flex list-none gap-[8px] p-0 max-[560px]:flex-col",
        variant === "timeline" && "gap-[16px]",
        className,
      )}
      {...props}
    >
      {steps.map((s, i) => {
        const esActual = current === i;
        return (
          <li
            key={s.title}
            aria-current={esActual ? "step" : undefined}
            className="relative grid min-w-0 flex-1 content-start gap-[8px]"
          >
            {variant === "chevrons" ? (
              <span
                className={cn(
                  "flex min-h-[36px] items-center px-[22px] text-[13px] font-semibold max-[560px]:[clip-path:none] max-[560px]:rounded-[6px]",
                  esActual ? "bg-lab-ink text-lab-on-ink" : "bg-lab-accent-soft text-lab-ink",
                )}
                style={{
                  clipPath:
                    i === 0
                      ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
                      : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
                }}
              >
                <span className="truncate">
                  <span className="mr-[6px] tabular-nums opacity-70">{i + 1}</span>
                  {s.title}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-[10px]">
                <span
                  aria-hidden
                  className={cn(
                    "size-[12px] shrink-0 rounded-full border-2 border-lab-accent",
                    esActual ? "bg-lab-accent" : "bg-lab-surface",
                  )}
                />
                <span aria-hidden className="h-px flex-1 bg-lab-line max-[560px]:hidden" />
              </span>
            )}
            <span className="grid gap-[4px] px-[2px]">
              {variant === "timeline" && <span className="text-[15px] font-semibold text-lab-ink">{s.title}</span>}
              {s.description && <span className="text-[13px] leading-[1.45] text-lab-muted">{s.description}</span>}
              {esActual && <span className="text-[12px] font-semibold text-lab-ink">En curso</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export { ProcessSteps };
