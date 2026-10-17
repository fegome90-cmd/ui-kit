import type * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  // biome-ignore lint/a11y/noLabelWithoutControl: primitiva genérica; quien la usa pasa htmlFor
  return <label data-slot="label" className={cn("text-[15px] leading-5 select-none", className)} {...props} />;
}

export { Label };
