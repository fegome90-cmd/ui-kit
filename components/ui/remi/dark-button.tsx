import type { ReactNode } from "react";

/** Botón oscuro con degradado (Imprimir / Firmar / Guardar). */
export function DarkButton({
  children,
  icon,
  onClick,
  disabled,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className="dark-button" onClick={onClick} disabled={disabled}>
      {icon && <span className="dark-button-icon">{icon}</span>}
      {children}
    </button>
  );
}
