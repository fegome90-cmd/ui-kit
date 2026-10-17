import type * as React from "react";
import { cx } from "@/lib/kraa/kraa-utils";
export function KraaFieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cx("kraa-field-group", className)} {...props} />;
}
export function KraaField({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cx("kraa-field", className)} {...props} />;
}
export function KraaFieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return <fieldset className={cx("kraa-fieldset", className)} {...props} />;
}
export function KraaFieldLegend(props: React.ComponentProps<"legend">) {
  return <legend className="kraa-legend" {...props} />;
}
export function KraaFieldLabel(props: React.ComponentProps<"label">) {
  // biome-ignore lint/a11y/noLabelWithoutControl: primitiva genérica; quien la usa pasa htmlFor
  return <label className="kraa-label" {...props} />;
}
