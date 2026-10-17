"use client";

import { type ReactNode, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="cb-copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        } catch {
          /* portapapeles bloqueado: no hacer nada */
        }
      }}
    >
      {done ? "Copiado" : "Copiar"}
    </button>
  );
}

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="cb-code">
      <div className="cb-code-head">
        <span>{title ?? "tsx"}</span>
        <CopyButton text={code} />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Pestañas Vista previa / Código, como en shadcn. */
export function PreviewTabs({ preview, sources }: { preview: ReactNode; sources: { path: string; code: string }[] }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [file, setFile] = useState(0);
  return (
    <div className="cb-tabs">
      <div className="cb-tablist" role="tablist" aria-label="Vista">
        <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}>
          Vista previa
        </button>
        <button type="button" role="tab" aria-selected={tab === "code"} onClick={() => setTab("code")}>
          Código
        </button>
      </div>
      {tab === "preview" ? (
        <div className="cb-preview" role="tabpanel">
          {preview}
        </div>
      ) : (
        <div role="tabpanel">
          {sources.length > 1 && (
            <div className="cb-files">
              {sources.map((s, i) => (
                <button key={s.path} type="button" aria-pressed={i === file} onClick={() => setFile(i)}>
                  {s.path.split("/").pop()}
                </button>
              ))}
            </div>
          )}
          <CodeBlock code={sources[file]?.code ?? ""} title={sources[file]?.path} />
        </div>
      )}
    </div>
  );
}
