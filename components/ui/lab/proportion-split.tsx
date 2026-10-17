import type * as React from "react";
import { arcos, trazoArco } from "@/lib/lab/encodings";
import { cn } from "@/lib/utils";

// Proporción partida: un todo en dos o tres partes, cada una con su porcentaje y la lista de lo que
// contiene. Observado en Meridian («How does an investor actually spend their week?»), que es una imagen
// (evidencia/2026-10-17-meridian-ai/captures/home--proporcion): dos sectores separados de una torta con
// 47 % y 53 %. Allí los sectores no parecen dibujados en proporción; aquí el ángulo sale del valor
// (lib/lab/encodings: arcos) y el porcentaje va como texto, que es lo que se lee.

export interface Parte {
  label: string;
  value: number;
  items?: string[];
}

type ProportionSplitProps = Omit<React.ComponentProps<"figure">, "children"> & {
  title: string;
  /** Dos o tres partes del mismo todo. */
  parts: Parte[];
};

const FONDO = ["var(--lab-accent)", "var(--lab-ink)", "var(--lab-muted)"];

function ProportionSplit({ title, parts, className, ...props }: ProportionSplitProps) {
  const partes = parts.slice(0, 3);
  const a = arcos(partes);
  return (
    <figure data-slot="proportion-split" className={cn("m-0 grid gap-[16px]", className)} {...props}>
      <figcaption className="text-center text-[18px] font-semibold text-lab-ink">{title}</figcaption>
      <svg aria-hidden viewBox="0 0 200 200" className="mx-auto w-[min(100%,200px)]">
        {a.map((s, i) => {
          // Cada sector se aparta 6 px hacia afuera por su bisectriz, como los sectores separados del original.
          const medio = (s.inicio + s.fin) / 2;
          const dx = 6 * Math.sin(medio);
          const dy = -6 * Math.cos(medio);
          return s.parte > 0 ? (
            <path
              key={partes[i].label}
              d={trazoArco(100, 100, 88, 0.01, s.inicio, s.fin)}
              transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`}
              style={{ fill: FONDO[i] }}
            />
          ) : null;
        })}
      </svg>
      <div className="grid gap-[16px] min-[520px]:grid-flow-col min-[520px]:auto-cols-fr">
        {partes.map((p, i) => (
          <section key={p.label} className="grid content-start gap-[8px]">
            <h3 className="m-0 flex items-baseline gap-[8px] text-[13px] font-semibold tracking-[0.04em] text-lab-ink uppercase">
              <span aria-hidden className="size-[10px] shrink-0 rounded-full" style={{ background: FONDO[i] }} />
              {p.label}
              <span className="ml-auto text-[28px] leading-none font-bold tracking-normal normal-case tabular-nums">
                {Math.round(a[i].parte * 100)} %
              </span>
            </h3>
            {p.items && (
              <ul className="m-0 grid list-none gap-[6px] p-0">
                {p.items.map((it) => (
                  <li
                    key={it}
                    className="rounded-[8px] border border-lab-line bg-lab-surface px-[10px] py-[6px] text-[13px] text-lab-ink"
                  >
                    {it}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </figure>
  );
}

export { ProportionSplit };
