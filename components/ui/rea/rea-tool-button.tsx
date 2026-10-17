"use client";

import * as React from "react";
import { useMagnetic } from "./use-magnetic";

/** Botón cuadrado de la barra de herramientas. `label` es obligatorio: suele mostrar solo un ícono. */
export function ReaToolButton({
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
      className={["rea-tool", className].filter(Boolean).join(" ")}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

/** Punto del color de acento actual (para el botón que cambia el acento). */
export function ReaAccentDot() {
  return <span className="rea-accent-dot" aria-hidden="true" />;
}

/** Ícono de tema (círculo mitad relleno). */
export function ReaThemeIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.1" />
      <path d="M10 2.9a7.1 7.1 0 0 1 0 14.2z" fill="currentColor" />
    </svg>
  );
}
