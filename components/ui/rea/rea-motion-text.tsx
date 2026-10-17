"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/rea/rea-utils";
import { useReducedMotion } from "@/lib/rea/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Frase que se "compila" palabra por palabra (desenfoque → nítido) con un cursor de acento.
 * Ritmo del original: 75 ms por palabra y 220 ms extra tras puntuación.
 * El texto completo va en aria-label; las palabras sueltas no se leen.
 */
function ReaGenWords({
  text,
  as: Tag = "p",
  start = 0.2,
  caret = true,
  className,
}: {
  text: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  /** Segundos antes de la primera palabra. */
  start?: number;
  caret?: boolean;
  className?: string;
}) {
  let delay = 0;
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => {
      const d = delay;
      delay += 0.075 + (/[.,:;]$/.test(w) ? 0.22 : 0);
      return { w, d, key: `${i}-${w}` };
    });
  return (
    <Tag
      data-slot="rea-gen-words"
      className={className}
      aria-label={text}
      style={{ ["--rea-gen-start" as string]: `${start}s` } as CSSProperties}
    >
      {words.map(({ w, d, key }, i) => (
        <span key={key} aria-hidden="true">
          <span
            className="inline-block animate-rea-compile-word [animation-delay:calc(var(--rea-gen-start,0.2s)+var(--rea-word-delay,0s))]"
            style={{ ["--rea-word-delay" as string]: `${d.toFixed(3)}s` } as CSSProperties}
          >
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
      {caret && (
        <span
          className="ml-[0.07em] inline-block h-[0.8em] w-[0.085em] animate-rea-cursor-blink bg-rea-accent align-[-0.08em]"
          aria-hidden="true"
        />
      )}
    </Tag>
  );
}

const LINE = "block text-rea-step-4 leading-[1.05] font-medium tracking-[-0.064em] whitespace-nowrap";

/**
 * Titular en contorno que se rellena de izquierda a derecha según el desplazamiento
 * (`progress` 0..1) o al pasar el puntero. Con movimiento reducido se muestra relleno.
 * El texto se lee una vez; las dos capas visuales son decorativas.
 */
function ReaWireline({
  text,
  measure,
  progress,
  className,
}: {
  text: string;
  /** Rótulo técnico en acento sobre la línea, p. ej. "type / step-4". */
  measure?: string;
  /** Si se omite, se calcula con la posición del elemento en la ventana. */
  progress?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(0);
  useEffect(() => {
    if (progress !== undefined || reduced) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const start = innerHeight * 0.65;
      const end = innerHeight * 0.6 - r.height;
      setAuto(clamp((start - r.top) / Math.max(1, start - end), 0, 1));
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    document.addEventListener("scroll", on, { passive: true, capture: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", on, { capture: true });
      window.removeEventListener("resize", on);
    };
  }, [progress, reduced]);
  const value = reduced ? 1 : clamp(progress ?? auto, 0, 1);
  return (
    <div
      ref={ref}
      data-slot="rea-wireline"
      className={cn("group relative w-fit max-w-full", className)}
      style={{ ["--rea-scrub" as string]: `${value * 100}%` } as CSSProperties}
    >
      <span className="sr-only">{text}</span>
      {measure && (
        <span
          className="absolute -top-3.5 -right-0.5 font-rea-mono text-[0.65rem] whitespace-nowrap text-rea-accent-text"
          aria-hidden="true"
        >
          {measure}
        </span>
      )}
      <span
        className={cn(LINE, "text-transparent [-webkit-text-stroke:1px_var(--rea-line-strong)]")}
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className={cn(
          LINE,
          "absolute inset-0 w-fit text-rea-ink [clip-path:inset(-0.35em_calc(100%_-_var(--rea-scrub,0%))_-0.45em_0)] group-focus-within:[clip-path:inset(-0.35em_0_-0.45em_0)] group-hover:[clip-path:inset(-0.35em_0_-0.45em_0)]",
        )}
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
}

export { ReaGenWords, ReaWireline };
