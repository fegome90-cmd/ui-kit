"use client";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type ReaFilterOption = { value: string; label: string; count?: number };

const reaFilterItem = cva("bg-transparent transition-colors duration-400", {
  variants: {
    variant: {
      chip: "rounded-full border border-rea-line-strong px-3.5 py-2 text-[0.76rem] text-rea-ink hover:border-rea-ink aria-pressed:border-rea-ink aria-pressed:bg-rea-ink aria-pressed:text-rea-bg",
      underline:
        "relative border-0 px-0 py-1 text-[0.75rem] tracking-[0.005em] text-rea-muted after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-rea-accent after:transition-transform after:duration-400 after:ease-rea-in-out hover:after:scale-x-100 aria-pressed:text-rea-ink aria-pressed:after:scale-x-100",
    },
  },
  defaultVariants: { variant: "chip" },
});

/**
 * Filtro de opción única con botones aria-pressed: chips (tipo) o subrayado (colección).
 * Siempre queda una opción activa; no hay preselección oculta.
 */
function ReaFilterGroup({
  label,
  options,
  value,
  onValueChange,
  variant = "chip",
  className,
}: {
  label: string;
  options: ReaFilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  variant?: "chip" | "underline";
  className?: string;
}) {
  return (
    <fieldset
      data-slot="rea-filter-group"
      className={cn(
        "m-0 flex min-w-0 flex-wrap border-0 p-0",
        variant === "chip" ? "gap-1.5" : "gap-x-[26px] gap-y-5",
        className,
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={reaFilterItem({ variant })}
          aria-pressed={o.value === value}
          onClick={() => onValueChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && (
            <span className="ml-1 font-rea-mono text-[0.62rem] opacity-55">{String(o.count).padStart(2, "0")}</span>
          )}
        </button>
      ))}
    </fieldset>
  );
}

export { ReaFilterGroup, reaFilterItem };
