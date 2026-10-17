import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Fondos de Lab. Cada patrón reproduce un mecanismo medido en una referencia, con los tokens de la paleta
// activa (LabScope) y sin sus assets. Decorativos: nunca codifican información.
//   glow      resplandor del acento con viñeta (motivo de BioAge).
//   wash      lavado vertical que pasa por el acento suave y vuelve al fondo (Meridian, .ns-section_ai:
//             paradas 0 / 20 / 50 / 80 / 100 %).
//   aurora    dos resplandores del acento (Meridian, .ns-nav_card-dark: círculos en 88,6 % 40,4 % y
//             15,4 % 88,3 %, alcance 53 % y 35 %).
//   vignette  luz radial alta que cae al fondo (Paradigm: 50,94 % 33,51 %, corte al 32,8 %).
//   rotating  capa sobredimensionada que gira una vuelta cada 10 s, lineal (BioAge, .static-bg). En BioAge
//             gira una imagen; aquí, un degradado cónico propio. Solo con motion-safe.
const labBackdropVariants = cva("relative isolate overflow-hidden", {
  variants: {
    tone: {
      soft: "bg-lab-bg text-lab-ink",
      deep: "bg-lab-ink text-lab-on-ink",
    },
  },
  defaultVariants: { tone: "soft" },
});

const GLOW_AT = { corner: "85% 10%", center: "50% 45%" } as const;
export const PATTERNS = ["glow", "wash", "aurora", "vignette", "rotating"] as const;
export type Pattern = (typeof PATTERNS)[number];

const acento = (pct: number) => `color-mix(in oklab, var(--lab-accent) ${pct}%, transparent)`;

/** Capas del patrón (salvo rotating, que es un elemento aparte). */
function capas(pattern: Pattern, tone: "soft" | "deep", glow: keyof typeof GLOW_AT): string {
  const base = tone === "deep" ? "var(--lab-ink)" : "var(--lab-bg)";
  switch (pattern) {
    case "wash": {
      // En Meridian el lavado va sobre fondo claro y pasa por el menta (accent-soft). Sobre tinta, un tono
      // claro dejaría el texto sin contraste: se usa el acento al 30 % sobre la tinta.
      const medio = tone === "deep" ? `color-mix(in oklab, var(--lab-accent) 30%, ${base})` : "var(--lab-accent-soft)";
      return `linear-gradient(0deg, ${base}, transparent 30%), linear-gradient(${base} 0%, color-mix(in oklab, ${medio} 45%, ${base}) 20%, ${medio} 50%, color-mix(in oklab, ${medio} 80%, var(--lab-accent)) 80%, ${base} 100%)`;
    }
    case "aurora":
      return `radial-gradient(circle farthest-side at 88.6% 40.4%, ${acento(60)} 0%, transparent 53.3%), radial-gradient(circle farthest-side at 15.4% 88.3%, ${acento(60)} 0%, transparent 35.1%)`;
    case "vignette":
      return `radial-gradient(149% 66% at 50.94% 33.51%, color-mix(in oklab, var(--lab-accent) 18%, ${base}) 0%, ${base} 32.79%)`;
    default:
      return `radial-gradient(60% 70% at ${GLOW_AT[glow]}, ${acento(tone === "deep" ? 45 : 18)}, transparent 70%)`;
  }
}

type LabBackdropProps = React.ComponentProps<"div"> &
  VariantProps<typeof labBackdropVariants> & {
    /** Mecanismo de fondo. */
    pattern?: Pattern;
    /** Dónde cae el resplandor de `glow`, o sin resplandor. */
    glow?: "none" | keyof typeof GLOW_AT;
  };

function LabBackdrop({ tone, pattern = "glow", glow = "corner", className, children, ...props }: LabBackdropProps) {
  const t = tone ?? "soft";
  const conCapa = pattern !== "rotating" && (pattern !== "glow" || glow !== "none");
  return (
    <div
      data-slot="lab-backdrop"
      data-pattern={pattern}
      className={cn(labBackdropVariants({ tone }), className)}
      {...props}
    >
      {pattern === "rotating" && (
        // 300 % del contenedor (la capa de BioAge mide ≈2,8 veces la ventana) para que el giro no muestre bordes.
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <span
            className="absolute top-1/2 left-1/2 size-[300%] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-lab-rotate"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${acento(t === "deep" ? 55 : 22)} 70deg, transparent 150deg, ${acento(t === "deep" ? 30 : 12)} 230deg, transparent 320deg)`,
              filter: "blur(40px)",
            }}
          />
        </span>
      )}
      {conCapa && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: capas(pattern, t, glow === "none" ? "corner" : glow) }}
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, transparent 55%, color-mix(in oklab, ${
            t === "deep" ? "black" : "var(--lab-line)"
          } 35%, transparent))`,
        }}
      />
      {children}
    </div>
  );
}

export { LabBackdrop, labBackdropVariants };
