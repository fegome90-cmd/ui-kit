import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";
import { cn } from "@/lib/utils";

// 30x18 visual (como el original), gris apagado / coral encendido; área táctil ampliada a 42x30
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-[18px] w-[30px] before:absolute before:-inset-[6px] before:rounded-full before:content-[''] shrink-0 items-center rounded-full bg-muted p-0.5 transition-colors duration-(--duration-color) ease-out-quart outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=checked]:bg-primary disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-3.5 rounded-full bg-card shadow-sm transition-transform duration-(--duration-move) ease-out-expo data-[state=checked]:translate-x-3" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
