import { cn } from "@/lib/utils";

/* Barra de estado y píldora de herramientas sobre la tabla. En el monitor la píldora iba
   absoluta en la cabecera y el estado desplazado (-67px, -7px): eso es maquetación de la
   pantalla, no del componente. Aquí se ubican con className. */

const PATHS = {
  print: "M6 8V3h12v5M6 18H4V9h16v9h-2M6 14h12v7H6zM17 11h1",
  save: "M5 3h11l3 3v15H5zM8 3v6h8V3M8 20v-7h8v7",
  refresh: "M20 6v6h-6M4 18v-6h6M5.5 9a7.5 7.5 0 0 1 12.8-2L20 12M4 12l1.7 4a7.5 7.5 0 0 0 12.8-2",
} as const;

export type ToolKind = keyof typeof PATHS;

/** Píldora azul con botones de ícono (imprimir, guardar, actualizar). No se imprime. */
export function ToolPill({
  tools,
  className,
}: {
  tools: { kind: ToolKind; label: string; onClick?: () => void }[];
  className?: string;
}) {
  return (
    <div
      data-slot="tool-pill"
      className={cn(
        "flex min-w-[99px] justify-around gap-1.5 rounded-[20px] bg-remi-tool px-1.5 py-[3px] max-[460px]:gap-0.5 print:hidden",
        className,
      )}
      role="toolbar"
      aria-label="Herramientas"
    >
      {tools.map((t) => (
        <button
          key={t.kind}
          type="button"
          title={t.label}
          aria-label={t.label}
          onClick={t.onClick}
          className="grid size-[19px] place-items-center border-0 bg-transparent p-0 text-white hover:rounded-[4px] hover:bg-remi-tool-hover"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-[17px] fill-none stroke-current stroke-[2.3] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d={PATHS[t.kind]} />
          </svg>
        </button>
      ))}
    </div>
  );
}

/** Triángulo verde + texto de última actualización. */
export function UpdateStatus({
  time,
  fallback = "Vista sintética lista",
  className,
}: {
  time: string | null;
  fallback?: string;
  className?: string;
}) {
  return (
    <span
      data-slot="update-status"
      className={cn("text-[15px] max-[790px]:text-[12px] max-[460px]:text-[11px]", className)}
    >
      <span className="mr-[7px] inline-flex items-center align-[-3px] [&_svg]:block" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 2 22.7 21.4H1.3Z" fill="#2dd02b" />
          <path d="M12 9v6m0 3v.3" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      </span>{" "}
      {time ? `Última actualización a las ${time} hrs` : fallback}
    </span>
  );
}
