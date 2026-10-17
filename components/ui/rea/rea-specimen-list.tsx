"use client";

import { pad2 } from "@/lib/rea/rea-utils";
import { cn } from "@/lib/utils";

export type ReaSpecimen = { id: string; title: string; meta?: string };

/**
 * Índice de muestras: filas grandes que se invierten al pasar el puntero o con foco.
 * La seleccionada lleva aria-current y el título en color de acento.
 */
export function ReaSpecimenList({
  items,
  selectedId,
  onSelect,
  label = "Índice de muestras",
  emptyText = "No hay elementos con los filtros actuales.",
}: {
  items: ReaSpecimen[];
  selectedId?: string;
  onSelect: (id: string) => void;
  label?: string;
  emptyText?: string;
}) {
  if (!items.length)
    return (
      <p className="pt-[26px] pb-8 font-rea-mono text-[13px] font-medium text-rea-muted" role="status">
        {emptyText}
      </p>
    );
  return (
    <ul
      data-slot="rea-specimen-list"
      className="m-0 list-none overflow-clip border-t border-rea-line-strong p-0"
      aria-label={label}
    >
      {items.map((item, i) => (
        <li key={item.id} className="min-w-0 border-b border-rea-line">
          <button
            type="button"
            className={cn(
              "group relative isolate grid w-full grid-cols-[5%_minmax(0,1fr)_minmax(160px,23%)_38px] items-baseline gap-3.5 border-0 bg-transparent pt-5 pb-[23px] text-left transition-colors duration-400 max-[767px]:grid-cols-[28px_minmax(0,1fr)_28px]",
              // Fondo de tinta que sube desde abajo en hover/foco.
              "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-rea-ink before:transition-transform before:duration-800 before:ease-rea-in-out",
              "hover:text-rea-bg hover:before:origin-top hover:before:scale-y-100 focus-visible:text-rea-bg focus-visible:before:origin-top focus-visible:before:scale-y-100",
            )}
            aria-current={item.id === selectedId ? "true" : undefined}
            onClick={() => onSelect(item.id)}
          >
            <small className="font-rea-mono text-[0.7rem] font-medium" aria-hidden="true">
              {pad2(i + 1)}
            </small>
            <strong className="text-rea-step-2 leading-[1.05] font-medium tracking-[-0.055em] group-aria-[current=true]:text-rea-accent-text group-hover:!text-rea-bg group-focus-visible:!text-rea-bg">
              {item.title}
            </strong>
            <span className="font-rea-mono text-[0.71rem] font-medium text-rea-muted group-hover:text-rea-bg group-focus-visible:text-rea-bg max-[767px]:hidden">
              {item.meta}
            </span>
            <em
              className="justify-self-end text-2xl not-italic transition-transform duration-400 ease-rea-out group-hover:translate-x-1 group-hover:-translate-y-[3px]"
              aria-hidden="true"
            >
              ↗
            </em>
          </button>
        </li>
      ))}
    </ul>
  );
}
