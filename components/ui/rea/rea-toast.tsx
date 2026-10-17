"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Aviso fijo abajo a la derecha. Siempre está en el DOM para que role="status" se anuncie. */
export function ReaToast({ message }: { message: string | null }) {
  return (
    <div className="rea-toast" role="status" aria-live="polite">
      {message ?? ""}
    </div>
  );
}

/** Estado del aviso: show(texto) lo muestra y se oculta solo tras `duration` ms (3,7 s en el original). */
export function useReaToast(duration = 3700) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback(
    (text: string) => {
      window.clearTimeout(timer.current);
      setMessage(text);
      timer.current = window.setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { message, show };
}
