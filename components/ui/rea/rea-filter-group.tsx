"use client";

export type ReaFilterOption = { value: string; label: string; count?: number };

/**
 * Filtro de opción única con botones aria-pressed: chips (tipo) o subrayado (colección).
 * Siempre queda una opción activa; no hay preselección oculta.
 */
export function ReaFilterGroup({
  label,
  options,
  value,
  onValueChange,
  variant = "chip",
}: {
  label: string;
  options: ReaFilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  variant?: "chip" | "underline";
}) {
  return (
    <fieldset className="rea-filter-group" data-variant={variant}>
      <legend className="rea-sr">{label}</legend>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={variant === "chip" ? "rea-chip" : "rea-underline-tab"}
          aria-pressed={o.value === value}
          onClick={() => onValueChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && <span>{String(o.count).padStart(2, "0")}</span>}
        </button>
      ))}
    </fieldset>
  );
}
