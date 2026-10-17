import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Nombre accesible y tooltip. Obligatorio: el botón no tiene texto visible. */
  label: string;
  children: ReactNode;
}

/**
 * Botón sin fondo para íconos de la fila del monitor.
 * Área mínima 25×25 px; oscurece el ícono al pasar el mouse. Los íconos traen su
 * tamaño natural (ver Icon); persona y "+" ajustan el ancho mínimo como en la captura.
 */
export function IconButton({ label, children, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      data-slot="icon-button"
      className={cn(
        "inline-grid min-h-[25px] min-w-[25px] place-items-center border-0 bg-transparent p-0 align-middle text-inherit hover:brightness-[0.88] focus-visible:outline-offset-0 has-[.icon-person]:min-w-6 has-[.icon-plus]:min-w-[22px] [&_svg]:block",
        className,
      )}
      title={label}
      aria-label={label}
      {...rest}
    >
      {children}
    </button>
  );
}
