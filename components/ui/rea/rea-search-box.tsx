"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

/** Búsqueda con lupa y atajo visible. La etiqueta es accesible aunque no se vea. */
export function ReaSearchBox({
  label,
  value,
  onValueChange,
  shortcut,
  placeholder = "Buscar componente, función o token…",
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "aria-label"> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Texto del atajo, p. ej. "⌘ K". Solo informa; el atajo lo registra quien lo usa. */
  shortcut?: string;
}) {
  return (
    <label
      data-slot="rea-search-box"
      className={cn(
        "flex min-h-12 max-w-[500px] flex-[1_1_240px] items-center gap-3 border border-rea-line-strong px-4 focus-within:border-rea-accent",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-[17px] flex-none fill-none stroke-current stroke-[1.5]"
      >
        <circle cx="10.8" cy="10.8" r="7" />
        <path d="m16 16 5 5" />
      </svg>
      <span className="sr-only">{label}</span>
      <input
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full min-w-0 border-0 bg-transparent text-[0.86rem] outline-none focus-visible:outline-none"
        {...props}
      />
      {shortcut && (
        <span
          className="border border-rea-line px-[5px] py-0.5 font-rea-mono text-[0.72rem] leading-[1.4] font-medium whitespace-nowrap text-rea-muted uppercase"
          aria-hidden="true"
        >
          {shortcut}
        </span>
      )}
    </label>
  );
}
