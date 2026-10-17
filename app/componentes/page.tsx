import Link from "next/link";
import { CodeBlock } from "@/components/docs/doc-tabs";
import { Thumb } from "@/components/docs/previews";
import { CATEGORIES, COMPONENTS, FAMILIES, type Family } from "@/lib/component-registry";

const FAMILY_NOTES: Record<Family, string> = {
  REMI: "CSS plano extraído del monitor REMI, acotado bajo el contenedor .remi. Medidas a 1920×1080.",
  Ninja: "Estilo shadcn: Tailwind v4 + Radix + cva. Los tokens están en styles/ninja.css.",
  Kraa: "Tailwind + cva + cn() con tokens --kraa-* y Radix. Todo va dentro de KraaProvider (.kraa-theme).",
  REA: "Patrones de REA Atlas en React con Tailwind + cva + cn() y tokens --rea-*. Todo va dentro de ReaProvider (.rea-theme).",
};

export default function ComponentesIndex() {
  return (
    <article className="cb-article">
      <p className="cb-eyebrow">Banco de componentes</p>
      <h1>UI Kit</h1>
      <p className="cb-lead">
        Biblioteca personal de componentes de frontend. Igual que en shadcn, el código vive en el repo: se importa desde{" "}
        <code>components/ui</code> o se copia el archivo y se adapta.
      </p>

      <h2 className="cb-h2">Cómo usar</h2>
      <CodeBlock
        title="Importar"
        code={`import { Button } from "@/components/ui/ninja/button";\nimport { KraaProvider } from "@/components/ui/kraa/kraa-theme";\nimport { BlueButton } from "@/components/ui/remi/form-controls";`}
      />
      <ul className="cb-list">
        {FAMILIES.map((f) => (
          <li key={f}>
            <strong>{f}:</strong> {FAMILY_NOTES[f]}
          </li>
        ))}
        <li>
          Para agregar uno: créalo en <code>components/ui/&lt;familia&gt;</code>, regístralo en{" "}
          <code>lib/component-registry.ts</code> y agrega su vista previa y miniatura en{" "}
          <code>components/docs/previews.tsx</code>. Un test falla si falta alguna de las tres.
        </li>
      </ul>

      {FAMILIES.map((family) => (
        <section key={family}>
          <h2 className="cb-h2">{family}</h2>
          {CATEGORIES.map((cat) => {
            const items = COMPONENTS.filter((c) => c.family === family && c.category === cat);
            if (!items.length) return null;
            return (
              <section key={cat}>
                <h3 className="cb-h3">{cat}</h3>
                <div className="cb-grid">
                  {items.map((c) => (
                    <Link key={c.slug} href={`/componentes/${c.slug}`} className="cb-card">
                      <div className="cb-card-thumb">
                        <Thumb slug={c.slug} />
                      </div>
                      <div className="cb-card-body">
                        <strong>{c.name}</strong>
                        <span>{c.description}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </section>
      ))}
    </article>
  );
}
