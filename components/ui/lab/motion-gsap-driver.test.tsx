import { gsap } from "gsap";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGsapDriver } from "@/lib/motion/gsap-driver";
import { MOTION } from "@/lib/motion/tokens";
import { type MotionDriver, type MotionFrame, OVERVIEW, type SceneHost } from "@/lib/motion/types";

const drivers: MotionDriver[] = [];
const roots: HTMLElement[] = [];

function createHost() {
  const coordinateRoot = document.createElement("main");
  coordinateRoot.style.transform = "scale(0.75)";
  const root = document.createElement("section");
  const source = document.createElement("div");
  source.setAttribute("aria-hidden", "true");
  source.setAttribute("data-flip-id", "consumer-source");
  const other = document.createElement("div");
  other.setAttribute("aria-hidden", "true");
  const surface = document.createElement("div");
  surface.dataset.motionRole = "detail-surface";
  surface.setAttribute("aria-hidden", "true");
  const content = document.createElement("p");
  content.dataset.motionRole = "reveal";
  content.textContent = "Contenido sintético de la tarea";
  root.append(source, other, surface, content);
  coordinateRoot.append(root);
  document.body.append(coordinateRoot);
  roots.push(coordinateRoot);
  const host: SceneHost = {
    root,
    coordinateRoot,
    getTargets: () => [source, other],
    resolveTarget: (id) => (id === "a" ? source : null),
    applyState: () => {},
    getReturnFocus: () => null,
    getDetailHeading: () => null,
  };
  const driver = createGsapDriver(host);
  drivers.push(driver);
  return { host, root, coordinateRoot, source, other, surface, content, driver };
}

const openFrame: MotionFrame = {
  from: OVERVIEW,
  to: { view: "detail", targetId: "a" },
  kind: "open",
  durationMs: MOTION.openMs,
  reduced: false,
};

beforeEach(() => {
  gsap.ticker.sleep();
});

afterEach(() => {
  for (const driver of drivers.splice(0)) driver.destroy();
  for (const root of roots.splice(0)) root.remove();
  vi.restoreAllMocks();
  gsap.ticker.sleep();
});

describe("driver GSAP real: identidad y limpieza", () => {
  it.each(["natural", "settle", "destroy"] as const)(
    "entrada %s conserva la geometría base y los estilos inline con su prioridad",
    (finish) => {
      const fixture = createHost();
      fixture.root.style.setProperty("transform", "matrix(0.75, 0, 0, 0.75, 20, 12)", "important");
      fixture.root.style.setProperty("opacity", "0.7", "important");
      const originalTransform = fixture.root.style.getPropertyValue("transform");
      const baseline = new Set(gsap.globalTimeline.getChildren(false, false, true));
      const done = vi.fn();
      fixture.driver.play(
        undefined,
        { from: OVERVIEW, to: OVERVIEW, kind: "enter", durationMs: MOTION.enterMs, reduced: false },
        done,
      );
      const timeline = gsap.globalTimeline.getChildren(false, false, true).find((child) => !baseline.has(child));
      expect(timeline).toBeDefined();
      timeline?.progress(0);
      expect(Number(gsap.getProperty(fixture.root, "x"))).toBeCloseTo(20);
      expect(Number(gsap.getProperty(fixture.root, "y"))).toBeCloseTo(12 + MOTION.enterY);
      expect(Number(gsap.getProperty(fixture.root, "scaleX"))).toBeCloseTo(0.75);
      timeline?.progress(0.99);
      expect(Number(gsap.getProperty(fixture.root, "opacity"))).toBeCloseTo(0.7, 2);
      if (finish === "natural") timeline?.progress(1);
      else fixture.driver[finish]();
      expect(fixture.root.style.getPropertyValue("transform")).toBe(originalTransform);
      expect(fixture.root.style.getPropertyPriority("transform")).toBe("important");
      expect(fixture.root.style.getPropertyValue("opacity")).toBe("0.7");
      expect(fixture.root.style.getPropertyPriority("opacity")).toBe("important");
      expect(fixture.coordinateRoot.style.transform).toBe("scale(0.75)");
      fixture.driver.destroy();
      expect(fixture.root.style.getPropertyValue("transform")).toBe(originalTransform);
      expect(fixture.root.style.getPropertyValue("opacity")).toBe("0.7");
    },
  );
  it("restaura data-flip-id originales y conserva el transform del coordinateRoot", () => {
    const fixture = createHost();
    const snapshot = fixture.driver.capture(openFrame);
    fixture.driver.play(snapshot, openFrame, vi.fn());
    expect(fixture.source).toHaveAttribute("data-flip-id", fixture.surface.getAttribute("data-flip-id"));
    expect(fixture.source.getAttribute("data-flip-id")).toMatch(/^uikit-motion-/);
    fixture.driver.destroy();
    fixture.driver.destroy();
    expect(fixture.source).toHaveAttribute("data-flip-id", "consumer-source");
    expect(fixture.other).not.toHaveAttribute("data-flip-id");
    expect(fixture.surface).not.toHaveAttribute("data-flip-id");
    expect(fixture.coordinateRoot.style.transform).toBe("scale(0.75)");
    expect(fixture.content.style.opacity).toBe("");
    expect(
      gsap.getTweensOf([fixture.root, fixture.source, fixture.other, fixture.surface, fixture.content]),
    ).toHaveLength(0);
  });

  it("dos drivers asignan identidades distintas y destruir uno conserva la otra animación", () => {
    const one = createHost();
    const two = createHost();
    const first = one.driver.capture(openFrame);
    const second = two.driver.capture(openFrame);
    one.driver.play(first, openFrame, vi.fn());
    two.driver.play(second, openFrame, vi.fn());
    expect(one.surface.getAttribute("data-flip-id")).not.toBe(two.surface.getAttribute("data-flip-id"));
    one.driver.destroy();
    expect(two.surface.getAttribute("data-flip-id")).toMatch(/^uikit-motion-/);
    expect(gsap.getTweensOf(two.content).length).toBeGreaterThan(0);
    two.driver.destroy();
    expect(gsap.getTweensOf(two.content)).toHaveLength(0);
  });

  it("settle elimina timelines e hijos reales y no dispara el callback cancelado", () => {
    const contextCall = vi.spyOn(gsap, "context");
    const fixture = createHost();
    const context = contextCall.mock.results[0].value as gsap.Context;
    const baseline = gsap.globalTimeline.getChildren().length;
    const done = vi.fn();
    for (let index = 0; index < 12; index += 1) {
      const snapshot = fixture.driver.capture(openFrame);
      fixture.driver.play(snapshot, openFrame, done);
      expect(context.getTweens().length).toBeGreaterThan(0);
      fixture.driver.settle();
      expect(context.getTweens()).toHaveLength(0);
      expect(gsap.globalTimeline.getChildren()).toHaveLength(baseline);
    }
    expect(done).not.toHaveBeenCalled();
    expect(fixture.content.style.opacity).toBe("");
  });

  it("finalización natural llama done una vez y libera referencias del contexto", () => {
    const contextCall = vi.spyOn(gsap, "context");
    const fixture = createHost();
    const context = contextCall.mock.results[0].value as gsap.Context;
    const baseline = new Set(gsap.globalTimeline.getChildren(false, false, true));
    const done = vi.fn();
    fixture.driver.play(undefined, { ...openFrame, kind: "content" }, done);
    const timeline = gsap.globalTimeline.getChildren(false, false, true).find((child) => !baseline.has(child));
    expect(timeline).toBeDefined();
    timeline?.progress(1);
    fixture.driver.settle();
    fixture.driver.destroy();
    expect(done).toHaveBeenCalledOnce();
    expect(context.getTweens()).toHaveLength(0);
  });

  it("reduced cambia solo opacidad y preserva la geometría de las superficies", () => {
    const fixture = createHost();
    fixture.source.style.transform = "translateX(7px)";
    fixture.surface.style.transform = "translateX(11px)";
    fixture.driver.play(undefined, { ...openFrame, reduced: true, durationMs: MOTION.reducedRevealMs }, vi.fn());
    expect(gsap.getTweensOf([fixture.source, fixture.surface])).toHaveLength(0);
    fixture.driver.settle();
    expect(fixture.source.style.transform).toBe("translateX(7px)");
    expect(fixture.surface.style.transform).toBe("translateX(11px)");
    expect(fixture.content.style.opacity).toBe("");
  });
});
