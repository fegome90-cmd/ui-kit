import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const noteVariants = cva("font-rea-mono text-[0.72rem] leading-[1.45] font-medium tracking-[0.02em] uppercase", {
  variants: {
    tone: { muted: "text-rea-muted", ink: "text-rea-ink", accent: "text-rea-accent-text" },
  },
  defaultVariants: { tone: "muted" },
});

/** Texto técnico en mono y mayúsculas (".note" del sitio). */
function ReaNote({ tone, className, ...props }: React.ComponentProps<"span"> & VariantProps<typeof noteVariants>) {
  return <span data-slot="rea-note" className={cn(noteVariants({ tone }), className)} {...props} />;
}

/** Línea superior con dos notas: título de sección a la izquierda y figura a la derecha. */
function ReaSectionHead({ title, aside, className }: { title: string; aside?: string; className?: string }) {
  return (
    <div
      data-slot="rea-section-head"
      className={cn("flex items-baseline justify-between gap-6 border-t border-rea-line-strong pt-3", className)}
    >
      <ReaNote tone="ink" className="font-bold">
        {title}
      </ReaNote>
      {aside && <ReaNote>{aside}</ReaNote>}
    </div>
  );
}

export { noteVariants, ReaNote, ReaSectionHead };
