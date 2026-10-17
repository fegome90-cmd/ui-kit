import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Tiles de 48x40, radio 16px, borde 1.5px gris + sombra suave (selector "Font shape")
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("grid grid-cols-3 gap-2", className)}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "flex h-10 w-12 items-center justify-center rounded-md border-[1.5px] border-border bg-card text-lg text-foreground/70 shadow-soft transition-[color,border-color,transform] duration-(--duration-color) ease-out-quart outline-none hover:text-foreground active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=on]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
