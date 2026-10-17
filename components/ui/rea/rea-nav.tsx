import { pad2 } from "@/lib/rea/rea-utils";

export type ReaNavItem = { href: string; label: string };

/**
 * Navegación numerada con etiqueta rodante: en hover o foco el texto sube y entra
 * una copia en color de acento. El número y la copia son decorativos (aria-hidden).
 */
export function ReaNav({
  items,
  current,
  label = "Navegación principal",
}: {
  items: ReaNavItem[];
  current?: string;
  label?: string;
}) {
  return (
    <nav className="rea-nav" aria-label={label}>
      <ul>
        {items.map((item, i) => (
          <li key={item.href}>
            <a href={item.href} aria-current={current === item.href ? "page" : undefined}>
              <span className="rea-note" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <span className="rea-nav-roll" data-label={item.label}>
                <span>{item.label}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
