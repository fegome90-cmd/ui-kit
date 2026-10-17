"use client";

import { useEffect, useId, useRef, useState } from "react";
import { matchesQuery } from "@/lib/rea/rea-utils";

export type ReaCommand = { id: string; label: string; hint?: string; keywords?: string };

/**
 * Paleta de comandos sobre <dialog> nativo: el navegador atrapa el foco, cierra con Escape
 * y devuelve el foco al disparador. Clic en el fondo también cierra.
 */
export function ReaCommandPalette({
  open,
  onOpenChange,
  commands,
  onSelect,
  label = "Comandos y navegación",
  placeholder = "Buscar una acción, componente o colección…",
  emptyText = "No hay comandos que coincidan.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: ReaCommand[];
  onSelect: (id: string) => void;
  label?: string;
  placeholder?: string;
  emptyText?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const listId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setQuery("");
      d.showModal();
      inputRef.current?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  const shown = commands.filter((c) => matchesQuery(query, c.label, c.hint, c.keywords));
  return (
    <dialog
      ref={ref}
      data-slot="rea-command-palette"
      className="fixed inset-x-0 top-[min(16vh,140px)] mx-auto my-0 max-h-[76vh] w-[min(92vw,610px)] border border-rea-line-strong bg-rea-bg p-0 text-rea-ink shadow-[0_25px_110px_rgb(0_0_0/0.3)] backdrop:bg-black/48 backdrop:backdrop-blur-[3px]"
      aria-label={label}
      onClose={() => onOpenChange(false)}
      onClick={(e) => {
        // El clic sobre el propio <dialog> (no sobre su contenido) es el fondo.
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-rea-line px-5 py-4">
        <span aria-hidden="true">⌕</span>
        {/* type="text" y no "search": en Chrome el primer Escape de un campo search solo lo vacía,
            y la tecla visible promete cerrar. Además evita la × nativa duplicada. */}
        <input
          ref={inputRef}
          type="text"
          enterKeyHint="search"
          className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none focus-visible:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar comandos"
          aria-controls={listId}
        />
        <span
          className="border border-rea-line px-1.5 py-[3px] font-rea-mono text-[0.66rem] font-medium text-rea-muted"
          aria-hidden="true"
        >
          ESC
        </span>
      </div>
      <ul className="m-0 max-h-[60vh] list-none overflow-auto py-2" id={listId}>
        {shown.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-5 py-3.5 text-left hover:bg-rea-bg-raised focus-visible:bg-rea-bg-raised"
              onClick={() => {
                onOpenChange(false);
                onSelect(c.id);
              }}
            >
              <span className="text-[0.91rem]">{c.label}</span>
              {c.hint && (
                <small className="font-rea-mono text-[0.7rem] font-medium text-rea-muted uppercase">{c.hint}</small>
              )}
            </button>
          </li>
        ))}
      </ul>
      {!shown.length && (
        <p className="m-0 p-5 font-rea-mono text-[0.72rem] font-medium text-rea-muted uppercase" role="status">
          {emptyText}
        </p>
      )}
    </dialog>
  );
}

/** Registra ⌘K / Ctrl+K en el documento. Quien lo usa decide qué hace (normalmente abrir la paleta). */
export function useCommandShortcut(handler: () => void, enabled = true) {
  const saved = useRef(handler);
  saved.current = handler;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        saved.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enabled]);
}
