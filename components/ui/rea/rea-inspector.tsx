"use client";

import { useState } from "react";

export type ReaDetail = { key: string; value: string };

/** Filas clave/valor del inspector, como lista de descripción. */
export function ReaDetailRows({ rows, label }: { rows: ReaDetail[]; label?: string }) {
  return (
    <dl className="rea-detail-rows" aria-label={label}>
      {rows.map((r) => (
        <div key={r.key} className="rea-detail-row">
          <dt>{r.key}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Bloque de código oscuro con botón de copiar. El resultado se informa con onCopyResult:
 * si el portapapeles falla (p. ej. sin HTTPS) se dice, no se da por copiado.
 */
export function ReaCodeBox({
  code,
  title = "Código",
  badge,
  copyLabel = "Copiar ejemplo",
  onCopyResult,
}: {
  code: string;
  title?: string;
  badge?: string;
  copyLabel?: string;
  onCopyResult?: (ok: boolean) => void;
}) {
  const [state, setState] = useState<"idle" | "ok" | "error">("idle");
  return (
    <div className="rea-codebox">
      <div className="rea-codebox-top">
        <span>{title}</span>
        {badge && <span>{badge}</span>}
      </div>
      <pre>{code}</pre>
      <button
        type="button"
        className="rea-copy"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setState("ok");
            onCopyResult?.(true);
          } catch {
            setState("error");
            onCopyResult?.(false);
          }
        }}
      >
        {state === "ok" ? "Copiado" : state === "error" ? "No se pudo copiar" : copyLabel}{" "}
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
