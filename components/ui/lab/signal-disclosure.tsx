"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { PresenceDot } from "./presence-dot";

// Revelación: una señal mínima siempre visible y el detalle bajo demanda. Mecanismo observado en el
// FAQ de Paradigm y en la lista con panel de Meridian (evidencia/2026-10-17-{paradigm,meridian-ai}).
// Lo oculto sigue siendo recuperable: se abre con clic, Enter o Espacio (nunca solo con hover), el
// botón anuncia aria-expanded y el detalle queda en el DOM. La apertura anima las filas de una grilla
// de 0fr a 1fr en 0,3 s, como el acordeón de Meridian (grid-template-rows .3s, medido). Cerrado, el
// detalle es inert y pasa a visibility: hidden al terminar la transición, para que el cierre se vea.

type SignalDisclosureProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Lo que se ve siempre: qué hay detrás. */
  title: React.ReactNode;
  /** Resumen de una línea, visible también cerrado. */
  summary?: React.ReactNode;
  /** La señal a la izquierda. Por defecto, un punto de presencia decorativo. */
  signal?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function SignalDisclosure({
  title,
  summary,
  signal = <PresenceDot size="sm" />,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: SignalDisclosureProps) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const id = React.useId();
  const toggle = () => {
    if (openProp === undefined) setOpenState(!open);
    onOpenChange?.(!open);
  };

  return (
    <div
      data-slot="signal-disclosure"
      data-state={open ? "open" : "closed"}
      className={cn("rounded-[10px] border border-lab-line bg-lab-surface", className)}
      {...props}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-detalle`}
        onClick={toggle}
        className="flex w-full items-center gap-[12px] rounded-[10px] px-[16px] py-[12px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent"
      >
        <span className="flex size-[20px] shrink-0 items-center justify-center">{signal}</span>
        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="text-[15px] font-semibold text-lab-ink">{title}</span>
          {summary && <span className="text-[13px] text-lab-muted">{summary}</span>}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-[18px] shrink-0 text-lab-muted motion-safe:transition-transform motion-safe:duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        data-slot="signal-disclosure-panel"
        inert={!open}
        className={cn(
          "grid [transition-property:grid-template-rows,visibility] duration-0 motion-safe:duration-300 motion-safe:ease-lab-out",
          open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
        )}
      >
        <section
          id={`${id}-detalle`}
          aria-label={typeof title === "string" ? title : undefined}
          className="min-h-0 overflow-hidden"
        >
          <div className="border-t border-lab-line px-[16px] py-[12px] pl-[48px] text-[14px] leading-[1.5] text-lab-ink">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

export { SignalDisclosure };
