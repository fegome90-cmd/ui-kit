"use client";

import * as React from "react";
import { loadGsapDriver } from "@/lib/motion/load-driver";
import { createSceneController } from "@/lib/motion/scene-controller";
import {
  type CommitContext,
  type MotionOrigin,
  type MotionPolicy,
  OVERVIEW,
  type SceneController,
  type SceneHost,
  type SceneOptions,
  type SceneState,
  type TransitionOptions,
  type TransitionResult,
} from "@/lib/motion/types";
import { cn } from "@/lib/utils";

export interface FocusExpandItem {
  id: string;
  title: string;
  summary?: React.ReactNode;
  content: React.ReactNode;
}

export interface FocusExpandHandle {
  transitionTo(state: SceneState, options: TransitionOptions): Promise<TransitionResult>;
  enter(origin?: MotionOrigin): Promise<TransitionResult>;
  settle(): void;
  invalidateLayout(): void;
}

export type FocusExpandProps = Omit<
  React.ComponentProps<"section">,
  "onChange" | "children" | "ref" | "defaultValue"
> & {
  items: readonly FocusExpandItem[];
  label: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** El consumidor cambia esta clave cuando prepara un nuevo contenido. */
  contentKey?: string;
  origin?: MotionOrigin;
  motionPolicy?: MotionPolicy;
  loadDriver?: SceneOptions["loadDriver"] | false;
  onMotionError?: (error: unknown) => void;
  onTransitionResult?: (result: TransitionResult) => void;
  emptyContent?: React.ReactNode;
  ref?: React.Ref<FocusExpandHandle>;
};

type RenderedScene = { state: SceneState; items: readonly FocusExpandItem[]; contentKey: string; requestId: number };
type Acknowledgement = { requestId: number; finish: () => void };

/** Región de detalle en la página: superficies decorativas con Flip, texto siempre a tamaño final. */
function FocusExpand({
  items,
  label,
  value,
  defaultValue = null,
  onValueChange,
  contentKey = "default",
  origin = "direct",
  motionPolicy = "system",
  loadDriver = loadGsapDriver,
  onMotionError,
  onTransitionResult,
  emptyContent = "No hay elementos para explorar.",
  className,
  onKeyDown,
  ref,
  ...props
}: FocusExpandProps) {
  const desiredValue = value === undefined ? defaultValue : value;
  const [rendered, setRendered] = React.useState<RenderedScene>(() => ({
    state:
      desiredValue && items.some((item) => item.id === desiredValue)
        ? { view: "detail", targetId: desiredValue }
        : OVERVIEW,
    items: [...items],
    contentKey,
    requestId: 0,
  }));
  const root = React.useRef<HTMLElement>(null);
  const controller = React.useRef<SceneController | null>(null);
  const committed = React.useRef(rendered);
  const acknowledgement = React.useRef<Acknowledgement | null>(null);
  const mounted = React.useRef(false);
  const transitionEpoch = React.useRef(0);
  const intent = React.useRef<{ value: string | null; origin: MotionOrigin } | null>(null);
  const latest = React.useRef({ items, onMotionError, onValueChange, onTransitionResult });
  const base = React.useId();

  React.useLayoutEffect(() => {
    // Un render concurrente descartado no debe cambiar lo que leerá el siguiente commit del host.
    latest.current = { items, onMotionError, onValueChange, onTransitionResult };
  }, [items, onMotionError, onValueChange, onTransitionResult]);

  React.useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    mounted.current = true;
    const applyState = (state: SceneState, context: CommitContext) => {
      if (!mounted.current || context.signal.aborted) return;
      // La instantánea se toma después de la captura del driver, dentro del commit del host.
      const next: RenderedScene = {
        state,
        items: [...latest.current.items],
        contentKey: context.contentKey,
        requestId: context.requestId,
      };
      return new Promise<void>((resolve) => {
        const finish = () => {
          context.signal.removeEventListener("abort", finish);
          if (acknowledgement.current?.finish === finish) acknowledgement.current = null;
          resolve();
        };
        acknowledgement.current?.finish();
        acknowledgement.current = { requestId: context.requestId, finish };
        context.signal.addEventListener("abort", finish, { once: true });
        // Una actualización encolada que perdió su solicitud no puede reaparecer después.
        setRendered((previous) => (context.signal.aborted ? previous : next));
      });
    };
    const host: SceneHost = {
      root: element,
      coordinateRoot: element,
      getTargets: () => [...element.querySelectorAll('[data-motion-role="context-surface"]')],
      resolveTarget: (id) =>
        [...element.querySelectorAll<HTMLElement>("[data-motion-target]")].find(
          (surface) => surface.dataset.motionTarget === id,
        ) ?? null,
      getReturnFocus: (id) =>
        [...element.querySelectorAll<HTMLButtonElement>("[data-motion-trigger]")].find(
          (button) => button.dataset.motionTrigger === id,
        ) ?? null,
      getDetailHeading: () => element.querySelector<HTMLElement>("[data-motion-heading]"),
      applyState,
      onError: (error) => latest.current.onMotionError?.(error),
    };
    const scene = createSceneController(host, {
      initialState: committed.current.state,
      contentKey: committed.current.contentKey,
      motionPolicy,
      loadDriver: loadDriver || undefined,
    });
    controller.current = scene;
    return () => {
      mounted.current = false;
      transitionEpoch.current += 1;
      scene.destroy();
      acknowledgement.current?.finish();
      if (controller.current === scene) controller.current = null;
    };
  }, [motionPolicy, loadDriver]);

  React.useLayoutEffect(() => {
    committed.current = rendered;
    const ack = acknowledgement.current;
    if (ack?.requestId === rendered.requestId) ack.finish();
  }, [rendered]);

  const transition = React.useCallback(async (state: SceneState, options: TransitionOptions) => {
    const epoch = ++transitionEpoch.current;
    const result = await (controller.current?.transitionTo(state, options) ??
      Promise.resolve({ requestId: 0, status: "destroyed" } as const));
    if (!mounted.current || epoch !== transitionEpoch.current) return result;
    latest.current.onTransitionResult?.(result);
    if (result.status === "failed") {
      await controller.current?.transitionTo(result.recoverTo, { origin: "direct", contentKey: options.contentKey });
      if (!mounted.current || epoch !== transitionEpoch.current) return result;
      latest.current.onValueChange?.(null);
    }
    return result;
  }, []);

  React.useEffect(() => {
    const next: SceneState =
      value === undefined ? committed.current.state : value ? { view: "detail", targetId: value } : OVERVIEW;
    const localIntent = intent.current;
    intent.current = null;
    void transition(next, {
      origin: localIntent && localIntent.value === value ? localIntent.origin : origin,
      contentKey,
    });
  }, [value, contentKey, origin, transition]);

  React.useImperativeHandle(
    ref,
    () => ({
      transitionTo: transition,
      enter: (entryOrigin = "deck-forward") => {
        transitionEpoch.current += 1;
        return controller.current?.enter(entryOrigin) ?? Promise.resolve({ requestId: 0, status: "destroyed" });
      },
      settle: () => controller.current?.settle(),
      invalidateLayout: () => controller.current?.invalidateLayout(),
    }),
    [transition],
  );

  const choose = (id: string | null, actionOrigin: MotionOrigin) => {
    intent.current = { value: id, origin: actionOrigin };
    if (value === undefined)
      void transition(id ? { view: "detail", targetId: id } : OVERVIEW, { origin: actionOrigin, contentKey });
    onValueChange?.(id);
  };
  const active =
    rendered.state.view === "detail" ? rendered.items.find((item) => item.id === rendered.state.targetId) : undefined;

  return (
    <section
      {...props}
      ref={root}
      aria-label={label}
      data-slot="focus-expand"
      data-motion-view={rendered.state.view}
      data-motion-content-key={rendered.contentKey}
      className={cn("lab-focus-expand", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape" && rendered.state.view === "detail") {
          event.preventDefault();
          event.stopPropagation();
          choose(null, "keyboard");
        }
      }}
    >
      <div className="lab-focus-expand__context">
        {rendered.items.length === 0 && <p className="m-0 text-[15px] text-lab-muted">{emptyContent}</p>}
        {rendered.items.map((item) => (
          <article key={item.id} className="lab-focus-expand__item" data-selected={item.id === active?.id}>
            <span
              data-motion-target={item.id}
              data-motion-role="context-surface"
              className="lab-focus-expand__surface"
            />
            <div className="relative p-[18px]">
              <button
                type="button"
                data-motion-trigger={item.id}
                aria-expanded={item.id === active?.id}
                aria-controls={`${base}-detail`}
                className="lab-motion-button w-full text-left font-semibold"
                onClick={(event) => choose(item.id, event.detail === 0 ? "keyboard" : "pointer")}
              >
                {item.title}
                <span aria-hidden className="ml-[8px]">
                  ↗
                </span>
              </button>
              {item.summary && (
                <div className="mt-[8px] text-[14px] leading-[1.5] text-lab-muted max-[760px]:text-[16px]">
                  {item.summary}
                </div>
              )}
              {item.id === active?.id && (
                <p className="mb-0 mt-[10px] text-[12px] font-semibold text-lab-accent">Detalle abierto</p>
              )}
            </div>
          </article>
        ))}
      </div>
      <section
        id={`${base}-detail`}
        hidden={!active}
        aria-labelledby={`${base}-heading`}
        className="lab-focus-expand__detail"
      >
        <span data-motion-role="detail-surface" className="lab-focus-expand__detail-surface" />
        <div className="relative flex min-h-0 flex-col p-[22px]">
          <div className="mb-[18px] flex items-start justify-between gap-[16px]">
            <h3
              id={`${base}-heading`}
              data-motion-heading
              tabIndex={-1}
              className="lab-motion-heading m-0 text-[22px] font-semibold leading-[1.2]"
            >
              {active?.title}
            </h3>
            <button
              type="button"
              className="lab-motion-button shrink-0 text-[13px]"
              onClick={(event) => choose(null, event.detail === 0 ? "keyboard" : "pointer")}
            >
              Volver
            </button>
          </div>
          <div
            data-motion-role="reveal"
            className="min-h-0 overflow-auto text-[15px] leading-[1.6] max-[760px]:text-[16px]"
          >
            {active?.content ?? "Este elemento todavía no tiene detalle."}
          </div>
        </div>
      </section>
    </section>
  );
}

export { FocusExpand };
