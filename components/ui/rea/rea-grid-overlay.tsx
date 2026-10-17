"use client";

import { useEffect } from "react";

/** Retícula de columnas superpuesta, para revisar alineación. Decorativa y sin eventos de puntero. */
export function ReaGridOverlay({
  visible,
  columns = 12,
  contained = false,
}: {
  visible: boolean;
  columns?: number;
  /** Se ajusta al contenedor posicionado más cercano en vez de a la ventana. */
  contained?: boolean;
}) {
  return (
    <div
      data-slot="rea-grid-overlay"
      className="pointer-events-none fixed inset-0 z-90 px-(--rea-gutter) opacity-0 transition-opacity duration-400 ease-rea-out data-contained:absolute data-[visible=true]:opacity-100"
      data-visible={visible}
      data-contained={contained || undefined}
      aria-hidden="true"
      style={{ ["--rea-columns" as string]: columns }}
    >
      <div className="grid h-full grid-cols-[repeat(var(--rea-columns),minmax(0,1fr))] gap-(--rea-col-gap)">
        {Array.from({ length: columns }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: cada columna es una posición fija de la retícula
          <span key={`col-${i + 1}`} className="border-x border-rea-accent/32 bg-rea-accent/9" />
        ))}
      </div>
    </div>
  );
}

/** Alt+G alterna la retícula (atajo del sitio original). */
export function useGridShortcut(toggle: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.metaKey && !e.ctrlKey && e.code === "KeyG") {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggle, enabled]);
}
