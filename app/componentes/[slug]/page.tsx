import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeBlock, PreviewTabs } from "@/components/docs/doc-tabs";
import { Preview } from "@/components/docs/previews";
import { bySlug, COMPONENTS, PROVENANCE_LABELS, provenanceOf, statusOf } from "@/lib/component-registry";
import SOURCES from "@/lib/generated/sources.json";

type Props = { params: Promise<{ slug: string }> };

// Las páginas del registro se generan en el build; un slug desconocido da 404.
export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `${bySlug(slug)?.name ?? "Componente"} — UI Kit` };
}

// Con cacheComponents, leer params fuera de <Suspense> bloquea la navegación instantánea:
// la página entrega un contenedor vacío al instante y el contenido llega en streaming.
export default function ComponentPage({ params }: Props) {
  return (
    <Suspense fallback={<article className="cb-article" aria-busy="true" />}>
      <ComponentDocPage params={params} />
    </Suspense>
  );
}

async function ComponentDocPage({ params }: Props) {
  const { slug } = await params;
  const doc = bySlug(slug);
  if (!doc) notFound();

  // Código copiado del repo en cada build: siempre coincide con el que se importa.
  const all = SOURCES as Record<string, string>;
  const sources = doc.files.map((file) => ({ path: file, code: all[file] ?? `// ${file} no encontrado` }));

  const idx = COMPONENTS.findIndex((c) => c.slug === slug);
  const prev = COMPONENTS[idx - 1];
  const next = COMPONENTS[idx + 1];

  return (
    <article className="cb-article">
      <p className="cb-eyebrow">
        {doc.family} · {doc.category}
        {statusOf(doc) === "candidate" && <span className="cb-status">Candidato</span>}
      </p>
      <h1>{doc.name}</h1>
      <p className="cb-lead">{doc.description}</p>

      <PreviewTabs preview={<Preview slug={slug} />} sources={sources} />

      <h2 className="cb-h2">Instalación</h2>
      <CodeBlock title="bash" code={`npx shadcn@latest add @ui-kit/${doc.slug}`} />
      <p className="cb-lead">
        Requiere el registry <code>@ui-kit</code> en <code>components.json</code> (ver Introducción). Instala también el
        tema de la familia y las piezas de las que depende.
      </p>

      <h2 className="cb-h2">Uso</h2>
      <CodeBlock code={doc.usage} />

      <h2 className="cb-h2">Props</h2>
      <div className="cb-table-wrap">
        <table className="cb-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Tipo</th>
              <th>Por defecto</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {doc.props.map((p) => (
              <tr key={p.name}>
                <td>
                  <code>{p.name}</code>
                </td>
                <td>
                  <code className="cb-type">{p.type}</code>
                </td>
                <td>{p.default ? <code>{p.default}</code> : "—"}</td>
                <td>{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {doc.notes && (
        <>
          <h2 className="cb-h2">Notas</h2>
          <ul className="cb-list">
            {doc.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </>
      )}

      <h2 className="cb-h2">Archivos</h2>
      <p className="cb-lead">Procedencia: {PROVENANCE_LABELS[provenanceOf(doc)]}.</p>
      <ul className="cb-list">
        {doc.files.map((f) => (
          <li key={f}>
            <code>{f}</code>
          </li>
        ))}
      </ul>

      <nav className="cb-pager" aria-label="Navegación entre componentes">
        {prev ? <Link href={`/componentes/${prev.slug}`}>← {prev.name}</Link> : <span />}
        {next ? <Link href={`/componentes/${next.slug}`}>{next.name} →</Link> : <span />}
      </nav>
    </article>
  );
}
