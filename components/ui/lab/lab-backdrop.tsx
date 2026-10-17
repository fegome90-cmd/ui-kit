import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Fondo: degradado con un único resplandor del acento y viñeta, para que el dato destaque sobre una
// superficie con profundidad. Motivo observado en BioAge (fondo violeta con un solo acento), rehecho
// con los tokens neutros de Lab. El resplandor es decorativo: nunca codifica información.
const labBackdropVariants = cva("relative isolate overflow-hidden", {
  variants: {
    tone: {
      soft: "bg-lab-bg text-lab-ink",
      deep: "bg-lab-ink text-white",
    },
  },
  defaultVariants: { tone: "soft" },
});

const GLOW_AT = { corner: "85% 10%", center: "50% 45%" } as const;

type LabBackdropProps = React.ComponentProps<"div"> &
  VariantProps<typeof labBackdropVariants> & {
    /** Dónde cae el resplandor del acento, o sin resplandor. */
    glow?: "none" | keyof typeof GLOW_AT;
  };

function LabBackdrop({ tone, glow = "corner", className, children, ...props }: LabBackdropProps) {
  return (
    <div data-slot="lab-backdrop" className={cn(labBackdropVariants({ tone }), className)} {...props}>
      {glow !== "none" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(60% 70% at ${GLOW_AT[glow]}, color-mix(in oklab, var(--lab-accent) ${
              tone === "deep" ? 45 : 18
            }%, transparent), transparent 70%)`,
          }}
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, transparent 55%, color-mix(in oklab, ${
            tone === "deep" ? "black" : "var(--lab-line)"
          } 35%, transparent))`,
        }}
      />
      {children}
    </div>
  );
}

export { LabBackdrop, labBackdropVariants };
