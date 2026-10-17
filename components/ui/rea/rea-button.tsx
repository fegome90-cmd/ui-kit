"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMagnetic } from "./use-magnetic";

const reaButtonVariants = cva(
  "group inline-flex items-center justify-center rounded-full border transition-[color,background-color,border-color,translate] duration-400 [transition-timing-function:ease,ease,ease,var(--ease-rea-magnetic)]",
  {
    variants: {
      variant: {
        solid: "border-rea-ink bg-rea-ink text-rea-bg hover:bg-rea-bg hover:text-rea-ink",
        ghost:
          "border-rea-line-strong bg-transparent text-rea-ink hover:border-rea-ink hover:bg-rea-ink hover:text-rea-bg",
      },
      size: {
        default: "min-h-[52px] gap-[15px] px-[23px] text-[0.95rem]",
        sm: "min-h-[39px] gap-2.5 px-[19px] text-[0.86rem]",
      },
    },
    defaultVariants: { variant: "solid", size: "default" },
  },
);

type Common = VariantProps<typeof reaButtonVariants> & {
  /** Flecha al final; se desplaza en hover. */
  arrow?: "↗" | "↓" | "→" | null;
  /** Sigue al puntero (solo puntero fino y sin movimiento reducido). */
  magnetic?: boolean;
};

type ReaButtonProps =
  | (Common & React.ComponentProps<"button"> & { href?: undefined })
  | (Common & React.ComponentProps<"a"> & { href: string });

/** Píldora del sitio REA: sólida (tinta) o fantasma (borde). Con href se renderiza como enlace. */
function ReaButton({ variant, size, arrow = "↗", magnetic = false, className, children, ...props }: ReaButtonProps) {
  const ref = React.useRef<HTMLElement>(null);
  useMagnetic(ref, magnetic);
  const cls = cn(reaButtonVariants({ variant, size }), className);
  const content = (
    <>
      {children}
      {arrow && (
        <span
          className="transition-transform duration-400 ease-rea-out group-hover:translate-x-1 group-hover:-translate-y-0.5"
          aria-hidden="true"
        >
          {arrow}
        </span>
      )}
    </>
  );
  if (props.href !== undefined) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        data-slot="rea-button"
        className={cls}
        {...(props as React.ComponentProps<"a">)}
      >
        {content}
      </a>
    );
  }
  const { type = "button", ...rest } = props as React.ComponentProps<"button">;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type={type} data-slot="rea-button" className={cls} {...rest}>
      {content}
    </button>
  );
}

export { ReaButton, type ReaButtonProps, reaButtonVariants };
