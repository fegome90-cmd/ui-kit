import type * as React from "react";
import { cn } from "@/lib/utils";

export function KraaFieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="kraa-field-group" className={cn("grid gap-5", className)} {...props} />;
}
export function KraaField({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="kraa-field" className={cn("grid gap-2.5", className)} {...props} />;
}
export function KraaFieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return <fieldset data-slot="kraa-fieldset" className={cn("m-0 min-w-0 border-0 p-0", className)} {...props} />;
}
export function KraaFieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return <legend className={cn("mb-5 text-sm text-kraa-muted", className)} {...props} />;
}
export function KraaFieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  // biome-ignore lint/a11y/noLabelWithoutControl: primitiva genérica; quien la usa pasa htmlFor
  return <label className={cn("text-[13px] text-kraa-muted", className)} {...props} />;
}

/** Select nativo con el estilo de Kraa (antes, la clase .kraa-select). */
export function KraaSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="kraa-select"
      className={cn(
        "w-full max-w-full rounded-[8px] border border-kraa-border bg-kraa-surface-soft p-2 text-kraa-fg",
        className,
      )}
      {...props}
    />
  );
}
