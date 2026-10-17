"use client";
import * as React from "react";
import { KraaAvatar } from "./kraa-avatar";

export type KraaMemberRoleRowProps = {
  name: string;
  role: string;
  avatarUrl?: string;
  meta?: string;
  trailing?: React.ReactNode;
};
export function KraaMemberRoleRow({ name, role, avatarUrl, meta, trailing }: KraaMemberRoleRowProps) {
  const [failedUrl, setFailedUrl] = React.useState<string>();
  return (
    <div
      data-slot="kraa-member-role-row"
      className="flex items-center gap-2.5 rounded-[8px] bg-kraa-surface-soft p-2 text-[13px]"
    >
      <KraaAvatar aria-hidden="true">
        {avatarUrl && failedUrl !== avatarUrl ? (
          // biome-ignore lint/performance/noImgElement: componente agnóstico del framework; next/image no aplica fuera de Next
          <img alt="" src={avatarUrl} onError={() => setFailedUrl(avatarUrl)} />
        ) : (
          name
            .trim()
            .split(/\s+/)
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
        )}
      </KraaAvatar>
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
        {name}
        {meta && <small className="block text-[11px] text-kraa-muted">{meta}</small>}
      </span>
      <span className="rounded-[6px] bg-kraa-surface-active px-2 py-[3px] text-[11px] text-kraa-muted">{role}</span>
      {trailing}
    </div>
  );
}
