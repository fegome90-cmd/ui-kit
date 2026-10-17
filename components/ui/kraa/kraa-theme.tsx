"use client";
import * as React from "react";
import { cx } from "@/lib/kraa/kraa-utils";
export type KraaTheme = "light" | "dark";
const ThemeContext = React.createContext<KraaTheme>("dark");
export const useKraaTheme = () => React.useContext(ThemeContext);
export function KraaProvider({
  theme = "dark",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { theme?: KraaTheme }) {
  return (
    <ThemeContext.Provider value={theme}>
      <div className={cx("kraa-theme", className)} data-kraa-theme={theme} {...props}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
