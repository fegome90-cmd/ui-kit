"use client";
import type * as React from "react";
import type { DocumentItem } from "@/lib/kraa/kraa-model";
import { cx } from "@/lib/kraa/kraa-utils";
export type KraaDocumentListItemProps = Omit<React.ComponentProps<"button">, "children"> & {
  document: DocumentItem;
  selected?: boolean;
};
export function KraaDocumentListItem({ document, selected = false, className, ...props }: KraaDocumentListItemProps) {
  return (
    <button
      type="button"
      className={cx("kraa-document-item", className)}
      aria-current={selected ? "page" : undefined}
      {...props}
    >
      <span className="kraa-document-title">
        {document.title}
        {/* aria-label en un span sin rol no se anuncia: el texto accesible va en .kraa-sr. */}
        {document.favorite && (
          <>
            <span aria-hidden="true"> ☆</span>
            <span className="kraa-sr">Favorito</span>
          </>
        )}
      </span>
      {document.excerpt && <span className="kraa-document-excerpt">{document.excerpt}</span>}
      {(document.date || document.author) && (
        <span className="kraa-document-meta">
          {document.initials && (
            <span className="kraa-avatar small" aria-hidden="true">
              {document.initials}
            </span>
          )}
          {[document.author, document.date].filter(Boolean).join(" · ")}
        </span>
      )}
    </button>
  );
}
