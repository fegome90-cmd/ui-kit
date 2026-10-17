"use client";

import { useState } from "react";

export type ReaDetail = { key: string; value: string };

/** Filas clave/valor del inspector, como lista de descripción. */
export function ReaDetailRows({ rows, label }: { rows: ReaDetail[]; label?: string }) {
  return (
    <dl data-slot="rea-detail-rows" className="m-0 border-t border-rea-line" aria-label={label}>
      {rows.map((r) => (
        <div
          key={r.key}
          className="grid grid-cols-[minmax(90px,30%)_minmax(0,1fr)] gap-3 border-b border-rea-line px-1 py-4"
        >
          <dt className="font-rea-mono text-[0.7rem] font-medium text-rea-muted uppercase">{r.key}</dt>
          <dd className="m-0 text-[0.9rem] [overflow-wrap:anywhere]">{r.value}</dd>
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
    <div data-slot="rea-code-box" className="flex min-h-[268px] min-w-0 flex-col bg-rea-ink p-[22px] text-rea-bg">
      <div className="flex justify-between gap-3.5 font-rea-mono text-[0.67rem] font-medium uppercase">
        <span>{title}</span>
        {badge && <span>{badge}</span>}
      </div>
      <pre className="my-7 flex-1 font-rea-mono text-xs leading-[1.65] font-medium whitespace-pre-wrap [overflow-wrap:anywhere]">
        {code}
      </pre>
      <button
        type="button"
        className="self-start rounded-full border border-rea-bg bg-rea-bg px-[18px] py-3 font-rea-sans text-xs font-semibold text-rea-ink transition-colors hover:bg-transparent hover:text-rea-bg"
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
