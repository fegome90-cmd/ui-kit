import type { ReactNode } from "react";
import { ArrowCircle } from "./kit-icons";

const PAGER_BTN =
  "flex w-8 cursor-pointer items-center justify-center border-0 bg-none p-0 disabled:cursor-default not-disabled:hover:bg-remi-blue-hover";

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
    <nav
      data-slot="pager"
      className="inline-flex h-[26px] items-stretch overflow-hidden rounded-[4px] bg-remi-blue text-[12px] font-bold text-white shadow-[0_2px_4px_#0003]"
      aria-label="Paginación"
    >
      <button type="button" className={PAGER_BTN} aria-label="Página anterior" disabled={page <= 1} onClick={onPrev}>
        <ArrowCircle dir="left" />
      </button>
      <span className="flex items-center border-x border-remi-pager-line px-4" aria-current="page">
        {page} de {total}
      </span>
      <button
        type="button"
        className={PAGER_BTN}
        aria-label="Página siguiente"
        disabled={page >= total}
        onClick={onNext}
      >
        <ArrowCircle dir="right" />
      </button>
    </nav>
  );
}

/** "Mostrando 1 a 6 de 6". */
export function RangeSummary({ from, to, total }: { from: number; to: number; total: number }) {
  return (
    <p data-slot="range-summary" className="m-0 text-[11px] text-remi-tab-text">
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
    <div data-slot="status-tabs" className="flex flex-wrap items-end border-b border-remi-tab-border" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === active}
          className="-mr-px inline-flex h-[26px] cursor-pointer items-center gap-[3px] border border-b-0 border-remi-tab-border bg-remi-tab px-[9px] text-[11px] font-bold text-remi-tab-text aria-selected:-mb-px aria-selected:h-[27px] aria-selected:bg-white aria-selected:pb-px"
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
    <button
      type="button"
      data-slot="soft-button"
      className="h-6 cursor-pointer border-0 bg-remi-blue px-3.5 text-[12px] font-bold text-white disabled:cursor-default disabled:bg-remi-soft-disabled"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
