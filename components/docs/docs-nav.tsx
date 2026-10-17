"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, COMPONENTS } from "@/lib/component-registry";

export function DocsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Componentes">
      <Link href="/componentes" className="cb-nav-link" aria-current={pathname === "/componentes" ? "page" : undefined}>
        Introducción
      </Link>
      {CATEGORIES.map((cat) => {
        const items = COMPONENTS.filter((c) => c.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="cb-nav-group">
            <h2>{cat}</h2>
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
    </nav>
  );
}
