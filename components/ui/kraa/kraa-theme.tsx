"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type KraaTheme = "light" | "dark";
const ThemeContext = React.createContext<KraaTheme>("dark");
export const useKraaTheme = () => React.useContext(ThemeContext);

/** Raíz de la familia Kraa: acota los tokens --kraa-* y el tema; los portales lo replican con useKraaTheme. */
export function KraaProvider({
  theme = "dark",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { theme?: KraaTheme }) {
  return (
    <ThemeContext.Provider value={theme}>
      <div data-slot="kraa-provider" className={cn("kraa-theme", className)} data-kraa-theme={theme} {...props}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
