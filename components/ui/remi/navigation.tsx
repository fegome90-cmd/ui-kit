import type { ReactNode } from "react";
import { ArrowCircle } from "./kit-icons";

/* Navegación: paginador azul, resumen de registros y pestañas con estado. */

/** Paginador "1 de N" con flechas en círculo. */
export function Pager({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <nav className="pager" aria-label="Paginación">
      <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={onPrev}>
        <ArrowCircle dir="left" />
      </button>
      <span aria-current="page">
        {page} de {total}
      </span>
      <button type="button" aria-label="Página siguiente" disabled={page >= total} onClick={onNext}>
        <ArrowCircle dir="right" />
      </button>
    </nav>
  );
}

/** "Mostrando 1 a 6 de 6". */
export function RangeSummary({ from, to, total }: { from: number; to: number; total: number }) {
  return (
    <p className="range-summary">
      Mostrando {from} a {to} de {total}
    </p>
  );
}

export interface StatusTab {
  id: string;
  label: string;
  /** Muestra el check verde (la sección tiene contenido). */
  done?: boolean;
}

/** Pestañas de categoría con check verde (Nutrición, Reposo, Medicamentos…). */
export function StatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: StatusTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="status-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === active}
          className="status-tab"
          onClick={() => onChange(t.id)}
        >
          {t.done && (
            <svg viewBox="0 0 14 14" width="13" height="13" aria-label="con indicaciones" role="img">
              <circle cx="7" cy="7" r="6.5" fill="#2ecc71" />
              <path
                d="m3.9 7.2 2.1 2 4.1-4.2"
                fill="none"
                stroke="#fff"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Botón azul claro de pie de pantalla (Asumir, Tipo de cama, Sol. de enfermería…). */
export function SoftButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className="soft-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
