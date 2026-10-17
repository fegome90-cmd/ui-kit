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
      className="rea-palette"
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
      <div className="rea-palette-head">
        <span aria-hidden="true">⌕</span>
        {/* type="text" y no "search": en Chrome el primer Escape de un campo search solo lo vacía,
            y la tecla visible promete cerrar. Además evita la × nativa duplicada. */}
        <input
          ref={inputRef}
          type="text"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar comandos"
          aria-controls={listId}
        />
        <span className="rea-keycap rea-note" aria-hidden="true">
          ESC
        </span>
      </div>
      <ul className="rea-palette-list" id={listId}>
        {shown.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSelect(c.id);
              }}
            >
              <span>{c.label}</span>
              {c.hint && <small>{c.hint}</small>}
            </button>
          </li>
        ))}
      </ul>
      {!shown.length && (
        <p className="rea-palette-empty rea-note" role="status">
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
