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
      className="rea-grid-overlay"
      data-visible={visible}
      data-contained={contained || undefined}
      aria-hidden="true"
      style={{ ["--rea-columns" as string]: columns }}
    >
      <div className="rea-grid-overlay-inner">
        {Array.from({ length: columns }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: cada columna es una posición fija de la retícula
          <span key={`col-${i + 1}`} />
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
