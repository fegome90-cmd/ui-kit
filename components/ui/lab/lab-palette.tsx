import type * as React from "react";
import { type Color, contraste, PALETAS, type PaletaLab, ROLES_COLOR, type RolColor } from "@/lib/lab/paletas";
import { cn } from "@/lib/utils";

// Tema: las paletas de Lab como tokens. LabScope aplica una paleta a lo que envuelve (mismos componentes,
// otra estética); LabPalette la muestra rol por rol, con su origen y su contraste contra la superficie.

type LabScopeProps = React.ComponentProps<"div"> & {
  palette?: PaletaLab;
  /** Pinta el fondo de la paleta. */
  surface?: boolean;
};

function LabScope({ palette = "neutral", surface = false, className, ...props }: LabScopeProps) {
  return (
    <div
      data-slot="lab-scope"
      data-lab-palette={palette === "neutral" ? undefined : palette}
      className={cn("lab", surface && "bg-lab-bg text-lab-ink", className)}
      {...props}
    />
  );
}

const ETIQUETA_ORIGEN: Record<Color["origen"], string> = { medido: "medido", derivado: "derivado", propio: "propio" };
// Umbral de cada rol contra la superficie: texto 4,5:1, marcas 3:1; fondo, línea y contexto no son
// portadores de información por sí solos.
const UMBRAL: Partial<Record<RolColor, number>> = { ink: 4.5, muted: 4.5, accent: 3 };

type LabPaletteProps = React.ComponentProps<"div"> & { palette: PaletaLab };

function LabPalette({ palette, className, ...props }: LabPaletteProps) {
  const { nombre, fuente, colores } = PALETAS[palette];
  return (
    <div data-slot="lab-palette" className={cn("grid gap-[10px]", className)} {...props}>
      <p className="m-0 text-[13px] text-lab-muted">
        <strong className="text-lab-ink">{nombre}</strong> · {fuente}
      </p>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-[8px] p-0">
        {ROLES_COLOR.map((rol) => {
          const c = colores[rol];
          const umbral = UMBRAL[rol];
          const ratio = contraste(c.hex, colores.surface.hex);
          return (
            <li
              key={rol}
              className="overflow-hidden rounded-[8px] border border-lab-line bg-lab-surface"
              title={c.nota}
            >
              <span aria-hidden className="block h-[44px] border-b border-lab-line" style={{ background: c.hex }} />
              <span className="grid gap-[2px] px-[10px] py-[8px] text-[12px]">
                <code className="bg-transparent p-0 text-[12px] text-lab-ink">--lab-{rol}</code>
                <span className="text-lab-muted">
                  {c.hex} · {ETIQUETA_ORIGEN[c.origen]}
                </span>
                {umbral !== undefined && (
                  <span className={ratio >= umbral ? "text-lab-muted" : "font-semibold text-lab-ink"}>
                    {ratio.toFixed(1)}:1 sobre superficie {ratio >= umbral ? "" : `(< ${umbral})`}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { LabPalette, LabScope };
