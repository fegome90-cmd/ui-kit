"use client";

import * as React from "react";
import { MOTION } from "@/lib/motion/tokens";
import type { MotionPolicy } from "@/lib/motion/types";
import { cn } from "@/lib/utils";

export type StepRevealProps = React.ComponentProps<"div"> & {
  stateKey: string | number;
  motionPolicy?: MotionPolicy;
  /** Espacio reservado; puede ser una longitud CSS o un número de píxeles. */
  minBlockSize?: React.CSSProperties["minBlockSize"];
};

/** Fundido cancelable ligado a una clave; no establece una secuencia ni mueve el contenido. */
function StepReveal({
  stateKey,
  motionPolicy = "system",
  minBlockSize = "5rem",
  className,
  style,
  children,
  ...props
}: StepRevealProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const body = React.useRef<HTMLDivElement>(null);
  const previous = React.useRef(stateKey);
  React.useLayoutEffect(() => {
    const element = body.current;
    const changed = previous.current !== stateKey;
    previous.current = stateKey;
    if (!element || !changed || motionPolicy === "none" || document.hidden) return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const reduced = motionPolicy === "reduce" || (media?.matches ?? true);
    const animation = element.animate?.([{ opacity: 0 }, { opacity: 1 }], {
      duration: reduced ? MOTION.reducedRevealMs : MOTION.revealMs,
      easing: reduced ? "linear" : MOTION.ease,
    });
    const settle = () => animation?.cancel();
    media?.addEventListener("change", settle);
    document.addEventListener("visibilitychange", settle);
    window.addEventListener("beforeprint", settle);
    window.addEventListener("resize", settle);
    return () => {
      settle();
      media?.removeEventListener("change", settle);
      document.removeEventListener("visibilitychange", settle);
      window.removeEventListener("beforeprint", settle);
      window.removeEventListener("resize", settle);
    };
  }, [stateKey, motionPolicy]);
  return (
    <div
      {...props}
      ref={root}
      data-slot="step-reveal"
      data-state-key={stateKey}
      className={cn("relative", className)}
      style={{ minBlockSize, ...style }}
    >
      <div ref={body}>{children}</div>
    </div>
  );
}

export { StepReveal };
