import type * as React from "react";
import { FONT_FAMILIES, normalizeTypography, type TypographyConfig, typographyFontSize } from "@/lib/kraa/kraa-model";
export type KraaReadingCanvasProps = {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  settings?: Partial<TypographyConfig>;
  children: React.ReactNode;
};
export function KraaReadingCanvas({
  title,
  subtitle,
  author,
  date,
  breadcrumb,
  actions,
  settings = {},
  children,
}: KraaReadingCanvasProps) {
  const v = normalizeTypography(settings);
  const style = {
    "--kraa-doc-size": typographyFontSize(v),
    "--kraa-doc-leading": v.lineHeight,
    "--kraa-doc-width": `${v.width}px`,
    "--kraa-font-doc": FONT_FAMILIES[v.font],
  } as React.CSSProperties;
  return (
    <article className="kraa-reading-canvas" style={style}>
      <div className="kraa-document-toolbar">
        <span>{[author, date].filter(Boolean).join(" · ")}</span>
        {actions}
      </div>
      {breadcrumb && <div className="kraa-breadcrumb">{breadcrumb}</div>}
      <h1>{title}</h1>
      {subtitle && <p className="kraa-subtitle">{subtitle}</p>}
      <div className="kraa-document-body">{children}</div>
    </article>
  );
}
