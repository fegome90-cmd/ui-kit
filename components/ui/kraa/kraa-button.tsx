"use client";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const kraaButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 border-0 transition-colors duration-150 [&>svg]:size-[18px] [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        quiet: "bg-transparent text-kraa-muted hover:bg-kraa-surface-soft hover:text-kraa-fg",
        surface: "bg-kraa-surface-soft text-kraa-fg hover:bg-kraa-surface-soft",
        accent: "bg-kraa-accent/18 text-kraa-accent hover:bg-kraa-accent/18",
        danger: "bg-transparent text-kraa-danger hover:bg-kraa-surface-soft",
      },
      size: {
        default: "min-h-7 rounded-[8px] px-2.5 py-1",
        icon: "size-8 rounded-[8px] p-1",
        row: "h-7 min-h-7 justify-start rounded-[8px] py-0 pr-0.5 pl-2 text-[13px] leading-[19px] hover:text-kraa-nav-hover [&>svg]:size-6",
      },
    },
    defaultVariants: { variant: "quiet", size: "default" },
  },
);

export type KraaButtonProps = React.ComponentProps<"button"> & VariantProps<typeof kraaButtonVariants>;

export function KraaButton({ variant, size, className, type = "button", ...props }: KraaButtonProps) {
  return (
    <button
      type={type}
      data-slot="kraa-button"
      data-variant={variant ?? "quiet"}
      data-size={size ?? "default"}
      className={cn(kraaButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { kraaButtonVariants };
