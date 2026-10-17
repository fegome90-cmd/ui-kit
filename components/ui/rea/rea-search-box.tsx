"use client";

import type * as React from "react";

/** Búsqueda con lupa y atajo visible. La etiqueta es accesible aunque no se vea. */
export function ReaSearchBox({
  label,
  value,
  onValueChange,
  shortcut,
  placeholder = "Buscar componente, función o token…",
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "aria-label"> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Texto del atajo, p. ej. "⌘ K". Solo informa; el atajo lo registra quien lo usa. */
  shortcut?: string;
}) {
  return (
    <label className="rea-searchbox">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="10.8" cy="10.8" r="7" />
        <path d="m16 16 5 5" />
      </svg>
      <span className="rea-sr">{label}</span>
      <input
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
      />
      {shortcut && (
        <span className="rea-keycap rea-note" aria-hidden="true">
          {shortcut}
        </span>
      )}
    </label>
  );
}
