import type * as React from "react";
import { cn } from "@/lib/utils";

// Secuencia: las etapas de un proceso en orden. Dos formas observadas: chevrones encadenados (BioAge,
// platform t06: Target ID → Target validation → Discovery & development) y una línea con un punto por
// etapa (Meridian: Direct CRM Import → Data Enrichment → Customizable Setup).
// Riesgo de lectura: una etapa no es el estado actual. Sin `current`, ninguna se destaca; con `current`,
// esa etapa lleva aria-current="step" y su marca cambia de forma (relleno), no solo de color.

export interface Paso {
  title: string;
  description?: React.ReactNode;
}

type ProcessStepsProps = Omit<React.ComponentProps<"ol">, "children"> & {
  steps: Paso[];
  variant?: "chevrons" | "timeline";
  /** Índice (desde 0) de la etapa en curso. Sin valor, solo se muestra el orden. */
  current?: number;
};

function ProcessSteps({ steps, variant = "chevrons", current, className, ...props }: ProcessStepsProps) {
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
