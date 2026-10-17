"use client";

import { useMemo, useState } from "react";
import { ReaFilterGroup } from "@/components/ui/rea/rea-filter-group";
import { ReaCodeBox, type ReaDetail, ReaDetailRows } from "@/components/ui/rea/rea-inspector";
import { ReaSectionHead } from "@/components/ui/rea/rea-note";
import { ReaSearchBox } from "@/components/ui/rea/rea-search-box";
import { ReaSpecimenList } from "@/components/ui/rea/rea-specimen-list";
import { matchesQuery, pad2 } from "@/lib/rea/rea-utils";

export type ReaCatalogEntry = {
  id: string;
  title: string;
  category: string;
  collection: string;
  /** Línea secundaria del índice, p. ej. "REA / COMPONENT · TSX CANDIDATE". */
  meta?: string;
  keywords?: string;
  details: ReaDetail[];
  code: string;
};

const ALL = "all";

/**
 * Catálogo completo del sitio: búsqueda sin tildes, filtro por tipo (chips), por colección
 * (subrayado, con conteos), índice de muestras e inspector con filas de detalle y código.
 * Si los filtros dejan el índice vacío, se dice; no se inventan resultados.
 */
export function ReaCatalog({
  entries,
  onCopyResult,
}: {
  entries: ReaCatalogEntry[];
  onCopyResult?: (ok: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [collection, setCollection] = useState(ALL);
  const [selected, setSelected] = useState(entries[0]?.id);

  const categories = useMemo(() => [...new Set(entries.map((e) => e.category))], [entries]);
  const collections = useMemo(() => [...new Set(entries.map((e) => e.collection))], [entries]);
  const visible = entries.filter(
    (e) =>
      (category === ALL || e.category === category) &&
      (collection === ALL || e.collection === collection) &&
      matchesQuery(query, e.title, e.meta, e.keywords),
  );
  // Si el filtro oculta la selección, el inspector pasa a la primera visible (o a ninguna).
  const current = visible.find((e) => e.id === selected) ?? visible[0];

  return (
    <div data-slot="rea-catalog" className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ReaSearchBox label="Buscar en la biblioteca" value={query} onValueChange={setQuery} shortcut="⌘ K" />
        <ReaFilterGroup
          label="Filtrar por tipo"
          value={category}
          onValueChange={setCategory}
          options={[{ value: ALL, label: "Todo" }, ...categories.map((c) => ({ value: c, label: c }))]}
        />
      </div>
      <ReaFilterGroup
        label="Colecciones"
        variant="underline"
        value={collection}
        onValueChange={setCollection}
        options={[
          { value: ALL, label: "Todas", count: entries.length },
          ...collections.map((c) => ({ value: c, label: c, count: entries.filter((e) => e.collection === c).length })),
        ]}
      />
      <ReaSectionHead
        title={`Index / ${pad2(entries.length)} entries`}
        aside={`${pad2(visible.length)} elementos visibles`}
      />
      <ReaSpecimenList
        items={visible.map((e) => ({ id: e.id, title: e.title, meta: e.meta }))}
        selectedId={current?.id}
        onSelect={setSelected}
        emptyText="No hay elementos en esta colección con los filtros actuales. Ningún componente adicional ha sido inventado."
      />
      {current && (
        <section aria-label={`${current.title}: detalles`} className="grid gap-5">
          <ReaSectionHead title="Component inspector" aside={current.title} />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
            <ReaDetailRows rows={current.details} label="Detalles" />
            <ReaCodeBox code={current.code} title="Code / registry" badge="Ejemplo" onCopyResult={onCopyResult} />
          </div>
        </section>
      )}
    </div>
  );
}
