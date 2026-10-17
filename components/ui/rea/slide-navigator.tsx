import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/* Valores de respaldo para usarse fuera de FALP; dentro de FALP prevalecen las variables
   --brand-* del adaptador de marca. El azul institucional es rights: review-required. */
const ROOT =
  "[--sn-ink:var(--brand-color-text,#12385f)] [--sn-paper:var(--brand-color-bg-container,#fff)] [--sn-primary:var(--brand-color-primary,var(--rea-color-primary,#004990))] [--sn-line:var(--brand-color-border,#d7e4ef)] inline-flex items-center gap-2.5 bg-(--sn-paper) font-[Inter,system-ui,sans-serif] text-sm text-(--sn-ink) max-[520px]:gap-[0.2rem] [&_:focus-visible]:outline-3 [&_:focus-visible]:outline-offset-2 [&_:focus-visible]:outline-(--sn-primary)";
const MOTION =
  "transition-[background-color,translate] duration-(--rea-duration-fast,160ms) ease-(--rea-easing-out,cubic-bezier(0.16,1,0.3,1))";
const ARROW = cn(
  MOTION,
  "grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-[0.75rem] border border-(--sn-line) bg-(--sn-paper) text-[1.2rem] text-(--sn-ink) disabled:cursor-not-allowed disabled:opacity-50 not-disabled:hover:-translate-y-px not-disabled:hover:bg-[#eff6fb]",
);
const DOT = cn(
  MOTION,
  "grid size-11 cursor-pointer place-items-center rounded-full border border-transparent bg-(--sn-paper) hover:bg-[#eff6fb] after:size-[7px] after:rounded-full after:bg-(--sn-ink) after:opacity-40 aria-[current=step]:after:size-3 aria-[current=step]:after:bg-(--sn-primary) aria-[current=step]:after:opacity-100",
);

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
    <nav
      aria-label="Navegación de diapositivas"
      data-slot="slide-navigator"
      className={cn(ROOT, className)}
      onKeyDown={onKeyDown}
    >
      <button
        className={ARROW}
        type="button"
        aria-label="Diapositiva anterior"
        disabled={active === 0}
        onClick={() => go(active - 1)}
      >
        <span aria-hidden="true">←</span>
      </button>

      <ol
        className="m-0 flex list-none items-center gap-[0.15rem] p-0 max-[520px]:gap-0"
        aria-label="Diapositivas disponibles"
      >
        {Array.from({ length: count }, (_, position) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: la posición es la identidad de cada diapositiva
          <li key={position}>
            <button
              type="button"
              className={DOT}
              aria-label={`Ir a diapositiva ${position + 1}`}
              aria-current={position === active ? "step" : undefined}
              onClick={() => go(position)}
            />
          </li>
        ))}
      </ol>

      <button
        className={ARROW}
        type="button"
        aria-label="Diapositiva siguiente"
        disabled={active === count - 1}
        onClick={() => go(active + 1)}
      >
        <span aria-hidden="true">→</span>
      </button>

      {showPosition && (
        <output className="min-w-12 text-center tabular-nums" aria-live="polite" aria-atomic="true">
          {active + 1} / {count}
        </output>
      )}
    </nav>
  );
}
