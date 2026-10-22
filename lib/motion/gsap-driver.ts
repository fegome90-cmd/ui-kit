import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { MOTION } from "./tokens";
import type { MotionDriver, MotionFrame, SceneHost } from "./types";

gsap.registerPlugin(Flip, CustomEase);
CustomEase.create(MOTION.easeName, ".16,1,.3,1");
let instance = 0;
type Capture = { context?: ReturnType<typeof Flip.getState>; surface?: ReturnType<typeof Flip.getState> };

export function createGsapDriver(host: SceneHost): MotionDriver {
  const id = `uikit-motion-${++instance}`;
  const ctx = gsap.context(() => {}, host.root);
  const originals = new Map<Element, string | null>();
  const restoreStyles: (() => void)[] = [];
  let timeline: gsap.core.Timeline | undefined;
  const preserveInline = (element: HTMLElement, properties: readonly string[]) => {
    const saved = properties.map((property) => ({
      property,
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property),
    }));
    restoreStyles.push(() => {
      for (const { property, value, priority } of saved) {
        if (value) element.style.setProperty(property, value, priority);
        else element.style.removeProperty(property);
      }
      // El siguiente gesto debe volver a leer el transform restaurado, no el cache del tween.
      if (properties.includes("transform") && element._gsap) element._gsap.uncache = 1;
    });
  };
  const surface = () => host.root.querySelector<HTMLElement>('[data-motion-role="detail-surface"]');
  const remember = (el: Element) => {
    if (!originals.has(el)) originals.set(el, el.getAttribute("data-flip-id"));
  };
  const identify = (el: Element) => {
    remember(el);
    el.setAttribute("data-flip-id", id);
    return el;
  };
  const restoreIds = () => {
    for (const [el, value] of originals) {
      if (value === null) el.removeAttribute("data-flip-id");
      else el.setAttribute("data-flip-id", value);
    }
  };
  const contextTargets = (frame: MotionFrame) => {
    const focusId = frame.kind === "close" ? frame.from.targetId : frame.kind === "open" ? frame.to.targetId : null;
    const focus = focusId ? host.resolveTarget(focusId) : null;
    // El origen compartido no recibe a la vez el Flip contextual y el de ampliación.
    return host.getTargets().filter((element) => element !== focus);
  };
  const settle = () => {
    if (!timeline) return;
    timeline.eventCallback("onComplete", null);
    timeline.progress(1);
    timeline.kill();
    for (const restore of restoreStyles.splice(0)) restore();
    // Todos los tweens hijos finalizaron; liberar referencias por instancia sin revertir el layout.
    ctx.clear();
    timeline = undefined;
  };
  return {
    capture(frame) {
      // Limpiar emparejamientos previos antes de asignar el de esta transacción.
      restoreIds();
      const targets = contextTargets(frame);
      targets.forEach(remember);
      const origin =
        frame.from.view === "overview" && frame.to.targetId ? host.resolveTarget(frame.to.targetId) : surface();
      return {
        context: targets.length ? Flip.getState(targets, { simple: false }) : undefined,
        surface: origin ? Flip.getState(identify(origin), { simple: false }) : undefined,
      } satisfies Capture;
    },
    play(snapshot, frame: MotionFrame, done) {
      const captured = snapshot as Capture | undefined;
      const body = [...host.root.querySelectorAll<HTMLElement>('[data-motion-role="reveal"]')].filter(
        (el) => !el.closest("[hidden]"),
      );
      ctx.add(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            settle();
            done();
          },
        });
        timeline = tl;
        const seconds = frame.durationMs / 1000;
        const fade = Math.min(frame.durationMs, frame.reduced ? MOTION.reducedRevealMs : MOTION.revealMs) / 1000;
        if (frame.kind === "enter" && !frame.reduced) {
          preserveInline(host.root, ["transform", "transform-origin", "translate", "rotate", "scale", "opacity"]);
          const baseY = Number(gsap.getProperty(host.root, "y")) || 0;
          const baseOpacity = Number(gsap.getProperty(host.root, "opacity"));
          tl.fromTo(
            host.root,
            { opacity: 0, y: baseY + MOTION.enterY },
            {
              opacity: Number.isFinite(baseOpacity) ? baseOpacity : 1,
              y: baseY,
              duration: seconds,
              ease: MOTION.easeName,
            },
            0,
          );
        } else if (!frame.reduced && frame.kind !== "content") {
          if (captured?.context)
            tl.add(
              Flip.from(captured.context, {
                targets: contextTargets(frame),
                duration: Math.min(frame.durationMs, MOTION.contextMs) / 1000,
                scale: true,
                simple: false,
                ease: MOTION.easeName,
              }),
              0,
            );
          const destination =
            frame.to.view === "overview" && frame.from.targetId ? host.resolveTarget(frame.from.targetId) : surface();
          if (captured?.surface && destination) {
            tl.add(
              Flip.from(captured.surface, {
                targets: identify(destination),
                duration: seconds,
                scale: true,
                simple: false,
                ease: MOTION.easeName,
              }),
              0,
            );
          }
        }
        if (body.length && frame.kind !== "close") {
          for (const element of body) {
            preserveInline(element, ["opacity"]);
            const baseOpacity = Number(gsap.getProperty(element, "opacity"));
            tl.fromTo(
              element,
              { opacity: 0 },
              {
                opacity: Number.isFinite(baseOpacity) ? baseOpacity : 1,
                duration: fade,
                ease: frame.reduced ? "none" : MOTION.easeName,
              },
              Math.max(0, seconds - fade),
            );
          }
        }
        // Mantiene el contrato temporal aunque no haya superficies animables.
        tl.to({}, { duration: seconds }, 0);
      });
    },
    settle,
    destroy() {
      settle();
      ctx.revert();
      restoreIds();
      originals.clear();
    },
  };
}
