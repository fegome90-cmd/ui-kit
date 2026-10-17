"use client";
import type * as React from "react";
import type { DocumentItem } from "@/lib/kraa/kraa-model";
import { cn } from "@/lib/utils";
import { KraaAvatar } from "./kraa-avatar";

export type KraaDocumentListItemProps = Omit<React.ComponentProps<"button">, "children"> & {
  document: DocumentItem;
  selected?: boolean;
};
const LINE = "overflow-hidden text-sm text-ellipsis whitespace-nowrap";
export function KraaDocumentListItem({ document, selected = false, className, ...props }: KraaDocumentListItemProps) {
  return (
    <button
      type="button"
      data-slot="kraa-document-list-item"
      className={cn(
        "flex w-full flex-col items-stretch gap-1 rounded-[16px] border border-transparent bg-kraa-surface-soft px-3.5 py-3 text-left text-kraa-muted transition-colors duration-150 hover:bg-kraa-surface-active hover:text-kraa-fg aria-[current=page]:bg-kraa-surface-active aria-[current=page]:text-kraa-fg",
        className,
      )}
      aria-current={selected ? "page" : undefined}
      {...props}
    >
      <span className={LINE}>
        {document.title}
        {/* aria-label en un span sin rol no se anuncia: el texto accesible va en sr-only. */}
        {document.favorite && (
          <>
            <span aria-hidden="true"> ☆</span>
            <span className="sr-only">Favorito</span>
          </>
        )}
      </span>
      {document.excerpt && <span className={cn(LINE, "text-kraa-muted")}>{document.excerpt}</span>}
      {(document.date || document.author) && (
        <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-kraa-subtle">
          {document.initials && (
            <KraaAvatar size="small" aria-hidden="true">
              {document.initials}
            </KraaAvatar>
          )}
          {[document.author, document.date].filter(Boolean).join(" · ")}
        </span>
      )}
    </button>
  );
}
