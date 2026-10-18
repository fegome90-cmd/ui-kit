"use client";

import { useState } from "react";
import { ComponentCard } from "@/components/docs/component-card";
import { COMPONENTS, FAMILIES, type Family, GROUPS } from "@/lib/component-registry";

/** Índice del banco agrupado por grupo y tipo de componente; la familia es una etiqueta y un filtro. */
export function ComponentIndex() {
  const [family, setFamily] = useState<Family | null>(null);
  const visible = COMPONENTS.filter((c) => family === null || c.family === family);

  return (
    <>
      <fieldset className="cb-filter">
        <legend>Familia</legend>
        <button type="button" aria-pressed={family === null} onClick={() => setFamily(null)}>
          Todas
        </button>
        {FAMILIES.map((f) => (
          <button key={f} type="button" aria-pressed={family === f} onClick={() => setFamily(f)}>
            {f}
          </button>
        ))}
      </fieldset>

      {GROUPS.map((g) => {
        const enGrupo = visible.filter((c) => (g.categories as readonly string[]).includes(c.category));
        if (!enGrupo.length) return null;
        return (
          <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
            <h2 id={`grupo-${g.id}`} className="cb-h2">
              {g.name}
            </h2>
            {g.categories.map((cat) => {
              const items = enGrupo.filter((c) => c.category === cat);
              if (!items.length) return null;
              return (
                <section key={cat}>
                  {g.categories.length > 1 && <h3 className="cb-h3">{cat}</h3>}
                  <div className="cb-grid">
                    {items.map((c) => (
                      <ComponentCard key={c.slug} c={c} />
                    ))}
                  </div>
                </section>
              );
            })}
          </section>
        );
      })}
    </>
  );
}
