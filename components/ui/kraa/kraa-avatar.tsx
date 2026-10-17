import type * as React from "react";
import { cn } from "@/lib/utils";

/** Círculo con iniciales o imagen (antes, la clase .kraa-avatar). */
export function KraaAvatar({
  size = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & { size?: "default" | "small" }) {
  return (
    <span
      data-slot="kraa-avatar"
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-clip rounded-full bg-kraa-surface-active [&_img]:size-full [&_img]:object-cover",
        size === "small" ? "size-[18px] text-[8px]" : "size-7 text-[11px]",
        className,
      )}
      {...props}
    />
  );
}
