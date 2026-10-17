import type * as React from "react";
import { angulosRanking, polar, rotuloRadial, sectores } from "@/lib/lab/graficos";
import { cn } from "@/lib/utils";

// Magnitud alrededor de un centro. Dos formas:
// - `bars`: una barra por categoría que sale del centro, largo proporcional al valor y el rótulo en la punta.
//   Observado en Updata One (puntas por tema en WebGL, rótulos alrededor; evidencia/2026-10-17-updata-one,
//   t05–t07). El 3D no se reproduce; el mecanismo 2D sí. Las barras arrancan de un círculo interior, así que
//   se compara el largo desde ese círculo, no el área: por eso son delgadas y de ancho fijo.
// - `ranking`: marcas ordenadas de mayor a menor desde las 12 en sentido horario, con área proporcional al
//   valor y un paso angular proporcional a su tamaño. Medido en Searching for Birds (nido «Most Googled
//   birds», SVG #bird-group-visualization, 2026-10-17): huevos centrados en un círculo de radio 180 (en 900 px),
//   la primera a −90° y la 25.ª a −115° (hueco de ~25°), rótulo «1 ● Hawk» hacia afuera, de 18 px el primero
//   a 9 px el último; en la mitad izquierda el rótulo se da vuelta («Swallow ● 10», anclado al final).
//   Los huevos llevan texturas y colores decorativos; aquí todas las marcas van en un color: el color no
//   codifica nada.
// En las dos, la lista ordenada (sr-only) es la fuente accesible con los valores.

export interface ItemRadial {
  label: string;
  value: number;
}

type RadialBarsProps = Omit<React.ComponentProps<"figure">, "children" | "title"> & {
  title: string;
  items: ItemRadial[];
  variant?: "bars" | "ranking";
  /** Unidad tras el número en la lista accesible. */
  unit?: string;
  /** Lado en px. */
  size?: number;
};

// Lienzo con aire para los rótulos: anillo + marca mayor + rótulo de ~120 caben en el radio de 300.
const V = 600;
const C = V / 2;

/** En `ranking`: los ítems de mayor a menor (el orden del original), con su puesto. */
export function ordenRanking(items: ReadonlyArray<ItemRadial>): (ItemRadial & { puesto: number })[] {
  return [...items].sort((a, b) => b.value - a.value).map((it, i) => ({ ...it, puesto: i + 1 }));
}

function RadialBars({ title, items, variant = "bars", unit = "", size = 520, className, ...props }: RadialBarsProps) {
  const max = Math.max(0, ...items.map((i) => i.value)) || 1;
  const lista = variant === "ranking" ? ordenRanking(items) : items.map((it, i) => ({ ...it, puesto: i + 1 }));
  const fmt = (v: number) => `${v.toLocaleString("es-CL")}${unit ? ` ${unit}` : ""}`;

  let marcas: React.ReactNode;
  if (variant === "ranking") {
    const anillo = 130;
    const hueco = (25 * Math.PI) / 180;
    // Área ∝ valor: el radio va con la raíz. Se achica todo si las marcas no caben en el anillo.
    const base = lista.map((it) => Math.sqrt(Math.max(0, it.value) / max));
    const suma = base.reduce((a, b) => a + b, 0) || 1;
    const rMax = Math.min(34, ((2 * Math.PI - hueco) * anillo) / (2.3 * suma));
    const ang = angulosRanking(
      base.map((b) => 2 * rMax * b + 4),
      hueco,
    );
    marcas = (
      <g data-marks="ranking">
        {lista.map((it, i) => {
          const r = Math.max(1.5, rMax * base[i]);
          const [x, y] = polar(C, C, anillo, ang[i]);
          // Pegado a cada marca, como en el original (el radio del rótulo baja con el tamaño).
          const [tx, ty] = polar(C, C, anillo + r + 8, ang[i]);
          const rot = rotuloRadial(ang[i]);
          const fs = 11 + 8 * base[i];
          return (
            <g key={it.label}>
              <circle cx={x} cy={y} r={r} className="fill-lab-accent" />
              <text
                transform={`translate(${tx} ${ty}) rotate(${rot.rotate})`}
                textAnchor={rot.anchor}
                dominantBaseline="middle"
                style={{ fontSize: fs }}
                className="fill-lab-ink"
              >
                {rot.volteado ? `${it.label} · ${it.puesto}` : `${it.puesto} · ${it.label}`}
              </text>
            </g>
          );
        })}
      </g>
    );
  } else {
    const r0 = 48;
    const r1 = 170;
    const sec = sectores(lista.length, 0);
    marcas = (
      <g data-marks="bars">
        <circle cx={C} cy={C} r={r0} className="fill-none stroke-lab-line" />
        {lista.map((it, i) => {
          const a = sec[i].medio;
          const largo = ((r1 - r0) * Math.max(0, it.value)) / max;
          const [x0, y0] = polar(C, C, r0, a);
          const [x1, y1] = polar(C, C, r0 + largo, a);
          const [tx, ty] = polar(C, C, r0 + largo + 8, a);
          const rot = rotuloRadial(a);
          return (
            <g key={it.label}>
              <line
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                strokeWidth={6}
                strokeLinecap="round"
                className="stroke-lab-accent"
              />
              <text
                transform={`translate(${tx} ${ty}) rotate(${rot.rotate})`}
                textAnchor={rot.anchor}
                dominantBaseline="middle"
                className="fill-lab-ink text-[14px]"
              >
                {it.label}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <figure data-slot="radial-bars" className={cn("m-0 grid justify-items-center gap-[10px]", className)} {...props}>
      <figcaption className="text-[15px] font-semibold text-lab-ink">{title}</figcaption>
      <svg aria-hidden viewBox={`0 0 ${V} ${V}`} style={{ width: size, maxWidth: "100%" }} className="overflow-visible">
        {marcas}
      </svg>
      <ol className="sr-only">
        {lista.map((it) => (
          <li key={it.label}>
            {it.label}: {fmt(it.value)}
          </li>
        ))}
      </ol>
    </figure>
  );
}

export { RadialBars };
