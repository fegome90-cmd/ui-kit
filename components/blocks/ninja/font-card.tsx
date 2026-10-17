import { Bookmark } from "lucide-react";
import * as React from "react";
import { Card } from "@/components/ui/ninja/card";
import { Slider } from "@/components/ui/ninja/slider";
import { cn } from "@/lib/utils";

export type FontCardProps = {
  name: string;
  foundry: string;
  price: string;
  styles: number;
  /** CSS font-family del espécimen */
  fontFamily: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  pangram?: string;
  href?: string;
  bookmarked?: boolean;
  onBookmarkChange?: (v: boolean) => void;
  className?: string;
};

/**
 * Tarjeta espécimen. En reposo: "Aa" gigante + metadatos.
 * Tamaños y paddings por breakpoint medidos en el original (240px de alto en móvil).
 * En hover (sólo dispositivos con hover) o foco de teclado (:focus-visible, no con toques) — 400ms ease-out-expo:
 *  - "Aa" se desvanece bajando ~40px
 *  - el pangrama entra desde -60px con fade rápido (130ms)
 *  - los metadatos suben 46px y la 2ª línea se oculta
 *  - sube desde abajo (+102px) la barra slider de tamaño + Bookmark
 */
export function FontCard({
  name,
  foundry,
  price,
  styles,
  fontFamily,
  fontWeight = 400,
  fontStyle = "normal",
  pangram = "The quick brown fox jumps over a lazy dog.",
  href = "#",
  bookmarked,
  onBookmarkChange,
  className,
}: FontCardProps) {
  const [size, setSize] = React.useState([40]);
  const [saved, setSaved] = React.useState(bookmarked ?? false);
  const isSaved = bookmarked ?? saved;
  const type = { fontFamily, fontWeight, fontStyle };
  const move = "duration-(--duration-move) ease-out-expo";

  return (
    <Card
      data-slot="font-card"
      className={cn(
        "group/card relative isolate h-[240px] sm:h-[304px] lg:h-[280px] xl:h-[314px] 2xl:h-[416px]",
        className,
      )}
    >
      {/* Enlace que cubre toda la tarjeta (debajo de la barra de acciones) */}
      {/* biome-ignore lint/a11y/useAnchorContent: enlace superpuesto que cubre la tarjeta; su nombre accesible es aria-label */}
      <a
        href={href}
        aria-label={`${name} — ${foundry}`}
        className="absolute inset-0 z-0 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      />
      {/* Espécimen */}
      <div
        className="pointer-events-none relative flex-1 overflow-hidden px-8 pt-8 sm:pt-12 md:px-10 md:pt-14 lg:pt-10 xl:px-14 xl:pt-12 2xl:pt-16"
        aria-hidden
      >
        <span
          className={cn(
            "block text-[110px] leading-[0.95] tracking-tight transition-[opacity,transform] sm:text-[150px] xl:text-[170px] 2xl:text-[240px]",
            move,
            "group-hover/card:translate-y-10 group-hover/card:opacity-0 group-has-[:focus-visible]/card:translate-y-10 group-has-[:focus-visible]/card:opacity-0",
          )}
          style={type}
        >
          Aa
        </span>
        <p
          data-slot="pangram"
          className={cn(
            "absolute inset-x-8 top-8 bottom-[34px] sm:bottom-[18px] sm:top-12 md:inset-x-10 md:top-14 lg:top-10 xl:inset-x-14 xl:top-12 -translate-y-[60px] overflow-hidden leading-[1.1] opacity-0 transition-[opacity,transform]",
            "[transition-duration:var(--duration-fade),var(--duration-move)] [transition-timing-function:var(--ease-out-expo)]",
            "group-hover/card:translate-y-0 group-hover/card:opacity-100 group-has-[:focus-visible]/card:translate-y-0 group-has-[:focus-visible]/card:opacity-100",
          )}
          style={{ ...type, fontSize: size[0] }}
        >
          {pangram}
        </p>
      </div>

      {/* Metadatos */}
      <div
        className={cn(
          "pointer-events-none flex items-start justify-between gap-4 px-8 pt-4 pb-6 text-sm leading-4 transition-transform sm:pt-8 sm:pb-8 md:px-10 xl:px-14 xl:pb-12 2xl:pb-10",
          move,
          "group-hover/card:-translate-y-[46px] group-has-[:focus-visible]/card:-translate-y-[46px]",
        )}
      >
        <div>
          <p data-slot="font-card-title" className="font-bold">
            {name}
          </p>
          <p
            className={cn(
              "transition-opacity",
              move,
              "group-hover/card:opacity-0 group-has-[:focus-visible]/card:opacity-0",
            )}
          >
            {foundry}
          </p>
        </div>
        <div>
          <p>From {price}</p>
          <p
            className={cn(
              "transition-opacity",
              move,
              "group-hover/card:opacity-0 group-has-[:focus-visible]/card:opacity-0",
            )}
          >
            {styles} {styles === 1 ? "style" : "styles"}
          </p>
        </div>
      </div>

      {/* Barra de acciones */}
      <div
        data-slot="font-card-actions"
        className={cn(
          "absolute inset-x-4 bottom-4 z-10 flex h-12 translate-y-[102px] transition-transform",
          move,
          "group-hover/card:translate-y-0 group-has-[:focus-visible]/card:translate-y-0",
        )}
      >
        <div className="flex flex-1 items-center rounded-l-xl bg-card px-6 shadow-soft">
          <Slider
            value={size}
            onValueChange={setSize}
            min={16}
            max={64}
            ticks={6}
            formatLabel={() => "A"}
            aria-label="Tamaño del pangrama"
          />
        </div>
        <button
          type="button"
          aria-pressed={isSaved}
          onClick={() => {
            const v = !isSaved;
            setSaved(v);
            onBookmarkChange?.(v);
          }}
          className="inline-flex items-center gap-2 rounded-r-xl bg-primary px-6 text-primary-foreground transition-colors duration-(--duration-color) ease-out-quart outline-none hover:bg-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <Bookmark className={cn("size-4", isSaved && "fill-current")} /> {isSaved ? "Saved" : "Bookmark"}
        </button>
      </div>
    </Card>
  );
}
