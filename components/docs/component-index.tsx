"use client";

import Link from "next/link";
import { useState } from "react";
import { Thumb } from "@/components/docs/previews";
import { CATEGORIES, COMPONENTS, FAMILIES, type Family, statusOf } from "@/lib/component-registry";

/** Índice del banco agrupado por tipo de componente; la familia es una etiqueta y un filtro. */
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

      {CATEGORIES.map((cat) => {
        const items = visible.filter((c) => c.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat}>
            <h2 className="cb-h2">{cat}</h2>
            <div className="cb-grid">
              {items.map((c) => (
                <Link key={c.slug} href={`/componentes/${c.slug}`} className="cb-card" data-family={c.family}>
                  <div className="cb-card-thumb">
                    <Thumb slug={c.slug} />
                  </div>
                  <div className="cb-card-body">
                    <strong>{c.name}</strong>
                    <span>{c.description}</span>
                    <em className="cb-tag">
                      {c.family}
                      {statusOf(c) === "candidate" && " · candidato"}
                    </em>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
