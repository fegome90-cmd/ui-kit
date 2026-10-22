"use client";

import * as React from "react";
import { FocusExpand, type FocusExpandHandle, type FocusExpandItem } from "@/components/ui/lab/focus-expand";
import { StepReveal } from "@/components/ui/lab/step-reveal";
import type { MotionPolicy } from "@/lib/motion/types";
import { cn } from "@/lib/utils";

export interface MotionDemoProject {
  id: string;
  name: string;
  summary: string;
  items: readonly FocusExpandItem[];
  comments: { overview: string; detail: string };
}

export type MotionSceneDemoProps = React.ComponentProps<"div"> & {
  projects: readonly MotionDemoProject[];
  initialProjectId?: string;
  initialMotionPolicy?: MotionPolicy;
};

/** Composición neutral; el consumidor aporta los proyectos, objetivos y comentarios. */
function MotionSceneDemo({
  projects,
  initialProjectId,
  initialMotionPolicy = "system",
  className,
  ...props
}: MotionSceneDemoProps) {
  const [projectId, setProjectId] = React.useState(initialProjectId ?? projects[0]?.id);
  const [value, setValue] = React.useState<string | null>(null);
  const [policy, setPolicy] = React.useState<MotionPolicy>(initialMotionPolicy);
  const scene = React.useRef<FocusExpandHandle>(null);
  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const base = React.useId();
  if (!project)
    return (
      <div {...props} data-slot="motion-scene-demo" className={className}>
        Agrega un proyecto para explorar la escena.
      </div>
    );
  return (
    <div {...props} data-slot="motion-scene-demo" className={cn("grid w-full gap-[20px]", className)}>
      <div className="flex flex-wrap items-end gap-[12px]">
        <label htmlFor={`${base}-project`} className="grid gap-[6px] text-[13px] font-semibold">
          Contenido del proyecto
          <select
            id={`${base}-project`}
            className="lab-motion-select"
            value={project.id}
            onChange={(event) => setProjectId(event.target.value)}
          >
            {projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${base}-motion`} className="grid gap-[6px] text-[13px] font-semibold">
          Movimiento
          <select
            id={`${base}-motion`}
            className="lab-motion-select"
            value={policy}
            onChange={(event) => setPolicy(event.target.value as MotionPolicy)}
          >
            <option value="system">Según el sistema</option>
            <option value="reduce">Reducido</option>
            <option value="none">Sin animación</option>
          </select>
        </label>
        <button
          type="button"
          className="lab-motion-button"
          onClick={() => {
            void scene.current?.enter("deck-forward");
          }}
        >
          Repetir entrada
        </button>
      </div>
      <div>
        <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-lab-accent">
          Proyectos ficticios · demostración
        </p>
        <h2 className="mb-[8px] mt-[6px] text-[26px] font-semibold leading-[1.15]">{project.name}</h2>
        <p className="m-0 max-w-[64ch] text-[15px] leading-[1.5] text-lab-muted max-[760px]:text-[16px]">
          {project.summary}
        </p>
      </div>
      <FocusExpand
        ref={scene}
        label="Objetivos del proyecto"
        items={project.items}
        contentKey={project.id}
        origin="pointer"
        value={value}
        onValueChange={setValue}
        motionPolicy={policy}
      />
      <StepReveal
        stateKey={`${project.id}:${value ?? "overview"}`}
        motionPolicy={policy}
        minBlockSize="5rem"
        aria-live="polite"
        aria-atomic="true"
        className="rounded-[12px] border-l-[3px] border-lab-accent bg-lab-accent-soft p-[16px]"
      >
        <p className="m-0 text-[14px] leading-[1.5] max-[760px]:text-[16px]">
          {value ? project.comments.detail : project.comments.overview}
        </p>
      </StepReveal>
    </div>
  );
}

export { MotionSceneDemo };
