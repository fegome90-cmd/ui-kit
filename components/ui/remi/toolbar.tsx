/* Barra de estado y píldora de herramientas sobre la tabla. */

const PATHS = {
  print: "M6 8V3h12v5M6 18H4V9h16v9h-2M6 14h12v7H6zM17 11h1",
  save: "M5 3h11l3 3v15H5zM8 3v6h8V3M8 20v-7h8v7",
  refresh: "M20 6v6h-6M4 18v-6h6M5.5 9a7.5 7.5 0 0 1 12.8-2L20 12M4 12l1.7 4a7.5 7.5 0 0 0 12.8-2",
} as const;

export type ToolKind = keyof typeof PATHS;

/** Píldora azul con botones de ícono (imprimir, guardar, actualizar). */
export function ToolPill({ tools }: { tools: { kind: ToolKind; label: string; onClick?: () => void }[] }) {
  return (
    <div className="tool-buttons" role="toolbar" aria-label="Herramientas">
      {tools.map((t) => (
        <button key={t.kind} type="button" title={t.label} aria-label={t.label} onClick={t.onClick}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={PATHS[t.kind]} />
          </svg>
        </button>
      ))}
    </div>
  );
}

/** Triángulo verde + texto de última actualización. */
export function UpdateStatus({ time, fallback = "Vista sintética lista" }: { time: string | null; fallback?: string }) {
  return (
    <span className="update-time">
      <span className="status-triangle" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 2 22.7 21.4H1.3Z" fill="#2dd02b" />
          <path d="M12 9v6m0 3v.3" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      </span>{" "}
      {time ? `Última actualización a las ${time} hrs` : fallback}
    </span>
  );
}
