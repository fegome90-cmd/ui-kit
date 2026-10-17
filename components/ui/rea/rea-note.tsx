import type * as React from "react";

/** Texto técnico en mono y mayúsculas (".note" del sitio). */
export function ReaNote({
  tone = "muted",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: "muted" | "ink" | "accent" }) {
  return <span className={["rea-note", className].filter(Boolean).join(" ")} data-tone={tone} {...props} />;
}

/** Línea superior con dos notas: título de sección a la izquierda y figura a la derecha. */
export function ReaSectionHead({ title, aside, className }: { title: string; aside?: string; className?: string }) {
  return (
    <div className={["rea-section-head", className].filter(Boolean).join(" ")}>
      <ReaNote>{title}</ReaNote>
      {aside && <ReaNote>{aside}</ReaNote>}
    </div>
  );
}
