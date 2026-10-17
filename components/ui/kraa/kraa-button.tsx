"use client";
import type * as React from "react";
import { cx } from "@/lib/kraa/kraa-utils";
export type KraaButtonProps = React.ComponentProps<"button"> & {
  variant?: "quiet" | "surface" | "accent" | "danger";
  size?: "default" | "icon" | "row";
};
export function KraaButton({
  variant = "quiet",
  size = "default",
  className,
  type = "button",
  ...props
}: KraaButtonProps) {
  return (
    <button
      type={type}
      data-slot="kraa-button"
      data-variant={variant}
      data-size={size}
      className={cx("kraa-button", className)}
      {...props}
    />
  );
}
