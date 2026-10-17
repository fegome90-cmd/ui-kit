"use client";

import type { ReactNode } from "react";
import { ReaMonogram } from "@/components/ui/rea/rea-monogram";
import { ReaNav, type ReaNavItem } from "@/components/ui/rea/rea-nav";
import { ReaScrollProgress } from "@/components/ui/rea/rea-scroll-progress";
import { cn } from "@/lib/utils";

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
  className,
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
  className?: string;
}) {
  return (
    <header
      data-slot="rea-site-header"
      data-sticky={sticky || undefined}
      className={cn(
        "relative grid h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-4 bg-rea-bg px-(--rea-gutter) data-sticky:sticky data-sticky:top-0 data-sticky:z-80 max-[960px]:grid-cols-[1fr_auto]",
        className,
      )}
    >
      <a
        href={homeHref}
        className="inline-flex items-center gap-3 justify-self-start whitespace-nowrap"
        aria-label={`${brand}, inicio`}
      >
        <ReaMonogram className="h-7 w-[43px]" />
        <span className="font-rea-mono text-[0.74rem] tracking-[-0.025em] uppercase" aria-hidden="true">
          {brand}
          <span className="text-rea-muted normal-case max-[960px]:hidden"> {role}</span>
        </span>
      </a>
      <ReaNav items={nav} current={current} className="max-[960px]:hidden" />
      <div className="flex items-center gap-2 justify-self-end">{tools}</div>
      <div className="absolute inset-x-(--rea-gutter) bottom-0">
        {progress !== undefined ? (
          <ReaScrollProgress value={progress} />
        ) : (
          <div className="rea-ruler h-[7px]" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
