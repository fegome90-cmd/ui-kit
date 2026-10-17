import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Panel flotante (tipo "Filter typefaces"): blanco, radio 32px,
 * sombra difusa de 80px, anclado abajo al centro, sin overlay oscuro.
 * En móvil actúa como bottom sheet: casi todo el ancho y con scroll interno.
 */
const Panel = DialogPrimitive.Root;
const PanelTrigger = DialogPrimitive.Trigger;
const PanelClose = DialogPrimitive.Close;

function PanelContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Content
        data-slot="panel-content"
        className={cn(
          "fixed bottom-2 left-1/2 z-50 max-h-[calc(100dvh-76px)] w-[min(820px,calc(100vw-16px))] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-xl bg-popover p-6 text-popover-foreground shadow-float outline-none sm:bottom-6 sm:p-9",
          "data-[state=open]:animate-panel-in data-[state=closed]:animate-panel-out",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-5 right-5 grid size-8 place-items-center opacity-80 sm:top-7 sm:right-7 transition-opacity duration-(--duration-color) ease-out-quart hover:opacity-100"
          aria-label="Cerrar"
        >
          <X className="size-5" strokeWidth={1.5} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function PanelTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-base font-medium", className)} {...props} />;
}

export { Panel, PanelClose, PanelContent, PanelTitle, PanelTrigger };
