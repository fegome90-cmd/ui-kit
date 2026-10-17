import type * as React from "react";
import { cn } from "@/lib/utils";

// "Dash": la rayita negra de 32x4 que precede a los titulares (margen 15px; 10px ≥744px)
function Dash({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="dash"
      className={cn("mb-[15px] block h-1 w-8 bg-foreground sm:mb-2.5", className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr data-slot="separator" className={cn("h-0.5 w-full border-0 bg-muted", className)} {...props} />;
}

export { Dash, Separator };
