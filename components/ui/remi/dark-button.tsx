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
    <button
      type="button"
      data-slot="dark-button"
      className="inline-flex h-6 min-w-[108px] cursor-pointer items-center justify-center gap-2.5 rounded-[3px] border border-[#0d0d0d] bg-[linear-gradient(#5a5a5d,#2a2a2b_55%,#141414)] px-3 font-remi text-[11px] font-bold text-remi-dark-text shadow-[0_1px_1px_#0003] hover:bg-[linear-gradient(#6a6a6d,#333_55%,#1c1c1c)] disabled:cursor-default disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="-ml-1 inline-flex">{icon}</span>}
      {children}
    </button>
  );
}
