"use client";

import type { ReactNode } from "react";
import { ReaMonogram } from "@/components/ui/rea/rea-monogram";
import { ReaNav, type ReaNavItem } from "@/components/ui/rea/rea-nav";
import { ReaScrollProgress } from "@/components/ui/rea/rea-scroll-progress";

/**
 * Cabecera del sitio REA: marca con monograma, navegación rodante centrada, herramientas
 * a la derecha y regla graduada con el progreso de lectura. Bajo 960 px se oculta la navegación.
 */
export function ReaSiteHeader({
  brand = "REA ATLAS",
  role = "/ design library",
  homeHref = "#inicio",
  nav,
  current,
  tools,
  progress,
  sticky = false,
}: {
  brand?: string;
  role?: string;
  homeHref?: string;
  nav: ReaNavItem[];
  current?: string;
  tools?: ReactNode;
  /** 0..1; si se omite no se muestra la barra. */
  progress?: number;
  sticky?: boolean;
}) {
  return (
    <header className="rea-site-header" data-sticky={sticky || undefined}>
      <a href={homeHref} className="rea-brand" aria-label={`${brand}, inicio`}>
        <ReaMonogram />
        <span className="rea-brand-name" aria-hidden="true">
          {brand}
          <span className="rea-brand-role"> {role}</span>
        </span>
      </a>
      <ReaNav items={nav} current={current} />
      <div className="rea-tools">{tools}</div>
      {progress !== undefined ? (
        <ReaScrollProgress value={progress} />
      ) : (
        <div className="rea-scroll-rule" aria-hidden="true" />
      )}
    </header>
  );
}
