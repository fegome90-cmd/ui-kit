"use client";

import { pad2 } from "@/lib/rea/rea-utils";

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
      <p className="rea-empty" role="status">
        {emptyText}
      </p>
    );
  return (
    <ul className="rea-specimen-list" aria-label={label}>
      {items.map((item, i) => (
        <li key={item.id} className="rea-specimen">
          <button
            type="button"
            className="rea-specimen-select"
            aria-current={item.id === selectedId ? "true" : undefined}
            onClick={() => onSelect(item.id)}
          >
            <small aria-hidden="true">{pad2(i + 1)}</small>
            <strong>{item.title}</strong>
            <span>{item.meta}</span>
            <em aria-hidden="true">↗</em>
          </button>
        </li>
      ))}
    </ul>
  );
}
