"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ReaCommand, ReaCommandPalette, useCommandShortcut } from "@/components/ui/rea/rea-command-palette";
import { ReaProvider } from "@/components/ui/rea/rea-theme";
import { COMPONENTS } from "@/lib/component-registry";

const PAGINAS: ReaCommand[] = [
  { id: "/componentes", label: "Introducción", hint: "Página" },
  { id: "/componentes/explorar", label: "Explorar", hint: "Página", keywords: "buscar filtrar filtros" },
];

const COMANDOS: ReaCommand[] = [
  ...PAGINAS,
  ...COMPONENTS.map((c) => ({
    id: `/componentes/${c.slug}`,
    label: c.name,
    hint: `${c.family} · ${c.category}`,
    keywords: `${c.slug} ${c.description}`,
  })),
];

/**
 * Salto rápido a cualquier página del banco con ⌘K / Ctrl+K, desde cualquier página. El botón hace lo mismo para
 * quien no usa el atajo (o en una pantalla táctil). La paleta es de REA y va dentro de su ReaProvider.
 */
export function ComponentPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useCommandShortcut(() => setOpen(true));

  return (
    <ReaProvider className="cb-palette">
      <button type="button" className="cb-palette-trigger" onClick={() => setOpen(true)}>
        <span>Buscar…</span>
        <kbd aria-hidden>⌘K</kbd>
      </button>
      <ReaCommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={COMANDOS}
        onSelect={(href) => router.push(href)}
        label="Ir a un componente"
        placeholder="Nombre, familia, tipo o descripción…"
        emptyText="Ningún componente coincide."
      />
    </ReaProvider>
  );
}
