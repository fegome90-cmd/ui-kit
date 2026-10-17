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
    <article
      data-slot="kraa-reading-canvas"
      className="mx-auto w-[min(calc(100%_-_40px),var(--kraa-doc-width,680px))] pt-6 pb-20 font-(family-name:--kraa-font-doc) [overflow-wrap:anywhere]"
      style={style}
    >
      <div className="mb-12 flex min-h-8 items-center justify-between gap-5 font-kraa-ui text-[11px] leading-normal text-kraa-muted max-[700px]:mb-6">
        <span>{[author, date].filter(Boolean).join(" · ")}</span>
        {actions}
      </div>
      {breadcrumb && <div className="mb-4 font-kraa-ui text-xs leading-normal text-kraa-muted">{breadcrumb}</div>}
      <h1 className="text-[44px] leading-[1.2667] max-[700px]:text-[34px]">{title}</h1>
      {subtitle && (
        <p className="!mt-2 !mb-8 text-[44px] leading-[1.2666667] text-kraa-subtitle max-[700px]:text-[26px]">
          {subtitle}
        </p>
      )}
      <div className="mt-8 text-(length:--kraa-doc-size,16px) leading-(--kraa-doc-leading,1.55) [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-kraa-border [&_blockquote]:pl-5 [&_blockquote]:text-kraa-muted [&_h2]:mt-[1.6em] [&_h2]:mb-[0.6em] [&_h2]:text-[1.5em] [&_img]:max-w-full [&_img]:rounded-[12px]">
        {children}
      </div>
    </article>
  );
}
