"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ReaTheme = "light" | "dark";
export type ReaAccent = "blue" | "orange" | "lime";
export const REA_ACCENTS: ReaAccent[] = ["blue", "orange", "lime"];

const ThemeContext = React.createContext<{ theme: ReaTheme; accent: ReaAccent }>({ theme: "light", accent: "blue" });
export const useReaTheme = () => React.useContext(ThemeContext);

/**
 * Raíz de la familia REA. En el sitio original el tema vivía en :root; aquí se acota a un
 * contenedor para convivir con las otras familias. `surface` pinta el fondo del tema.
 */
export function ReaProvider({
  theme = "light",
  accent = "blue",
  surface = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { theme?: ReaTheme; accent?: ReaAccent; surface?: boolean }) {
  const value = React.useMemo(() => ({ theme, accent }), [theme, accent]);
  return (
    <ThemeContext.Provider value={value}>
      <div
        data-slot="rea-provider"
        className={cn("rea-theme", className)}
        data-rea-theme={theme}
        data-rea-accent={accent}
        data-rea-surface={surface || undefined}
        {...props}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** Siguiente acento del ciclo azul → naranjo → lima. */
export const nextAccent = (accent: ReaAccent): ReaAccent =>
  REA_ACCENTS[(REA_ACCENTS.indexOf(accent) + 1) % REA_ACCENTS.length];
