import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSceneController } from "@/lib/motion/scene-controller";
import { MOTION } from "@/lib/motion/tokens";
import {
  type CommitContext,
  type MotionDriver,
  type MotionFrame,
  OVERVIEW,
  type SceneController,
  type SceneHost,
  type SceneOptions,
  type SceneState,
} from "@/lib/motion/types";

const detail = (targetId: string): SceneState => ({ view: "detail", targetId });
const controllers: SceneController[] = [];
const roots: HTMLElement[] = [];

function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

async function flush() {
  // La carga protegida y el commit asíncrono tienen fronteras de microtareas distintas.
  for (let i = 0; i < 8; i += 1) await Promise.resolve();
}

function requiredElement<T extends Element>(root: HTMLElement, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Fixture incompleto: ${selector}`);
  return element;
}

function createHost() {
  const root = document.createElement("section");
  root.innerHTML = `
    <div data-context>
      <button type="button" data-source="a">Abrir tarea A</button>
      <button type="button" data-source="b">Abrir tarea B</button>
    </div>
    <section data-detail hidden>
      <div data-motion-role="detail-surface" aria-hidden="true"></div>
      <h2 tabindex="-1">Detalle de tarea</h2>
      <p data-content data-motion-role="reveal"></p>
      <button type="button" data-return>Volver al conjunto</button>
    </section>
    <button type="button" data-next>Acción siguiente</button>
  `;
  document.body.append(root);
  roots.push(root);
  const a = requiredElement<HTMLButtonElement>(root, '[data-source="a"]');
  const b = requiredElement<HTMLButtonElement>(root, '[data-source="b"]');
  const heading = requiredElement<HTMLHeadingElement>(root, "h2");
  const region = requiredElement<HTMLElement>(root, "[data-detail]");
  const nextButton = requiredElement<HTMLButtonElement>(root, "[data-next]");
  const attempts: { state: SceneState; context: CommitContext }[] = [];
  const commits: { state: SceneState; context: CommitContext }[] = [];
  const events: string[] = [];
  let beforeCommit: ((state: SceneState, context: CommitContext) => void | Promise<void>) | undefined;
  let rect = { width: 900, height: 600 };
  vi.spyOn(root, "getBoundingClientRect").mockImplementation(() => ({ ...rect }) as DOMRect);
  const host: SceneHost = {
    root,
    coordinateRoot: root,
    getTargets: () => [...root.querySelectorAll("[data-source]")],
    resolveTarget: (id) => (id === "a" ? a : id === "b" ? b : null),
    applyState: vi.fn(async (state, context) => {
      attempts.push({ state, context });
      await beforeCommit?.(state, context);
      if (context.signal.aborted) return;
      events.push(`commit:${state.targetId ?? "overview"}:${context.contentKey}`);
      commits.push({ state, context });
      root.dataset.view = state.view;
      root.dataset.target = state.targetId ?? "";
      region.hidden = state.view !== "detail";
      a.setAttribute("aria-expanded", String(state.targetId === "a"));
      b.setAttribute("aria-expanded", String(state.targetId === "b"));
      heading.textContent = `Detalle ${state.targetId ?? "conjunto"}`;
      requiredElement<HTMLElement>(root, "[data-content]").textContent = context.contentKey;
    }),
    getReturnFocus: (id) => (id === "a" ? a : id === "b" ? b : null),
    getDetailHeading: () => heading,
    onError: vi.fn(),
  };
  return {
    host,
    root,
    a,
    b,
    heading,
    region,
    nextButton,
    attempts,
    commits,
    events,
    setCommit: (callback: typeof beforeCommit) => {
      beforeCommit = callback;
    },
    resize: (width: number, height: number) => {
      rect = { width, height };
    },
  };
}

function createDriver(events: string[] = []) {
  const plays: { snapshot: unknown; frame: MotionFrame; done: () => void }[] = [];
  const driver: MotionDriver = {
    capture: vi.fn((frame) => {
      events.push(`capture:${frame.to.targetId ?? "overview"}`);
      return { target: frame.to.targetId };
    }),
    play: vi.fn((snapshot, frame, done) => {
      events.push(`play:${frame.to.targetId ?? "overview"}`);
      plays.push({ snapshot, frame, done });
    }),
    settle: vi.fn(() => {
      events.push("settle");
    }),
    destroy: vi.fn(),
  };
  return { driver, plays, finish: (index = plays.length - 1) => plays[index].done() };
}

function start(host: SceneHost, options: SceneOptions = {}) {
  const controller = createSceneController(host, options);
  controllers.push(controller);
  return controller;
}

class ObservedResize implements ResizeObserver {
  static instances: ObservedResize[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(private callback: ResizeObserverCallback) {
    ObservedResize.instances.push(this);
  }
  emit() {
    this.callback([], this);
  }
}

let media: MediaQueryList;
let viewport: EventTarget;
let hidden: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  media = Object.assign(new EventTarget(), {
    matches: false,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }) as MediaQueryList;
  vi.spyOn(window, "matchMedia").mockReturnValue(media);
  viewport = new EventTarget();
  vi.stubGlobal("visualViewport", viewport);
  vi.stubGlobal("ResizeObserver", ObservedResize);
  ObservedResize.instances = [];
  hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
});

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.destroy();
  for (const root of roots.splice(0)) root.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("controlador de escena: última intención y contenido", () => {
  it("capture puede completar el driver anterior sin revivir su solicitud", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const first = controller.transitionTo(detail("a"), { origin: "pointer" });
    await flush();
    vi.mocked(motion.driver.capture).mockImplementation(() => {
      motion.finish(0);
      return {};
    });
    const second = controller.transitionTo(detail("b"), { origin: "pointer" });
    await flush();
    await expect(first).resolves.toMatchObject({ status: "superseded" });
    expect(fixture.root).toHaveAttribute("data-motion-phase", "animating");
    expect(fixture.root).toHaveAttribute("data-target", "b");
    motion.finish(1);
    await expect(second).resolves.toMatchObject({ status: "completed" });
  });

  it("ráfaga de intenciones resuelve cada promesa y conserva solo el último contenido", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const requests = [];
    for (let index = 0; index < 12; index += 1) {
      requests.push(
        controller.transitionTo(detail(index % 2 ? "b" : "a"), {
          origin: "pointer",
          contentKey: `revision-${index}`,
        }),
      );
      await flush();
    }
    for (let index = 0; index < motion.plays.length; index += 1) motion.finish(index);
    const results = await Promise.all(requests);
    expect(results.slice(0, -1).every((result) => result.status === "superseded")).toBe(true);
    expect(results.at(-1)).toMatchObject({ requestId: 12, status: "completed" });
    expect(new Set(results.map((result) => result.requestId)).size).toBe(12);
    expect(fixture.root.querySelector("[data-content]")).toHaveTextContent("revision-11");
    expect(fixture.root).toHaveAttribute("data-target", "b");
  });

  it("captura antes del commit, abre, cierra y devuelve foco al origen", async () => {
    const fixture = createHost();
    const motion = createDriver(fixture.events);
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    fixture.a.focus();
    const open = controller.transitionTo(detail("a"), { origin: "keyboard" });
    await flush();
    expect(fixture.root).toHaveAttribute("data-view", "detail");
    expect(fixture.a).toHaveAttribute("aria-expanded", "true");
    expect(fixture.heading).toHaveFocus();
    expect(fixture.events).toEqual(["capture:a", "settle", "commit:a:default", "play:a"]);
    expect(motion.plays[0].frame).toMatchObject({ kind: "open", durationMs: MOTION.openMs });
    motion.finish();
    await expect(open).resolves.toMatchObject({ requestId: 1, status: "completed" });
    const close = controller.transitionTo(OVERVIEW, { origin: "keyboard" });
    await flush();
    expect(fixture.region).not.toBeVisible();
    expect(fixture.a).toHaveFocus();
    expect(motion.plays[1].frame).toMatchObject({ kind: "close", durationMs: MOTION.closeMs });
    motion.finish();
    await expect(close).resolves.toMatchObject({ requestId: 2, status: "completed" });
    expect(fixture.root).toHaveAttribute("data-motion-phase", "idle");
  });

  it("A → B reemplaza A y un done atrasado no termina B ni roba foco", async () => {
    const fixture = createHost();
    const motion = createDriver(fixture.events);
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const first = controller.transitionTo(detail("a"), { origin: "keyboard" });
    await flush();
    const second = controller.transitionTo(detail("b"), { origin: "keyboard" });
    await flush();
    await expect(first).resolves.toMatchObject({ requestId: 1, status: "superseded" });
    expect(fixture.root).toHaveAttribute("data-target", "b");
    expect(motion.plays[1].frame).toMatchObject({ from: detail("a"), to: detail("b"), kind: "switch" });
    fixture.nextButton.focus();
    motion.finish(0);
    expect(fixture.root).toHaveAttribute("data-motion-phase", "animating");
    expect(fixture.nextButton).toHaveFocus();
    motion.finish(1);
    await expect(second).resolves.toMatchObject({ requestId: 2, status: "completed" });
    expect(fixture.nextButton).toHaveFocus();
  });

  it("abrir → volver durante la apertura termina solo en overview", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const open = controller.transitionTo(detail("a"), { origin: "keyboard" });
    await flush();
    const close = controller.transitionTo(OVERVIEW, { origin: "keyboard" });
    await flush();
    motion.finish(0);
    expect(fixture.root).toHaveAttribute("data-view", "overview");
    expect(fixture.a).toHaveFocus();
    motion.finish(1);
    await expect(Promise.all([open, close])).resolves.toMatchObject([
      { status: "superseded" },
      { status: "completed" },
    ]);
    expect(fixture.host.applyState).toHaveBeenCalledTimes(2);
  });

  it("cambia contentKey durante la apertura sin capturar geometría ni mover foco otra vez", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const first = controller.transitionTo(detail("a"), { origin: "keyboard", contentKey: "tarea-1" });
    await flush();
    fixture.nextButton.focus();
    const second = controller.transitionTo(detail("a"), { origin: "keyboard", contentKey: "tarea-2" });
    await flush();
    expect(motion.driver.capture).toHaveBeenCalledOnce();
    expect(motion.plays[1].frame).toMatchObject({ kind: "content", durationMs: MOTION.revealMs });
    expect(fixture.root.querySelector("[data-content]")).toHaveTextContent("tarea-2");
    expect(fixture.nextButton).toHaveFocus();
    motion.finish(0);
    motion.finish(1);
    await expect(Promise.all([first, second])).resolves.toMatchObject([
      { status: "superseded" },
      { status: "completed" },
    ]);
  });

  it("mismo destino estable y misma clave no vuelven a aplicar ni reproducir", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const first = controller.transitionTo(detail("a"), { origin: "pointer", contentKey: "revision-1" });
    await flush();
    motion.finish();
    await first;
    await expect(
      controller.transitionTo(detail("a"), { origin: "pointer", contentKey: "revision-1" }),
    ).resolves.toMatchObject({ status: "completed" });
    expect(fixture.host.applyState).toHaveBeenCalledOnce();
    expect(motion.driver.play).toHaveBeenCalledOnce();
  });

  it("aborta un commit asíncrono obsoleto y resuelve todas las solicitudes", async () => {
    const fixture = createHost();
    const blocked = deferred();
    fixture.setCommit((state) => (state.targetId === "a" ? blocked.promise : undefined));
    const controller = start(fixture.host);
    const first = controller.transitionTo(detail("a"), { origin: "keyboard" });
    const firstSignal = fixture.attempts[0].context.signal;
    const second = controller.transitionTo(detail("b"), { origin: "keyboard", contentKey: "vigente" });
    await flush();
    expect(firstSignal.aborted).toBe(true);
    await expect(Promise.all([first, second])).resolves.toMatchObject([
      { requestId: 1, status: "superseded" },
      { requestId: 2, status: "completed" },
    ]);
    blocked.resolve();
    await flush();
    expect(fixture.commits).toHaveLength(1);
    expect(fixture.root).toHaveAttribute("data-target", "b");
    expect(fixture.root.querySelector("[data-content]")).toHaveTextContent("vigente");
  });

  it("destroy resuelve un commit bloqueado y sus callbacks tardíos no tocan el DOM", async () => {
    const fixture = createHost();
    const blocked = deferred();
    fixture.setCommit(() => blocked.promise);
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "keyboard" });
    controller.destroy();
    controller.destroy();
    await expect(request).resolves.toMatchObject({ status: "destroyed" });
    expect(fixture.attempts[0].context.signal.aborted).toBe(true);
    blocked.resolve();
    await flush();
    expect(fixture.commits).toHaveLength(0);
    expect(motion.driver.play).not.toHaveBeenCalled();
    expect(motion.driver.destroy).toHaveBeenCalledOnce();
    await expect(controller.transitionTo(detail("b"), { origin: "pointer" })).resolves.toMatchObject({
      status: "destroyed",
    });
    expect(fixture.root).toHaveAttribute("data-motion-phase", "destroyed");
  });

  it("destroy durante reproducción neutraliza done atrasado", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "keyboard" });
    await flush();
    controller.destroy();
    fixture.nextButton.focus();
    motion.finish();
    await expect(request).resolves.toMatchObject({ status: "destroyed" });
    expect(fixture.nextButton).toHaveFocus();
    expect(fixture.root).toHaveAttribute("data-motion-phase", "destroyed");
  });

  it("dos instancias aíslan estado, promesas, drivers y foco", async () => {
    const one = createHost();
    const two = createHost();
    const firstMotion = createDriver();
    const secondMotion = createDriver();
    const first = start(one.host, { loadDriver: async () => firstMotion.driver });
    const second = start(two.host, { loadDriver: async () => secondMotion.driver });
    await flush();
    const openOne = first.transitionTo(detail("a"), { origin: "keyboard" });
    await flush();
    expect(one.heading).toHaveFocus();
    const openTwo = second.transitionTo(detail("b"), { origin: "keyboard" });
    await flush();
    expect(two.heading).toHaveFocus();
    first.destroy();
    firstMotion.finish();
    expect(two.root).toHaveAttribute("data-motion-phase", "animating");
    expect(two.root).toHaveAttribute("data-target", "b");
    expect(secondMotion.driver.destroy).not.toHaveBeenCalled();
    secondMotion.finish();
    await expect(Promise.all([openOne, openTwo])).resolves.toMatchObject([
      { status: "destroyed" },
      { status: "completed" },
    ]);
    expect(two.heading).toHaveFocus();
  });
});

describe("foco y fallos recuperables", () => {
  it("Tab durante reproducción conserva el nuevo foco cuando llega done", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    fixture.a.focus();
    const request = controller.transitionTo(detail("a"), { origin: "keyboard" });
    await flush();
    expect(fixture.heading).toHaveFocus();
    await userEvent.setup().tab();
    const lastFocus = document.activeElement;
    expect(lastFocus).toBe(fixture.root.querySelector("[data-return]"));
    motion.finish();
    await expect(request).resolves.toMatchObject({ status: "completed" });
    expect(document.activeElement).toBe(lastFocus);
  });

  it("settle con target eliminado conserva el fallo missing-target y su recuperación", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "pointer" });
    await flush();
    fixture.a.remove();
    controller.settle();
    await expect(request).resolves.toMatchObject({ status: "failed", reason: "missing-target", recoverTo: OVERVIEW });
    await controller.transitionTo(OVERVIEW, { origin: "direct" });
    expect(fixture.region).not.toBeVisible();
  });

  it("target obsoleto eliminado no convierte el done anterior en fallo de la nueva navegación", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const first = controller.transitionTo(detail("a"), { origin: "pointer" });
    await flush();
    const second = controller.transitionTo(detail("b"), { origin: "pointer" });
    await flush();
    fixture.a.remove();
    motion.finish(0);
    expect(fixture.root).toHaveAttribute("data-target", "b");
    expect(fixture.root).toHaveAttribute("data-motion-phase", "animating");
    motion.finish(1);
    await expect(Promise.all([first, second])).resolves.toMatchObject([
      { status: "superseded" },
      { status: "completed" },
    ]);
  });

  it("commit DOM síncrono transfiere foco dentro de la acción de teclado", async () => {
    const fixture = createHost();
    fixture.host.applyState = (state) => {
      fixture.region.hidden = state.view !== "detail";
    };
    const controller = start(fixture.host);
    fixture.a.focus();
    const request = controller.transitionTo(detail("a"), { origin: "keyboard" });
    expect(fixture.heading).toHaveFocus();
    await expect(request).resolves.toMatchObject({ status: "completed" });
  });

  it("acepta una superficie decorativa aria-hidden como target geométrico", async () => {
    const fixture = createHost();
    const surface = document.createElement("div");
    surface.setAttribute("aria-hidden", "true");
    fixture.root.append(surface);
    fixture.host.resolveTarget = () => surface;
    const controller = start(fixture.host);
    await expect(controller.transitionTo(detail("a"), { origin: "keyboard" })).resolves.toMatchObject({
      status: "completed",
    });
    expect(fixture.heading).toHaveFocus();
  });

  it("rechaza targets conectados que pertenecen a otra instancia", async () => {
    const fixture = createHost();
    const other = createHost();
    fixture.host.resolveTarget = () => other.a;
    const controller = start(fixture.host);
    await expect(controller.transitionTo(detail("a"), { origin: "pointer" })).resolves.toMatchObject({
      status: "failed",
      reason: "missing-target",
      recoverTo: OVERVIEW,
    });
    expect(fixture.host.applyState).not.toHaveBeenCalled();
  });

  it("target eliminado después del commit falla al terminar la animación", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "keyboard" });
    await flush();
    fixture.a.remove();
    fixture.nextButton.focus();
    motion.finish();
    await expect(request).resolves.toMatchObject({ status: "failed", reason: "missing-target", recoverTo: OVERVIEW });
    expect(fixture.nextButton).toHaveFocus();
    await expect(controller.transitionTo(OVERVIEW, { origin: "direct" })).resolves.toMatchObject({
      status: "completed",
    });
    expect(fixture.region).not.toBeVisible();
  });

  it("error tras modificar parcialmente el DOM permite volver al estado anterior", async () => {
    const fixture = createHost();
    const error = new Error("commit parcial sintético");
    fixture.setCommit(() => {
      fixture.root.dataset.view = "detail";
      fixture.region.hidden = false;
      throw error;
    });
    const controller = start(fixture.host);
    await expect(controller.transitionTo(detail("a"), { origin: "pointer" })).resolves.toMatchObject({
      status: "failed",
      reason: "commit-error",
      recoverTo: OVERVIEW,
    });
    expect(fixture.region).toBeVisible();
    fixture.setCommit(undefined);
    await controller.transitionTo(OVERVIEW, { origin: "direct" });
    expect(fixture.host.applyState).toHaveBeenCalledTimes(2);
    expect(fixture.region).not.toBeVisible();
    expect(fixture.root).toHaveAttribute("data-view", "overview");
  });

  it("onError que lanza no deja pendiente la promesa ni impide recuperarse", async () => {
    const fixture = createHost();
    fixture.host.onError = () => {
      throw new Error("observador sintético fallido");
    };
    fixture.setCommit(() => {
      throw new Error("commit sintético fallido");
    });
    const controller = start(fixture.host);
    await expect(controller.transitionTo(detail("a"), { origin: "pointer" })).resolves.toMatchObject({
      status: "failed",
    });
    fixture.setCommit(undefined);
    await expect(controller.transitionTo(detail("b"), { origin: "pointer" })).resolves.toMatchObject({
      status: "completed",
    });
  });

  it("Tab durante un commit pendiente conserva la última acción del usuario", async () => {
    const fixture = createHost();
    const blocked = deferred();
    fixture.setCommit(() => blocked.promise);
    const controller = start(fixture.host);
    fixture.a.focus();
    const request = controller.transitionTo(detail("a"), { origin: "keyboard" });
    await userEvent.setup().tab();
    expect(fixture.b).toHaveFocus();
    blocked.resolve();
    await expect(request).resolves.toMatchObject({ status: "completed" });
    expect(fixture.b).toHaveFocus();
  });

  it.each(["direct", "deck-forward", "deck-back", "resize", "print"] as const)(
    "%s aplica estado sin tomar foco local",
    async (origin) => {
      const fixture = createHost();
      const controller = start(fixture.host);
      fixture.nextButton.focus();
      await controller.transitionTo(detail("a"), { origin });
      expect(fixture.nextButton).toHaveFocus();
    },
  );

  it.each(["ausente", "desconectado", "hidden", "inert"])(
    "target %s devuelve missing-target sin aplicar estado",
    async (condition) => {
      const fixture = createHost();
      let targetId = "a";
      if (condition === "ausente") targetId = "unknown";
      if (condition === "desconectado") fixture.a.remove();
      if (condition === "hidden") fixture.a.hidden = true;
      if (condition === "inert") fixture.a.setAttribute("inert", "");
      const controller = start(fixture.host);
      await expect(controller.transitionTo(detail(targetId), { origin: "pointer" })).resolves.toMatchObject({
        status: "failed",
        reason: "missing-target",
        recoverTo: OVERVIEW,
      });
      expect(fixture.host.applyState).not.toHaveBeenCalled();
      expect(fixture.root).toHaveAttribute("data-motion-phase", "idle");
    },
  );

  it("target eliminado mientras espera el commit falla y permite recuperación explícita", async () => {
    const fixture = createHost();
    const blocked = deferred();
    fixture.setCommit(() => blocked.promise);
    const controller = start(fixture.host);
    const request = controller.transitionTo(detail("a"), { origin: "pointer" });
    fixture.a.remove();
    blocked.resolve();
    await expect(request).resolves.toMatchObject({ status: "failed", reason: "missing-target", recoverTo: OVERVIEW });
    fixture.setCommit(undefined);
    await expect(controller.transitionTo(OVERVIEW, { origin: "direct" })).resolves.toMatchObject({
      status: "completed",
    });
    expect(fixture.root).toHaveAttribute("data-view", "overview");
  });

  it("un commit rechazado informa el error y la siguiente acción sigue operativa", async () => {
    const fixture = createHost();
    const error = new Error("commit sintético fallido");
    fixture.setCommit(() => Promise.reject(error));
    const controller = start(fixture.host);
    await expect(controller.transitionTo(detail("a"), { origin: "pointer" })).resolves.toMatchObject({
      status: "failed",
      reason: "commit-error",
      recoverTo: OVERVIEW,
    });
    expect(fixture.host.onError).toHaveBeenCalledExactlyOnceWith(error);
    fixture.setCommit(undefined);
    await expect(controller.transitionTo(detail("b"), { origin: "pointer" })).resolves.toMatchObject({
      status: "completed",
    });
    expect(fixture.root).toHaveAttribute("data-target", "b");
  });

  it("un rechazo obsoleto no informa error ni altera una intención posterior", async () => {
    const fixture = createHost();
    const blocked = deferred();
    fixture.setCommit((state) => (state.targetId === "a" ? blocked.promise : undefined));
    const controller = start(fixture.host);
    const first = controller.transitionTo(detail("a"), { origin: "pointer" });
    const second = controller.transitionTo(detail("b"), { origin: "pointer" });
    blocked.reject(new Error("rechazo tardío sintético"));
    await expect(Promise.all([first, second])).resolves.toMatchObject([
      { status: "superseded" },
      { status: "completed" },
    ]);
    expect(fixture.host.onError).not.toHaveBeenCalled();
    expect(fixture.root).toHaveAttribute("data-target", "b");
  });
});

describe("carga protegida del driver y respaldo instantáneo", () => {
  it("un rechazo de carga después de destroy no llama al observador del host", async () => {
    const fixture = createHost();
    const loading = deferred<MotionDriver>();
    const controller = start(fixture.host, { loadDriver: () => loading.promise });
    await flush();
    controller.destroy();
    loading.reject(new Error("rechazo de carga sintético tardío"));
    await flush();
    expect(fixture.host.onError).not.toHaveBeenCalled();
  });

  it("funciona durante la carga y adopta el driver solo al estabilizar el commit", async () => {
    const fixture = createHost();
    const loading = deferred<MotionDriver>();
    const blocked = deferred();
    fixture.setCommit((state) => (state.targetId === "a" ? blocked.promise : undefined));
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: () => loading.promise });
    const first = controller.transitionTo(detail("a"), { origin: "pointer" });
    loading.resolve(motion.driver);
    await flush();
    expect(motion.driver.capture).not.toHaveBeenCalled();
    expect(motion.driver.play).not.toHaveBeenCalled();
    blocked.resolve();
    await expect(first).resolves.toMatchObject({ status: "completed" });
    const second = controller.transitionTo(detail("b"), { origin: "pointer" });
    await flush();
    expect(motion.driver.play).toHaveBeenCalledOnce();
    motion.finish();
    await expect(second).resolves.toMatchObject({ status: "completed" });
  });

  it.each(["throw", "reject"])("fallo de carga %s conserva abrir, cambiar y volver", async (mode) => {
    const fixture = createHost();
    const error = new Error("carga sintética fallida");
    const controller = start(fixture.host, {
      loadDriver: () => {
        if (mode === "throw") throw error;
        return Promise.reject(error);
      },
    });
    await flush();
    expect(fixture.host.onError).toHaveBeenCalledExactlyOnceWith(error);
    for (const state of [detail("a"), detail("b"), OVERVIEW]) {
      await expect(controller.transitionTo(state, { origin: "pointer" })).resolves.toMatchObject({
        status: "completed",
      });
    }
    expect(fixture.root).toHaveAttribute("data-view", "overview");
  });

  it("driver resuelto después de destroy se destruye sin reproducir", async () => {
    const fixture = createHost();
    const loading = deferred<MotionDriver>();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: () => loading.promise });
    await flush();
    controller.destroy();
    loading.resolve(motion.driver);
    await flush();
    expect(motion.driver.destroy).toHaveBeenCalledOnce();
    expect(motion.driver.play).not.toHaveBeenCalled();
  });

  it.each(["capture", "play", "settle"] as const)(
    "error de %s destruye el driver y conserva el resultado semántico",
    async (operation) => {
      const fixture = createHost();
      const motion = createDriver();
      const error = new Error(`fallo sintético de ${operation}`);
      vi.mocked(motion.driver[operation]).mockImplementation(() => {
        throw error;
      });
      const controller = start(fixture.host, { loadDriver: async () => motion.driver });
      await flush();
      await expect(controller.transitionTo(detail("a"), { origin: "keyboard" })).resolves.toMatchObject({
        status: "completed",
      });
      expect(fixture.host.onError).toHaveBeenCalledExactlyOnceWith(error);
      expect(motion.driver.destroy).toHaveBeenCalledOnce();
      expect(fixture.root).toHaveAttribute("data-target", "a");
      await expect(controller.transitionTo(OVERVIEW, { origin: "keyboard" })).resolves.toMatchObject({
        status: "completed",
      });
      expect(fixture.a).toHaveFocus();
    },
  );
});

describe("preferencia de movimiento y estabilización del layout", () => {
  it("altura de coordinateRoot externo estabiliza aunque su ancho permanezca igual", async () => {
    const fixture = createHost();
    const coordinateRoot = document.createElement("main");
    fixture.root.before(coordinateRoot);
    coordinateRoot.append(fixture.root);
    roots.push(coordinateRoot);
    fixture.host.coordinateRoot = coordinateRoot;
    let height = 600;
    vi.spyOn(coordinateRoot, "getBoundingClientRect").mockImplementation(() => ({ width: 900, height }) as DOMRect);
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "pointer" });
    await flush();
    height = 500;
    ObservedResize.instances[0].emit();
    await expect(request).resolves.toMatchObject({ status: "completed" });
    expect(fixture.root).toHaveAttribute("data-motion-phase", "idle");
  });

  it("altura propia causada por el layout no cancela una animación de la escena", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "pointer" });
    await flush();
    fixture.resize(900, 800);
    ObservedResize.instances[0].emit();
    expect(fixture.root).toHaveAttribute("data-motion-phase", "animating");
    motion.finish();
    await expect(request).resolves.toMatchObject({ status: "completed" });
  });

  it("enter explícito usa su propio ciclo cancelable y overview estable no lo repite", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const entering = controller.enter();
    await flush();
    expect(motion.plays[0].frame).toMatchObject({ kind: "enter", durationMs: MOTION.enterMs });
    expect(motion.driver.capture).not.toHaveBeenCalled();
    motion.finish();
    await entering;
    await controller.transitionTo(OVERVIEW, { origin: "deck-forward" });
    expect(motion.driver.play).toHaveBeenCalledOnce();
    const replay = controller.enter();
    await flush();
    expect(motion.driver.play).toHaveBeenCalledTimes(2);
    controller.destroy();
    await expect(replay).resolves.toMatchObject({ status: "destroyed" });
  });

  it("none conserva contenido y foco sin captura ni reproducción", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { motionPolicy: "none", loadDriver: async () => motion.driver });
    await flush();
    await controller.transitionTo(detail("a"), { origin: "keyboard" });
    expect(fixture.heading).toHaveFocus();
    expect(motion.driver.capture).not.toHaveBeenCalled();
    expect(motion.driver.play).not.toHaveBeenCalled();
  });

  it.each(["reduce", "system"] as const)("%s respeta reducción y limita el fundido a 100 ms", async (motionPolicy) => {
    if (motionPolicy === "system") Object.assign(media, { matches: true });
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { motionPolicy, loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "keyboard" });
    await flush();
    expect(motion.plays[0].frame).toMatchObject({ reduced: true, durationMs: MOTION.reducedRevealMs });
    expect(fixture.heading).toHaveFocus();
    motion.finish();
    await expect(request).resolves.toMatchObject({ status: "completed" });
  });

  it("cambio de system durante apertura estabiliza y aplica la preferencia a la acción siguiente", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { motionPolicy: "system", loadDriver: async () => motion.driver });
    await flush();
    const first = controller.transitionTo(detail("a"), { origin: "pointer" });
    await flush();
    expect(motion.plays[0].frame.reduced).toBe(false);
    Object.assign(media, { matches: true });
    media.dispatchEvent(new Event("change"));
    await expect(first).resolves.toMatchObject({ status: "completed" });
    const second = controller.transitionTo(detail("b"), { origin: "pointer" });
    await flush();
    expect(motion.plays[1].frame).toMatchObject({ reduced: true, durationMs: MOTION.reducedRevealMs });
    motion.finish();
    await second;
  });

  it.each(["settle", "invalidateLayout", "window-resize", "viewport-resize", "beforeprint", "hidden"])(
    "%s estabiliza la intención vigente sin otro commit",
    async (event) => {
      const fixture = createHost();
      const motion = createDriver();
      const controller = start(fixture.host, { loadDriver: async () => motion.driver });
      await flush();
      const request = controller.transitionTo(detail("a"), { origin: "pointer" });
      await flush();
      if (event === "settle") controller.settle();
      if (event === "invalidateLayout") controller.invalidateLayout();
      if (event === "window-resize") window.dispatchEvent(new Event("resize"));
      if (event === "viewport-resize") viewport.dispatchEvent(new Event("resize"));
      if (event === "beforeprint") window.dispatchEvent(new Event("beforeprint"));
      if (event === "hidden") {
        hidden.mockReturnValue(true);
        document.dispatchEvent(new Event("visibilitychange"));
      }
      await expect(request).resolves.toMatchObject({ status: "completed" });
      expect(fixture.host.applyState).toHaveBeenCalledOnce();
      expect(fixture.root).toHaveAttribute("data-target", "a");
      expect(fixture.root).toHaveAttribute("data-motion-phase", "idle");
      motion.finish();
      expect(fixture.root).toHaveAttribute("data-motion-phase", "idle");
    },
  );

  it("ResizeObserver estabiliza al cambiar dimensiones y se desconecta al destruir", async () => {
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "pointer" });
    await flush();
    fixture.resize(700, 600);
    const observer = ObservedResize.instances[0];
    expect(observer.observe).toHaveBeenCalledWith(fixture.host.coordinateRoot);
    observer.emit();
    await expect(request).resolves.toMatchObject({ status: "completed" });
    controller.destroy();
    expect(observer.disconnect).toHaveBeenCalledOnce();
    const calls = vi.mocked(motion.driver.settle).mock.calls.length;
    window.dispatchEvent(new Event("resize"));
    viewport.dispatchEvent(new Event("resize"));
    media.dispatchEvent(new Event("change"));
    expect(motion.driver.settle).toHaveBeenCalledTimes(calls);
  });

  it("resize antes del commit vuelve instantánea la reproducción pendiente", async () => {
    const fixture = createHost();
    const blocked = deferred();
    fixture.setCommit(() => blocked.promise);
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    const request = controller.transitionTo(detail("a"), { origin: "pointer" });
    window.dispatchEvent(new Event("resize"));
    blocked.resolve();
    await expect(request).resolves.toMatchObject({ status: "completed" });
    expect(motion.driver.play).not.toHaveBeenCalled();
    expect(fixture.root).toHaveAttribute("data-target", "a");
  });

  it("pestaña oculta aplica el estado sin reproducir y no reanima al volver", async () => {
    hidden.mockReturnValue(true);
    const fixture = createHost();
    const motion = createDriver();
    const controller = start(fixture.host, { loadDriver: async () => motion.driver });
    await flush();
    await controller.transitionTo(detail("a"), { origin: "pointer" });
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(motion.driver.play).not.toHaveBeenCalled();
    expect(fixture.root).toHaveAttribute("data-target", "a");
  });
});
