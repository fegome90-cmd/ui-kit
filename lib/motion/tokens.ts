/** Valores iniciales de UIKIT-MOTION-001. Milisegundos, salvo enterY. */
export const MOTION = Object.freeze({
  pressMs: 120,
  stateMs: 160,
  enterMs: 560,
  openMs: 420,
  switchMs: 280,
  closeMs: 320,
  contextMs: 360,
  revealMs: 160,
  reducedRevealMs: 100,
  enterY: 16,
  staggerMs: 0,
  ease: "cubic-bezier(.16,1,.3,1)",
  easeName: "uikit-motion-out",
});
export function motionVariables(): Record<`--motion-${string}`, string> {
  return {
    "--motion-press": `${MOTION.pressMs}ms`,
    "--motion-state": `${MOTION.stateMs}ms`,
    "--motion-enter": `${MOTION.enterMs}ms`,
    "--motion-reveal": `${MOTION.revealMs}ms`,
    "--motion-reduced-reveal": `${MOTION.reducedRevealMs}ms`,
    "--motion-enter-y": `${MOTION.enterY}px`,
    "--motion-ease": MOTION.ease,
  };
}
