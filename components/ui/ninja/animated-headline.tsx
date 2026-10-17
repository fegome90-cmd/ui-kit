import { ArrowRight, Pause, Play } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export type HeadlineFont = {
  /** CSS font-family */
  family: string;
  weight?: number;
  style?: "normal" | "italic";
  /** Nombre visible en la etiqueta del botón */
  label: string;
  href?: string;
};

type Props = {
  text: string;
  fonts: HeadlineFont[];
  /** ms que cada tipografía queda quieta antes de cambiar (original ≈ 2–3 s) */
  interval?: number;
  /** ms del cambio de cada letra */
  glyphDuration?: number;
  /** ms de retraso entre letras (barrido de izquierda a derecha) */
  stagger?: number;
  /** Muestra el botón de pausa (WCAG 2.2.2: contenido que se mueve solo > 5 s) */
  pauseControl?: boolean;
  className?: string;
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
};

/**
 * Wordmark a todo el ancho que rota entre tipografías.
 * - Ajusta el tamaño para llenar el ancho en cada tipografía (fit-to-width).
 * - Cambio letra por letra con cortes tipo glitch + eco coral (aprox. CSS del shader original).
 * - Botón coral que enlaza a la tipografía actual; en hover despliega su nombre
 *   (scaleX 0→1, 200ms ease-in, medido en el original).
 * - Se pausa con hover/foco, con la pestaña oculta y con prefers-reduced-motion.
 */
function AnimatedHeadline({
  text,
  fonts,
  interval = 2600,
  glyphDuration = 520,
  stagger = 45,
  pauseControl = true,
  className,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [prev, setPrev] = React.useState<number | null>(null);
  const [gen, setGen] = React.useState(0);
  const [userPaused, setUserPaused] = React.useState(false);
  const [hoverPaused, setHoverPaused] = React.useState(false);
  const [fontSize, setFontSize] = React.useState<number | null>(null);
  const [tabVisible, setTabVisible] = React.useState(true);
  React.useEffect(() => {
    const on = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLSpanElement>(null);

  const chars = React.useMemo(() => Array.from(text), [text]);
  const current = fonts[index];
  const playing = !reduced && !userPaused && !hoverPaused && tabVisible && fonts.length > 1;
  const swapTotal = glyphDuration * 1.4 + stagger * chars.length;

  // Ciclo
  // biome-ignore lint/correctness/useExhaustiveDependencies: gen reprograma el ciclo en cada cambio de tipografía
  React.useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(
      () => {
        setPrev(index);
        setIndex((i) => (i + 1) % fonts.length);
        setGen((g) => g + 1);
      },
      interval + (prev === null ? 0 : swapTotal),
    );
    return () => window.clearTimeout(id);
  }, [playing, index, interval, swapTotal, fonts.length, prev, gen]);

  // Limpia la capa saliente cuando termina el barrido
  // biome-ignore lint/correctness/useExhaustiveDependencies: gen reinicia la limpieza en cada barrido
  React.useEffect(() => {
    if (prev === null) return;
    const id = window.setTimeout(() => setPrev(null), swapTotal + 50);
    return () => window.clearTimeout(id);
  }, [gen, prev, swapTotal]);

  // Fit-to-width: mide el texto a 100px con la tipografía actual
  const fitToWidth = React.useCallback(() => {
    const box = boxRef.current,
      m = measureRef.current;
    if (!box || !m) return;
    const w = m.getBoundingClientRect().width;
    if (w > 0) setFontSize(Math.floor((box.clientWidth / w) * 100 * 1000) / 1000);
  }, []);
  React.useLayoutEffect(() => {
    let alive = true;
    const spec = `${current.style ?? "normal"} ${current.weight ?? 400} 100px ${current.family}`;
    fitToWidth();
    document.fonts
      ?.load(spec, text)
      .then(() => alive && fitToWidth())
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [current, text, fitToWidth]);
  React.useEffect(() => {
    const ro = new ResizeObserver(fitToWidth);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [fitToWidth]);

  const fontStyle = (f: HeadlineFont): React.CSSProperties => ({
    fontFamily: f.family,
    fontWeight: f.weight ?? 400,
    fontStyle: f.style ?? "normal",
  });
  const prevFont = prev !== null ? fonts[prev] : null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: pausar con el puntero es una mejora; el foco y el botón de pausa cubren teclado
    <div
      ref={boxRef}
      data-slot="animated-headline"
      data-playing={playing || undefined}
      className={cn("relative w-full", className)}
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHoverPaused(false);
      }}
      style={{ ["--glyph-dur" as string]: `${glyphDuration}ms`, ["--glyph-stagger" as string]: `${stagger}ms` }}
    >
      {/* medidor invisible */}
      <span aria-hidden className="pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden">
        <span
          ref={measureRef}
          className="absolute top-0 left-0 whitespace-pre"
          style={{ ...fontStyle(current), fontSize: 100, lineHeight: 1 }}
        >
          {text}
        </span>
      </span>

      <h1 className="m-0 whitespace-pre leading-[0.92]" style={{ fontSize: fontSize ?? undefined }}>
        <span className="sr-only">{text}</span>
        <span aria-hidden data-slot="headline-glyphs" data-font={current.label} className="block">
          {chars.map((ch, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: la clave incluye gen para remontar las letras y repetir la animación
            <span key={`${gen}-${i}`} className="relative inline-block" style={{ ["--i" as string]: i }}>
              {prevFont && (
                <span
                  data-layer="ghost"
                  className="glyph-ghost pointer-events-none absolute inset-0 text-primary"
                  style={fontStyle(current)}
                >
                  {ch}
                </span>
              )}
              {prevFont && (
                <span
                  data-layer="out"
                  className="glyph-out pointer-events-none absolute top-0 left-0"
                  style={fontStyle(prevFont)}
                >
                  {ch}
                </span>
              )}
              <span data-layer="in" className={cn("relative", prevFont && "glyph-in")} style={fontStyle(current)}>
                {ch}
              </span>
            </span>
          ))}
        </span>
      </h1>

      {/* Botón a la tipografía: sobre el final del título (≥744px, como el original); debajo en móvil */}
      <div className="mt-3 flex items-center justify-end gap-2 sm:absolute sm:top-1/2 sm:right-0 sm:mt-0 sm:-translate-y-1/2">
        <a
          href={current.href ?? "#"}
          aria-label={`Ver la tipografía ${current.label}`}
          className="group/link relative grid size-10 place-items-center rounded-full bg-primary text-primary-foreground outline-none transition-colors duration-(--duration-color) ease-out-quart hover:bg-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <span
            data-slot="headline-font-name"
            aria-hidden
            className="pointer-events-none absolute right-[calc(100%+8px)] flex h-10 origin-right scale-x-0 items-center rounded-full bg-card px-4 whitespace-nowrap text-foreground opacity-0 shadow-soft transition-[scale,opacity] duration-200 ease-[cubic-bezier(0.95,0.05,0.795,0.035)] group-hover/link:scale-x-100 group-hover/link:opacity-100 group-focus-visible/link:scale-x-100 group-focus-visible/link:opacity-100"
          >
            {current.label}
          </span>
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </a>
      </div>
      {/* Pausa: discreta, bajo el título a la derecha */}
      <div className="absolute top-full right-0 mt-3 max-sm:right-12 max-sm:-mt-9">
        {pauseControl && fonts.length > 1 && !reduced && (
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Reanudar animación del título" : "Pausar animación del título"}
            aria-pressed={userPaused}
            className="grid size-8 place-items-center rounded-full bg-card/80 text-foreground opacity-60 shadow-soft backdrop-blur transition-opacity duration-(--duration-color) ease-out-quart outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {userPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export { AnimatedHeadline };
