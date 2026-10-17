import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Nombre accesible y tooltip. Obligatorio: el botón no tiene texto visible. */
  label: string;
  children: ReactNode;
}

/**
 * Botón sin fondo para íconos de la fila del monitor.
 * Área mínima 25×25 px; oscurece el ícono al pasar el mouse.
 */
export function IconButton({ label, children, className = "mini-button", ...rest }: IconButtonProps) {
  return (
    <button type="button" className={className} title={label} aria-label={label} {...rest}>
      {children}
    </button>
  );
}
