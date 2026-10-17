import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Burger de 3 barras finas que se transforma en X (original: barras con
 * transform 0.66–0.8s ease-out-expo, la central con 140ms de retraso).
 * Puede usarse controlado (open + onOpenChange) o como trigger de Radix (asChild).
 */
function MenuToggle({
  open,
  onOpenChange,
  className,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { open: boolean; onOpenChange?: (open: boolean) => void }) {
  const bar =
    "absolute left-0 h-px w-full bg-foreground transition-[translate,rotate,scale] duration-(--duration-burger) ease-out-expo";
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      data-state={open ? "open" : "closed"}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange?.(!open);
      }}
      className={cn(
        "group relative size-8 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-x-1 top-1/2 h-[7px] -translate-y-1/2">
        <span
          className={cn(bar, "top-0 group-data-[state=open]:translate-y-[3px] group-data-[state=open]:rotate-45")}
        />
        <span className={cn(bar, "top-[3px] delay-[140ms] group-data-[state=open]:scale-x-0")} />
        <span
          className={cn(bar, "top-[6px] group-data-[state=open]:-translate-y-[3px] group-data-[state=open]:-rotate-45")}
        />
      </span>
    </button>
  );
}

export { MenuToggle };
