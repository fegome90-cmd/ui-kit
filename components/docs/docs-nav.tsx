"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { bySlug, COMPONENTS, GROUPS, groupOf } from "@/lib/component-registry";

// Dos niveles: grupo (plegable, con conteo) y categoría. En desktop se abre solo el grupo del componente que se
// está viendo. En pantallas angostas la barra va arriba del contenido, así que todos empiezan cerrados: un grupo
// abierto empujaría el componente una pantalla hacia abajo.
const DESKTOP = "(min-width: 861px)";
export function DocsNav() {
  const pathname = usePathname();
  const actual = bySlug(pathname.split("/")[2] ?? "");
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    setDesktop(mq.matches);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const grupoActual = desktop && actual ? groupOf(actual.category).id : null;

  return (
    <nav aria-label="Componentes">
      <Link href="/componentes" className="cb-nav-link" aria-current={pathname === "/componentes" ? "page" : undefined}>
        Introducción
      </Link>
      <Link
        href="/componentes/explorar"
        className="cb-nav-link"
        aria-current={pathname === "/componentes/explorar" ? "page" : undefined}
      >
        Explorar
      </Link>
      {GROUPS.map((g) => {
        const enGrupo = COMPONENTS.filter((c) => (g.categories as readonly string[]).includes(c.category));
        if (!enGrupo.length) return null;
        return (
          <details key={g.id} className="cb-nav-group" open={g.id === grupoActual || undefined}>
            <summary>
              {g.name} <span className="cb-nav-count">{enGrupo.length}</span>
            </summary>
            {g.categories.map((cat) => {
              const items = enGrupo.filter((c) => c.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="cb-nav-category">
                  {g.categories.length > 1 && <h3>{cat}</h3>}
                  {items.map((c) => {
                    const href = `/componentes/${c.slug}`;
                    return (
                      <Link
                        key={c.slug}
                        href={href}
                        className="cb-nav-link"
                        aria-current={pathname === href ? "page" : undefined}
                      >
                        {c.name} <span className="cb-nav-family">{c.family}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </details>
        );
      })}
    </nav>
  );
}
