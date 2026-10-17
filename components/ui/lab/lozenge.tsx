import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Lozenge y contador, con las reglas de uso de Atlassian (atlassian.design: Lozenge y Badge, leídas el
// 2026-10-17). Separan dos cosas que un punto de color mezclaría:
//   LabLozenge  un atributo con significado (estado, prioridad, permiso): texto, nunca solo color; no es
//               interactivo; 200 px como máximo y trunca; en minúscula inicial (sentence case).
//   LabCount    una cantidad: solo números (con signo +/− o abreviatura), formateados según el idioma, y
//               siempre junto a lo que cuenta.

const tonos = {
  neutral: "bg-lab-accent-soft text-lab-ink",
  info: "bg-lab-info-soft text-lab-info",
  success: "bg-lab-success-soft text-lab-success",
  warning: "bg-lab-warning-soft text-lab-warning",
  danger: "bg-lab-danger-soft text-lab-danger",
};

const lozengeVariants = cva(
  "inline-flex h-[20px] max-w-[200px] items-center gap-[4px] rounded-[4px] px-[6px] align-middle text-[12px] font-semibold",
  { variants: { tone: tonos }, defaultVariants: { tone: "neutral" } },
);

type LabLozengeProps = React.ComponentProps<"span"> &
  VariantProps<typeof lozengeVariants> & {
    /** Ícono opcional que refuerza el significado. Va oculto: el texto ya lo dice. */
    icon?: React.ReactNode;
    /** Métrica que apoya la etiqueta (p. ej. puntaje). Solo en tonos con significado. */
    metric?: number;
  };

function LabLozenge({ tone, icon, metric, className, children, ...props }: LabLozengeProps) {
  return (
    <span data-slot="lab-lozenge" className={cn(lozengeVariants({ tone }), className)} {...props}>
      {icon && (
        <span aria-hidden className="flex shrink-0 [&_svg]:size-[12px]">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {metric !== undefined && tone && tone !== "neutral" && (
        <LabCount value={metric} tone={tone} bold className="-mr-[2px] ml-[2px]" />
      )}
    </span>
  );
}

const countVariants = cva(
  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[6px] align-middle text-[12px] font-semibold tabular-nums",
  {
    variants: {
      tone: tonos,
      bold: { true: "", false: "" },
    },
    compoundVariants: [
      { tone: "neutral", bold: true, class: "bg-lab-ink text-lab-on-ink" },
      { tone: "info", bold: true, class: "bg-lab-info text-lab-surface" },
      { tone: "success", bold: true, class: "bg-lab-success text-lab-surface" },
      { tone: "warning", bold: true, class: "bg-lab-warning text-lab-surface" },
      { tone: "danger", bold: true, class: "bg-lab-danger text-lab-surface" },
    ],
    defaultVariants: { tone: "neutral", bold: false },
  },
);

type LabCountProps = Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof countVariants> & {
    value: number;
    /** Muestra + en valores positivos (cambios). */
    signed?: boolean;
    /** Abrevia (1,2 mil; 3,4 M) con el idioma dado. */
    compact?: boolean;
    locale?: string;
  };

/** Formatea el valor del contador: separadores del idioma, signo opcional y abreviatura opcional. */
export function formatoContador(value: number, { signed = false, compact = false, locale = "es-CL" } = {}) {
  return new Intl.NumberFormat(locale, {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value);
}

function LabCount({ value, signed, compact, locale, tone, bold, className, ...props }: LabCountProps) {
  return (
    <span data-slot="lab-count" className={cn(countVariants({ tone, bold }), className)} {...props}>
      {formatoContador(value, { signed, compact, locale })}
    </span>
  );
}

export { LabCount, LabLozenge };
