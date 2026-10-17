import type * as React from "react";
import { cn } from "@/lib/utils";

// Tarjeta blanca, radio 32px, sin sombra. overflow: clip (no hidden) para que el foco/toque
// no pueda desplazar internamente el contenido y dejar asomar capas escondidas.
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("flex flex-col overflow-clip rounded-xl bg-card text-card-foreground transition-shadow", className)}
      {...props}
    />
  );
}
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-9 pt-9", className)} {...props} />;
}
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-start justify-between gap-4 px-9 pt-8 pb-6 text-sm leading-4", className)}
      {...props}
    />
  );
}
function CardTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-title" className={cn("text-sm font-bold leading-4", className)} {...props} />;
}
function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-sm leading-4", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardTitle };
