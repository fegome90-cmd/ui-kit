"use client";
import type * as React from "react";
import { cx } from "@/lib/kraa/kraa-utils";
export type KraaSearchInputProps = Omit<React.ComponentProps<"input">, "onChange" | "size"> & {
  label?: string;
  size?: "default" | "row";
  onValueChange?: (value: string) => void;
};
export function KraaSearchInput({
  label = "Buscar documentos",
  className,
  size = "default",
  onValueChange,
  ...props
}: KraaSearchInputProps) {
  return (
    <label className={cx("kraa-search", className)} data-size={size}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" />
        <path d="m15 15 5 5" />
      </svg>
      <span className="kraa-sr">{label}</span>
      <input type="search" placeholder="Buscar…" onChange={(e) => onValueChange?.(e.target.value)} {...props} />
    </label>
  );
}
