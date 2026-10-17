"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Aviso fijo abajo a la derecha. Siempre está en el DOM para que role="status" se anuncie. */
export function ReaToast({ message }: { message: string | null }) {
  return (
    <div
      data-slot="rea-toast"
      className="fixed right-(--rea-gutter) bottom-6 z-100 max-w-[min(420px,90vw)] bg-rea-ink px-5 py-3.5 text-[0.81rem] text-rea-bg shadow-[0_14px_40px_rgb(0_0_0/0.18)] empty:hidden"
      role="status"
      aria-live="polite"
    >
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
