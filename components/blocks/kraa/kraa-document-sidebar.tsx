"use client";
import * as React from "react";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import { KraaDocumentListItem } from "@/components/ui/kraa/kraa-document-list-item";
import { KraaSearchInput } from "@/components/ui/kraa/kraa-search-input";
import { type DocumentItem, filterDocuments } from "@/lib/kraa/kraa-model";
export type KraaDocumentSidebarProps = {
  documents: DocumentItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew?: () => void;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsible?: boolean;
};
export function KraaDocumentSidebar({
  documents,
  selectedId,
  onSelect,
  onNew,
  title = "Documentos",
  open,
  onOpenChange,
  collapsible = true,
}: KraaDocumentSidebarProps) {
  const [localOpen, setLocalOpen] = React.useState(true),
    [query, setQuery] = React.useState("");
  const expanded = open ?? localOpen,
    id = React.useId();
  const shown = filterDocuments(documents, query);
  const setOpen = (v: boolean) => {
    if (open === undefined) setLocalOpen(v);
    onOpenChange?.(v);
  };
  return (
    <section className="kraa-sidebar" data-open={expanded || !collapsible} aria-label={title}>
      <div className="kraa-sidebar-head">
        {collapsible && (
          <KraaButton size="icon" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(!expanded)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="5" y="5" width="14" height="14" rx="2" />
              <path d="M10 5v14" />
            </svg>
            <span className="kraa-sr">{expanded ? "Contraer documentos" : "Expandir documentos"}</span>
          </KraaButton>
        )}
        <span className="kraa-sidebar-heading">{title}</span>
        <span className="kraa-sidebar-hint" aria-hidden="true">
          {expanded ? "Contraer" : "Abrir"}
        </span>
      </div>
      <div id={id} className="kraa-sidebar-content" inert={collapsible && !expanded ? true : undefined}>
        {onNew && (
          <KraaButton size="row" onClick={onNew}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 6v12M6 12h12" />
            </svg>
            Nuevo documento
          </KraaButton>
        )}
        <KraaSearchInput size="row" value={query} onValueChange={setQuery} />
        <nav className="kraa-document-list" aria-label="Lista de documentos">
          {shown.map((doc) => (
            <KraaDocumentListItem
              key={doc.id}
              document={doc}
              selected={selectedId === doc.id}
              onClick={() => onSelect(doc.id)}
            />
          ))}
        </nav>
        {shown.length === 0 && (
          <p className="kraa-empty" role="status">
            Sin documentos que coincidan.
          </p>
        )}
      </div>
    </section>
  );
}
