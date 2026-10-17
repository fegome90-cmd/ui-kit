"use client";
import * as React from "react";
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
    <div className="kraa-member-row">
      <span className="kraa-avatar" aria-hidden="true">
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
      </span>
      <span className="kraa-member-name">
        {name}
        {meta && <small>{meta}</small>}
      </span>
      <span className="kraa-role">{role}</span>
      {trailing}
    </div>
  );
}
