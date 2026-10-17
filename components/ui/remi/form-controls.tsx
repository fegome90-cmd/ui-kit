import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Controles del panel de filtros del monitor. */

const CELL = cn(
  "relative flex w-[227px] min-w-0 flex-col gap-[3px] text-[11px] font-semibold",
  // Pictograma de dos capas pegado al borde derecho del campo.
  "after:pointer-events-none after:absolute after:right-px after:bottom-px after:remi-layers-icon",
);
const CONTROL =
  "h-[22px] w-full rounded-[1px] border border-remi-field-border bg-white text-[12px] font-normal text-remi-field-text italic";

/** Select con el pictograma azul de dos capas y contador opcional. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  count,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Número mostrado a la derecha (visual de la referencia). */
  count?: number;
  className?: string;
}) {
  return (
    <label data-slot="filter-select" className={cn(CELL, className)}>
      {label}
      {count !== undefined && (
        <span
          className="pointer-events-none absolute right-8 bottom-1 text-[12px] leading-[14px] text-remi-field-text italic"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(CONTROL, "appearance-none pl-[5px]", count !== undefined ? "pr-11" : "pr-[29px]")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Campo de búsqueda con el pictograma azul. */
export function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label data-slot="filter-input" className={cn(CELL, className)}>
      {label}
      <input
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(CONTROL, "pr-[31px] pl-2 placeholder:text-remi-placeholder")}
      />
    </label>
  );
}

/** Interruptor ON/OFF accesible (checkbox con role="switch"). */
export function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      data-slot="toggle-switch"
      className="flex min-h-6 cursor-pointer items-center gap-2 pr-2 pl-[9px] text-[11px] whitespace-nowrap max-[790px]:my-[7px]"
    >
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer absolute size-px opacity-0"
      />
      <span
        className={cn(
          "relative inline-flex h-6 w-[54px] items-center rounded-[20px] px-1 transition-colors duration-150 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-remi-focus",
          checked ? "justify-start bg-remi-switch-on" : "justify-end bg-remi-switch-off",
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "absolute top-[3px] left-[3px] size-[18px] rounded-full bg-white transition-transform duration-150",
            checked && "translate-x-[30px]",
          )}
        />
        <span className="text-[9px] text-white italic">{checked ? "ON" : "OFF"}</span>
      </span>
      <span>{label}</span>
    </label>
  );
}

/** Botón azul primario de la referencia. */
export function BlueButton({
  children,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      data-slot="blue-button"
      className="min-h-6 min-w-[69px] rounded-none border border-remi-primary-border bg-remi-primary px-[13px] py-0.5 font-semibold text-white hover:bg-remi-primary-hover"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
