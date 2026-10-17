"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMagnetic } from "./use-magnetic";

/** Botón cuadrado de la barra de herramientas. `label` es obligatorio: suele mostrar solo un ícono. */
function ReaToolButton({
  label,
  magnetic = false,
  className,
  children,
  type = "button",
  ...props
}: Omit<React.ComponentProps<"button">, "aria-label"> & { label: string; magnetic?: boolean }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  useMagnetic(ref, magnetic);
  return (
    <button
      ref={ref}
      type={type}
      data-slot="rea-tool-button"
      className={cn(
        "inline-grid h-9 min-w-9 place-items-center border border-rea-line bg-transparent px-2.5 transition-[background-color,border-color,translate] duration-400 hover:border-rea-control-line hover:bg-rea-bg-raised [&_svg]:size-[17px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.5]",
        className,
      )}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

/** Punto del color de acento actual (para el botón que cambia el acento). */
function ReaAccentDot() {
  return <span className="block size-3 rounded-full bg-rea-accent" aria-hidden="true" />;
}

/** Ícono de tema (círculo mitad relleno). */
function ReaThemeIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.1" />
      <path d="M10 2.9a7.1 7.1 0 0 1 0 14.2z" fill="currentColor" />
    </svg>
  );
}

export { ReaAccentDot, ReaThemeIcon, ReaToolButton };
