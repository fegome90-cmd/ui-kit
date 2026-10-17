import { ArrowUpRight } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Link coral en línea con flecha ↗ (como en el titular)
function TextLink({ className, children, arrow = true, ...props }: React.ComponentProps<"a"> & { arrow?: boolean }) {
  return (
    <a
      className={cn(
        "inline-flex items-baseline text-primary transition-opacity duration-(--duration-color) ease-out-quart hover:opacity-80",
        className,
      )}
      {...props}
    >
      {children}
      {arrow && <ArrowUpRight className="ml-0.5 size-[0.6em] self-center" strokeWidth={2} />}
    </a>
  );
}

export { TextLink };
