import type { KeyboardEvent } from "react";

/**
 * Navegador de diapositivas controlado: el padre conserva el estado.
 * Acepta navegación local con ←, →, Home y End cuando el foco está en él.
 * Los atajos globales son responsabilidad explícita del presentador, no de este componente.
 */
export interface SlideNavigatorProps {
  /** Índice activo de base cero (0..count-1). */
  index: number;
  /** Número total de diapositivas. Si es 0, no se renderiza. */
  count: number;
  /** Recibe el próximo índice, siempre dentro del rango permitido. */
  onChange: (index: number) => void;
  /** Muestra el contador legible; predeterminado: true. */
  showPosition?: boolean;
  className?: string;
}

export function SlideNavigator({ index, count, onChange, showPosition = true, className = "" }: SlideNavigatorProps) {
  if (!Number.isInteger(count) || count < 1) return null;

  const active = Math.max(0, Math.min(index, count - 1));
  const go = (next: number) => onChange(Math.max(0, Math.min(next, count - 1)));

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    let next: number | undefined;
    if (event.key === "ArrowLeft") next = active - 1;
    if (event.key === "ArrowRight") next = active + 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = count - 1;
    if (next === undefined) return;
    event.preventDefault();
    if (next !== active) go(next);
  };

  return (
    <nav aria-label="Navegación de diapositivas" className={`rea-slide-nav ${className}`.trim()} onKeyDown={onKeyDown}>
      <button
        className="rea-slide-nav__arrow"
        type="button"
        aria-label="Diapositiva anterior"
        disabled={active === 0}
        onClick={() => go(active - 1)}
      >
        <span aria-hidden="true">←</span>
      </button>

      <ol className="rea-slide-nav__pages" aria-label="Diapositivas disponibles">
        {Array.from({ length: count }, (_, position) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: la posición es la identidad de cada diapositiva
          <li key={position}>
            <button
              type="button"
              className="rea-slide-nav__dot"
              aria-label={`Ir a diapositiva ${position + 1}`}
              aria-current={position === active ? "step" : undefined}
              onClick={() => go(position)}
            />
          </li>
        ))}
      </ol>

      <button
        className="rea-slide-nav__arrow"
        type="button"
        aria-label="Diapositiva siguiente"
        disabled={active === count - 1}
        onClick={() => go(active + 1)}
      >
        <span aria-hidden="true">→</span>
      </button>

      {showPosition && (
        <output className="rea-slide-nav__counter" aria-live="polite" aria-atomic="true">
          {active + 1} / {count}
        </output>
      )}
    </nav>
  );
}
