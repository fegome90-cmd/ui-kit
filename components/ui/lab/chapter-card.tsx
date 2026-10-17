import type * as React from "react";
import { CATEGORICAS } from "@/lib/lab/semantica";
import { cn } from "@/lib/utils";

// Tarjeta de capítulo: imagen arriba y bloque de color con antetítulo, titular condensado y la lista de
// secciones. Medida en Voices from the Frontlines (overview, capítulo 2: 752 × 470, imagen 270 px con
// object-fit cover; antetítulo 12 px, 700, espaciado 1,8 px, mayúsculas; titular 64/48 en mayúsculas;
// secciones 12 px). Cada capítulo toma un color de la paleta categórica de Voices.
// Cambios: Voices escribe con el color de otro capítulo y 4 de sus 5 pares no llegan a 4,5:1 (amarillo
// sobre coral da 2,58); aquí el texto es el AA de cada color (lib/lab/semantica). El titular usa
// --font-lab-condensed en lugar de Mango Grotesque.

export interface Seccion {
  id: string;
  title: string;
}

// `media` y `title` existen como atributos de <a>: se reemplazan por los de la tarjeta.
type ChapterCardProps = Omit<React.ComponentProps<"a">, "title" | "media"> & {
  /** Número del capítulo (1 a 5 eligen el color; desde el 6 se repite). */
  index: number;
  title: string;
  /** Imagen; un <img> recibe object-fit cover. Un <svg> en línea necesita preserveAspectRatio="xMidYMid slice". */
  media: React.ReactNode;
  sections?: Seccion[];
};

function ChapterCard({ index, title, media, sections = [], className, ...props }: ChapterCardProps) {
  const color = CATEGORICAS[(index - 1) % CATEGORICAS.length];
  return (
    <a
      data-slot="chapter-card"
      className={cn(
        "grid overflow-hidden no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lab-accent",
        className,
      )}
      style={{ background: color.hex, color: color.texto }}
      {...props}
    >
      <span className="block aspect-[752/270] overflow-hidden [&>img]:size-full [&>img]:object-cover [&>svg]:size-full">
        {media}
      </span>
      <span className="grid gap-[10px] p-[24px]">
        <span className="text-[12px] leading-[12px] font-bold tracking-[1.8px] uppercase">Capítulo {index}</span>
        <span className="font-lab-condensed text-[64px] leading-[48px] font-bold tracking-[1.92px] whitespace-pre-line uppercase max-[480px]:text-[48px] max-[480px]:leading-[38px]">
          {title}
        </span>
        {sections.length > 0 && (
          <span className="mt-[6px] grid gap-[2px] text-[12px] leading-[18.6px]">
            {sections.map((s) => (
              <span key={s.id}>
                <span className="mr-[8px] tabular-nums">{s.id}</span>
                <strong>{s.title}</strong>
              </span>
            ))}
          </span>
        )}
      </span>
    </a>
  );
}

export { ChapterCard };
