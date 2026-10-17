import { pad2 } from "@/lib/rea/rea-utils";

export type ReaNavItem = { href: string; label: string };

/**
 * Navegación numerada con etiqueta rodante: en hover o foco el texto sube y entra
 * una copia en color de acento. El número y la copia son decorativos: la copia usa
 * texto alternativo vacío en `content` para que el lector no la lea dos veces.
 */
function ReaNav({
  items,
  current,
  label = "Navegación principal",
  className,
}: {
  items: ReaNavItem[];
  current?: string;
  label?: string;
  className?: string;
}) {
  return (
    <nav data-slot="rea-nav" aria-label={label} className={className}>
      <ul className="m-0 flex list-none gap-[clamp(16px,2.4vw,40px)] p-0">
        {items.map((item, i) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={current === item.href ? "page" : undefined}
              className="group inline-flex items-baseline gap-[7px] text-[0.95rem]"
            >
              <span className="font-rea-mono text-[0.6rem] font-medium text-rea-muted uppercase" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <span
                data-label={item.label}
                className="relative inline-flex h-[1.4em] overflow-hidden after:absolute after:top-full after:left-0 after:text-rea-accent-text after:transition-transform after:duration-400 after:ease-rea-in-out after:content-[attr(data-label)_/_''] group-hover:after:-translate-y-full group-focus-visible:after:-translate-y-full"
              >
                <span className="block transition-transform duration-400 ease-rea-in-out group-hover:-translate-y-full group-focus-visible:-translate-y-full group-aria-[current=page]:text-rea-accent-text">
                  {item.label}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { ReaNav };
