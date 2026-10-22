import { MOTION } from "./tokens";
import {
  type MotionDriver,
  type MotionFrame,
  OVERVIEW,
  type SceneController,
  type SceneHost,
  type SceneOptions,
  type SceneState,
  type TransitionOptions,
  type TransitionResult,
} from "./types";

const same = (a: SceneState, b: SceneState) => a.view === b.view && a.targetId === b.targetId;
const local = (origin: string) => origin === "pointer" || origin === "keyboard";
const visible = (el: HTMLElement | null): el is HTMLElement =>
  Boolean(el?.isConnected && !el.closest('[hidden], [inert], [aria-hidden="true"]'));

/** Núcleo DOM sin React, navegación, datos ni import estático del motor. */
export function createSceneController(host: SceneHost, options: SceneOptions = {}): SceneController {
  const doc = host.root.ownerDocument;
  const win = doc.defaultView;
  const media = win?.matchMedia?.("(prefers-reduced-motion: reduce)");
  let destroyed = false;
  let sequence = 0;
  let activity = 0;
  let state = options.initialState ?? OVERVIEW;
  let contentKey = options.contentKey ?? "default";
  let dirty = false;
  const hasTarget = (id: string) => {
    const target = host.resolveTarget(id);
    return Boolean(target?.isConnected && host.root.contains(target) && !target.closest("[hidden], [inert]"));
  };
  let driver: MotionDriver | undefined;
  let pendingDriver: MotionDriver | undefined;
  let pending:
    | {
        id: number;
        abort: AbortController;
        finish: (result: TransitionResult) => void;
        committed: boolean;
        instant: boolean;
      }
    | undefined;
  const report = (error: unknown) => {
    try {
      host.onError?.(error);
    } catch {
      /* Un observador no rompe la interacción. */
    }
  };
  const setPhase = (phase: string) => {
    host.root.dataset.motionPhase = phase;
  };
  const adopt = () => {
    if (!destroyed && !pending && pendingDriver) {
      driver?.destroy();
      driver = pendingDriver;
      pendingDriver = undefined;
    }
  };
  const complete = (id: number, result: TransitionResult) => {
    if (pending?.id !== id) return;
    const task = pending;
    pending = undefined;
    task.abort.abort();
    task.finish(result);
    setPhase(destroyed ? "destroyed" : "idle");
    adopt();
  };
  const dropDriver = (error: unknown) => {
    try {
      driver?.destroy();
    } catch {
      /* Respaldo instantáneo. */
    }
    driver = undefined;
    report(error);
  };
  const settle = () => {
    if (!pending) return;
    pending.instant = true;
    try {
      driver?.settle();
    } catch (error) {
      dropDriver(error);
    }
    if (pending?.committed) {
      if (state.view === "detail" && !hasTarget(state.targetId)) {
        dirty = true;
        complete(pending.id, {
          requestId: pending.id,
          status: "failed",
          reason: "missing-target",
          recoverTo: OVERVIEW,
        });
      } else complete(pending.id, { requestId: pending.id, status: "completed" });
    }
  };
  const changedActivity = () => {
    activity += 1;
  };
  for (const event of ["pointerdown", "keydown", "focusin"]) doc.addEventListener(event, changedActivity, true);
  const hidden = () => {
    if (doc.hidden) settle();
  };
  doc.addEventListener("visibilitychange", hidden);
  media?.addEventListener("change", settle);
  win?.addEventListener("resize", settle);
  win?.visualViewport?.addEventListener("resize", settle);
  win?.addEventListener("beforeprint", settle);
  let bounds = host.coordinateRoot.getBoundingClientRect();
  const observer =
    typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(() => {
          const next = host.coordinateRoot.getBoundingClientRect();
          if (next.width !== bounds.width || (host.coordinateRoot !== host.root && next.height !== bounds.height)) {
            bounds = next;
            settle();
          }
        });
  observer?.observe(host.coordinateRoot);
  setPhase("idle");
  if (options.loadDriver) {
    Promise.resolve()
      .then(() => options.loadDriver?.(host))
      .then((loaded) => {
        if (!loaded) return;
        if (destroyed) loaded.destroy();
        else {
          pendingDriver = loaded;
          adopt();
        }
      })
      .catch((error) => {
        if (!destroyed) report(error);
      });
  }

  function run(next: SceneState, config: TransitionOptions, entering = false): Promise<TransitionResult> {
    const id = ++sequence;
    if (destroyed) return Promise.resolve({ requestId: id, status: "destroyed" });
    const key = config.contentKey ?? "default";
    const previous = state;
    const unchanged = same(previous, next);
    const contentOnly = unchanged && key !== contentKey;
    const reduced = options.motionPolicy === "reduce" || (media?.matches ?? true);
    const instant =
      options.motionPolicy === "none" ||
      config.animate === false ||
      doc.hidden ||
      ["direct", "deck-back", "resize", "print"].includes(config.origin);
    const kind = entering
      ? "enter"
      : unchanged
        ? "content"
        : next.view === "overview"
          ? "close"
          : previous.view === "overview"
            ? "open"
            : "switch";
    const durationMs = instant
      ? 0
      : reduced
        ? entering
          ? 0
          : MOTION.reducedRevealMs
        : kind === "enter"
          ? MOTION.enterMs
          : kind === "open"
            ? MOTION.openMs
            : kind === "close"
              ? MOTION.closeMs
              : kind === "switch"
                ? MOTION.switchMs
                : MOTION.revealMs;
    const frame: MotionFrame = { from: previous, to: next, kind, durationMs, reduced };
    // Invalidar callbacks antes de medir: Flip.getState puede completar la timeline anterior.
    if (pending) complete(pending.id, { requestId: pending.id, status: "superseded" });
    // Medir antes de estabilizar el movimiento anterior. El nuevo Flip conserva continuidad.
    let snapshot: unknown;
    if (driver && durationMs && !unchanged && !entering && !reduced) {
      try {
        snapshot = driver.capture(frame);
      } catch (error) {
        dropDriver(error);
      }
    }
    try {
      driver?.settle();
    } catch (error) {
      dropDriver(error);
    }
    // Un host puede crear el target al aplicar el nuevo contenido. La validación definitiva
    // ocurre después de ese commit; una petición idéntica solo se omite si sigue siendo válida.
    if (
      !entering &&
      !dirty &&
      unchanged &&
      key === contentKey &&
      (next.view === "overview" || hasTarget(next.targetId))
    )
      return Promise.resolve({ requestId: id, status: "completed" });
    const stamp = activity;
    const active = doc.activeElement;
    return new Promise<TransitionResult>((resolve) => {
      const task = { id, abort: new AbortController(), finish: resolve, committed: false, instant };
      pending = task;
      setPhase("animating");
      const current = () => pending === task && !destroyed && !task.abort.signal.aborted;
      const commit = async () => {
        try {
          dirty = true;
          const commitResult = host.applyState(next, { requestId: id, contentKey: key, signal: task.abort.signal });
          if (commitResult) await commitResult;
          if (!current()) return;
          if (next.view === "detail" && !hasTarget(next.targetId)) {
            complete(id, { requestId: id, status: "failed", reason: "missing-target", recoverTo: OVERVIEW });
            return;
          }
          state = next;
          contentKey = key;
          dirty = false;
          task.committed = true;
          // Foco al commit, nunca desde un callback tardío de animación.
          if (
            !contentOnly &&
            !entering &&
            local(config.origin) &&
            stamp === activity &&
            doc.activeElement === active &&
            visible(host.root)
          ) {
            const target =
              next.view === "detail"
                ? host.getDetailHeading()
                : previous.targetId
                  ? host.getReturnFocus(previous.targetId)
                  : null;
            if (visible(target)) target.focus({ preventScroll: true });
          }
          const done = () => {
            if (!current()) return;
            if (next.view === "detail" && !hasTarget(next.targetId)) {
              dirty = true;
              complete(id, { requestId: id, status: "failed", reason: "missing-target", recoverTo: OVERVIEW });
            } else complete(id, { requestId: id, status: "completed" });
          };
          if (!driver || task.instant || !durationMs || !visible(host.root)) {
            done();
            return;
          }
          try {
            driver.play(snapshot, frame, done);
          } catch (error) {
            dropDriver(error);
            done();
          }
        } catch (error) {
          if (!current()) return;
          report(error);
          complete(id, { requestId: id, status: "failed", reason: "commit-error", recoverTo: OVERVIEW });
        }
      };
      void commit();
    });
  }
  return {
    transitionTo: (next, config) => run(next, config),
    enter: (origin = "deck-forward") => run(state, { origin, contentKey }, origin === "deck-forward"),
    settle,
    invalidateLayout: settle,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (pending) complete(pending.id, { requestId: pending.id, status: "destroyed" });
      observer?.disconnect();
      for (const event of ["pointerdown", "keydown", "focusin"]) doc.removeEventListener(event, changedActivity, true);
      doc.removeEventListener("visibilitychange", hidden);
      media?.removeEventListener("change", settle);
      win?.removeEventListener("resize", settle);
      win?.visualViewport?.removeEventListener("resize", settle);
      win?.removeEventListener("beforeprint", settle);
      try {
        driver?.destroy();
        pendingDriver?.destroy();
      } catch (error) {
        report(error);
      }
      driver = pendingDriver = undefined;
      setPhase("destroyed");
    },
  };
}
