"use client";

import * as React from "react";
import { loadGsapDriver } from "@/lib/motion/load-driver";
import { createSceneController } from "@/lib/motion/scene-controller";
import type { MotionOrigin, MotionPolicy, SceneController, SceneOptions } from "@/lib/motion/types";
import { cn } from "@/lib/utils";

export interface SceneEnterHandle {
  enter(origin?: MotionOrigin): void;
  settle(): void;
}

export type SceneEnterProps = Omit<React.ComponentProps<"div">, "ref"> & {
  /** Solo una nueva clave acompañada de deck-forward reproduce la entrada. */
  entryKey?: string | number;
  origin?: MotionOrigin;
  motionPolicy?: MotionPolicy;
  loadDriver?: SceneOptions["loadDriver"] | false;
  onMotionError?: (error: unknown) => void;
  ref?: React.Ref<SceneEnterHandle>;
};

function SceneEnter({
  entryKey = "initial",
  origin = "direct",
  motionPolicy = "system",
  loadDriver = loadGsapDriver,
  onMotionError,
  className,
  children,
  ref,
  ...props
}: SceneEnterProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const controller = React.useRef<SceneController | null>(null);
  const errorHandler = React.useRef(onMotionError);
  errorHandler.current = onMotionError;
  React.useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const scene = createSceneController(
      {
        root: element,
        coordinateRoot: element,
        getTargets: () => [],
        resolveTarget: () => null,
        applyState: () => {},
        getReturnFocus: () => null,
        getDetailHeading: () => null,
        onError: (error) => errorHandler.current?.(error),
      },
      { motionPolicy, loadDriver: loadDriver || undefined },
    );
    controller.current = scene;
    const settle = () => scene.settle();
    element.addEventListener("pointerdown", settle, true);
    element.addEventListener("keydown", settle, true);
    return () => {
      element.removeEventListener("pointerdown", settle, true);
      element.removeEventListener("keydown", settle, true);
      scene.destroy();
      if (controller.current === scene) controller.current = null;
    };
  }, [motionPolicy, loadDriver]);
  React.useLayoutEffect(() => {
    // Sustituir contenido estabiliza la entrada antes de operar el nuevo contenido.
    void children;
    controller.current?.settle();
  }, [children]);
  React.useEffect(() => {
    void entryKey;
    void controller.current?.enter(origin);
  }, [entryKey, origin]);
  React.useImperativeHandle(
    ref,
    () => ({
      enter: (entryOrigin = "deck-forward") => {
        void controller.current?.enter(entryOrigin);
      },
      settle: () => controller.current?.settle(),
    }),
    [],
  );
  return (
    <div {...props} ref={root} data-slot="scene-enter" className={cn("relative", className)}>
      {children}
    </div>
  );
}

export { SceneEnter };
