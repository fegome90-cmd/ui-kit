import type { ReactNode } from "react";

/* Controles del panel de filtros. Usan las clases .filter-cell / .switch-field
   / .blue-button de app/globals.css. */

/** Select con el pictograma azul de dos capas y contador opcional. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  count,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Número mostrado a la derecha (visual de la referencia). */
  count?: number;
}) {
  return (
    <label className={`filter-cell filter-layered${count !== undefined ? " has-count" : ""}`}>
      {label}
      {count !== undefined && (
        <span className="filter-count" aria-hidden="true">
          {count}
        </span>
      )}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="filter-cell filter-layered">
      {label}
      <input
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
    <label className="switch-field">
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
        <span className="switch-text">{checked ? "ON" : "OFF"}</span>
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
    <button type={type} className="blue-button" onClick={onClick}>
      {children}
    </button>
  );
}
