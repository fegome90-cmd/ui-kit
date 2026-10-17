"use client";
import * as React from "react";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import { KraaDocumentListItem } from "@/components/ui/kraa/kraa-document-list-item";
import { KraaSearchInput } from "@/components/ui/kraa/kraa-search-input";
import { type DocumentItem, filterDocuments } from "@/lib/kraa/kraa-model";
import { cn } from "@/lib/utils";

export type KraaDocumentSidebarProps = {
  documents: DocumentItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew?: () => void;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsible?: boolean;
  className?: string;
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
  className,
}: KraaDocumentSidebarProps) {
  const [localOpen, setLocalOpen] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const expanded = open ?? localOpen;
  const id = React.useId();
  const shown = filterDocuments(documents, query);
  const visible = expanded || !collapsible;
  const setOpen = (v: boolean) => {
    if (open === undefined) setLocalOpen(v);
    onOpenChange?.(v);
  };
  // Al plegar, el contenido se desvanece y recién después se oculta (visibility con retraso).
  // La duración (--d) la fija cada elemento con una clase estática.
  const fade = visible
    ? "visible opacity-100 [transition:opacity_var(--d),visibility_0s]"
    : "invisible pointer-events-none opacity-0 [transition:opacity_var(--d),visibility_0s_var(--d)]";
  return (
    <section
      data-slot="kraa-document-sidebar"
      data-open={visible}
      aria-label={title}
      className={cn(
        "relative w-(--kraa-sidebar-width) max-w-full bg-kraa-bg p-3 transition-opacity duration-200 data-[open=false]:w-14",
        className,
      )}
    >
      <div className="group/head relative flex h-10 items-center gap-2">
        {collapsible && (
          <KraaButton
            size="icon"
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => setOpen(!expanded)}
            className="[&>svg]:size-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="5" y="5" width="14" height="14" rx="2" />
              <path d="M10 5v14" />
            </svg>
            <span className="sr-only">{expanded ? "Contraer documentos" : "Expandir documentos"}</span>
          </KraaButton>
        )}
        <span className={cn("text-[13px] whitespace-nowrap text-kraa-muted [--d:250ms]", fade)}>{title}</span>
        <span
          className="pointer-events-none absolute top-1/2 left-9 -translate-y-1/2 rounded-[6px] bg-kraa-bg px-2 py-1 text-[11px] whitespace-nowrap opacity-0 transition-opacity duration-150 ease-in-out group-has-[button:hover]/head:opacity-100 group-has-[button:hover]/head:delay-1000"
          aria-hidden="true"
        >
          {expanded ? "Contraer" : "Abrir"}
        </span>
      </div>
      <div
        id={id}
        className={cn("flex flex-col gap-2 [--d:150ms]", fade)}
        inert={collapsible && !expanded ? true : undefined}
      >
        {onNew && (
          <KraaButton size="row" onClick={onNew}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 6v12M6 12h12" />
            </svg>
            Nuevo documento
          </KraaButton>
        )}
        <KraaSearchInput size="row" value={query} onValueChange={setQuery} />
        <nav className="flex flex-col gap-2" aria-label="Lista de documentos">
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
          <p className="p-4 text-[13px] text-kraa-muted" role="status">
            Sin documentos que coincidan.
          </p>
        )}
      </div>
    </section>
  );
}
