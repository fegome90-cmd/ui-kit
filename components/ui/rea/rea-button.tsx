"use client";

import * as React from "react";
import { useMagnetic } from "./use-magnetic";

type Common = {
  variant?: "solid" | "ghost";
  size?: "default" | "sm";
  /** Flecha al final; se desplaza en hover. */
  arrow?: "↗" | "↓" | "→" | null;
  /** Sigue al puntero (solo puntero fino y sin movimiento reducido). */
  magnetic?: boolean;
};

export type ReaButtonProps =
  | (Common & React.ComponentProps<"button"> & { href?: undefined })
  | (Common & React.ComponentProps<"a"> & { href: string });

/** Píldora del sitio REA: sólida (tinta) o fantasma (borde). Con href se renderiza como enlace. */
export function ReaButton({
  variant = "solid",
  size = "default",
  arrow = "↗",
  magnetic = false,
  className,
  children,
  ...props
}: ReaButtonProps) {
  const ref = React.useRef<HTMLElement>(null);
  useMagnetic(ref, magnetic);
  const cls = ["rea-btn", className].filter(Boolean).join(" ");
  const content = (
    <>
      {children}
      {arrow && (
        <span className="rea-btn-arrow" aria-hidden="true">
          {arrow}
        </span>
      )}
    </>
  );
  if (props.href !== undefined) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cls}
        data-variant={variant}
        data-size={size}
        {...(props as React.ComponentProps<"a">)}
      >
        {content}
      </a>
    );
  }
  const { type = "button", ...rest } = props as React.ComponentProps<"button">;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={cls}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {content}
    </button>
  );
}
