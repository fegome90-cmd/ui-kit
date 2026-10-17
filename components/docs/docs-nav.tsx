"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, COMPONENTS, FAMILIES } from "@/lib/component-registry";

export function DocsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Componentes">
      <Link href="/componentes" className="cb-nav-link" aria-current={pathname === "/componentes" ? "page" : undefined}>
        Introducción
      </Link>
      {FAMILIES.map((family) => (
        <div key={family} className="cb-nav-group">
          <h2>{family}</h2>
          {CATEGORIES.flatMap((cat) =>
            COMPONENTS.filter((c) => c.family === family && c.category === cat).map((c) => {
              const href = `/componentes/${c.slug}`;
              return (
                <Link
                  key={c.slug}
                  href={href}
                  className="cb-nav-link"
                  aria-current={pathname === href ? "page" : undefined}
                >
                  {c.name}
                </Link>
              );
            }),
          )}
        </div>
      ))}
    </nav>
  );
}
