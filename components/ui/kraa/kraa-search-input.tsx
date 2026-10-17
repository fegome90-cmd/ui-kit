"use client";
import type * as React from "react";
import { cn } from "@/lib/utils";

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
  const row = size === "row";
  return (
    <label
      data-slot="kraa-search-input"
      data-size={size}
      className={cn(
        "flex min-w-0 items-center text-kraa-muted",
        row ? "h-7 gap-2 rounded-[8px] py-0 pr-0.5 pl-2" : "gap-2.5 px-2 py-2.5",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn("shrink-0 fill-none stroke-current stroke-[1.5]", row ? "size-6" : "size-[18px]")}
      >
        <circle cx="10" cy="10" r="6.5" />
        <path d="m15 15 5 5" />
      </svg>
      <span className="sr-only">{label}</span>
      <input
        type="search"
        placeholder="Buscar…"
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "w-full min-w-0 border-0 bg-transparent text-kraa-fg outline-offset-4 placeholder:text-kraa-muted",
          row && "text-[13px] leading-[19px]",
        )}
        {...props}
      />
    </label>
  );
}
