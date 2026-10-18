import Link from "next/link";
import { ComponentCard } from "@/components/docs/component-card";
import { CodeBlock } from "@/components/docs/doc-tabs";
import { Thumb } from "@/components/docs/previews";
import { BentoGrid, BentoItem } from "@/components/ui/lab/bento-grid";
import { FeatureTabs } from "@/components/ui/lab/feature-tabs";
import { FilteredStat } from "@/components/ui/lab/filtered-stat";
import { LabMarquee } from "@/components/ui/lab/lab-marquee";
import { LabScope } from "@/components/ui/lab/lab-palette";
import { ProcessSteps } from "@/components/ui/lab/process-steps";
import { StatRing } from "@/components/ui/lab/stat-ring";
import { Button } from "@/components/ui/ninja/button";
import { CATEGORIES, COMPONENTS, FAMILIES, type Family, GROUPS, statusOf } from "@/lib/component-registry";

const FAMILY_NOTES: Record<Family, string> = {
  REMI: "Componentes genéricos del monitor clínico REMI: Tailwind + cn() con la paleta --color-remi-*, medidas a 1920×1080.",
  Ninja: "El tema base, al estilo shadcn: Tailwind v4 + Radix + cva, con tokens globales en styles/ninja.css.",
  Kraa: "Documentos y tipografía: Tailwind + cva + cn() con tokens --kraa-* y Radix, dentro de KraaProvider.",
  REA: "Patrones de REA Atlas: catálogo, búsqueda, paleta ⌘K y movimiento, con tokens --rea-* dentro de ReaProvider.",
  Lab: "Investigación de señales, magnitudes y revelación, con tokens neutros --lab-* para comparar mecanismos.",
};

// Tamaños del bento: dos filas 2/5 + 3/5 que se alternan y la última familia a lo ancho.
const BENTO: ("sm" | "lg" | "full")[] = ["sm", "lg", "lg", "sm", "full"];

const deFamilia = (f: Family) => COMPONENTS.filter((c) => c.family === f);
const estables = COMPONENTS.filter((c) => statusOf(c) === "stable");
const pct = (parte: number, total: number) => (total ? Math.round((parte / total) * 100) : 0);

// Muestra: el primer componente de cada categoría (sin los temas, que no se ven como componente).
const MUESTRA = CATEGORIES.filter((cat) => cat !== "Tema").flatMap((cat) => {
  const c = COMPONENTS.find((x) => x.category === cat);
  return c ? [c] : [];
});

export default function ComponentesIndex() {
  return (
    <article className="cb-article cb-article-wide cb-home">
      <header className="cb-home-hero">
        <p className="cb-eyebrow">Banco de componentes</p>
        <h1>UI Kit</h1>
        <p className="cb-lead">
          {COMPONENTS.length} componentes de frontend de cinco familias, cada una con su propio sistema de estilos. Como
          en shadcn, el código vive en el repo: se instala con el CLI, se importa o se copia y se adapta.
        </p>
        <div className="cb-home-actions">
          <Button asChild>
            <Link href="/componentes/explorar">Explorar componentes</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="#como-usar">Cómo usar</a>
          </Button>
          <span className="cb-home-hint">
            o <kbd>⌘K</kbd> para saltar a uno
          </span>
        </div>
      </header>

      <LabScope className="cb-home-stats">
        <div className="cb-home-rings">
          <StatRing value={String(COMPONENTS.length)} caption="componentes" tone="accent" />
          <StatRing value={String(FAMILIES.length)} caption="familias" />
          <StatRing value={String(GROUPS.length)} caption="grupos de tipos" />
        </div>
        <FilteredStat
          className="cb-home-maturity"
          title="Componentes estables"
          label="Familia"
          unit="%"
          reference="todas"
          segments={[
            {
              id: "todas",
              label: "Todas",
              value: pct(estables.length, COMPONENTS.length),
              detail: `${estables.length} de ${COMPONENTS.length}; el resto son candidatos con QA pendiente.`,
            },
            ...FAMILIES.map((f) => {
              const todos = deFamilia(f);
              const ok = todos.filter((c) => statusOf(c) === "stable").length;
              return { id: f, label: f, value: pct(ok, todos.length), detail: `${ok} de ${todos.length}` };
            }),
          ]}
        />
      </LabScope>

      <h2 className="cb-h2">Familias</h2>
      <LabScope>
        <BentoGrid>
          {FAMILIES.map((f, i) => {
            const todos = deFamilia(f);
            const vista = todos.filter((c) => c.category !== "Tema").slice(0, 3);
            return (
              <BentoItem key={f} size={BENTO[i] ?? "full"} className="cb-home-family min-h-0 min-[760px]:min-h-0">
                <h3>{f}</h3>
                <p>{FAMILY_NOTES[f]}</p>
                <div className="cb-home-thumbs" aria-hidden>
                  {vista.map((c) => (
                    <div key={c.slug} className="cb-card-thumb">
                      <Thumb slug={c.slug} />
                    </div>
                  ))}
                </div>
                <Link href={`/componentes/explorar?familia=${f}`} className="cb-home-more">
                  Ver los {todos.length} componentes de {f}
                </Link>
              </BentoItem>
            );
          })}
        </BentoGrid>
      </LabScope>

      <h2 className="cb-h2">Una muestra</h2>
      <LabScope>
        <LabMarquee label="Un componente de cada tipo" duration={60}>
          {MUESTRA.map((c) => (
            <div key={c.slug} className="cb-home-sample">
              <ComponentCard c={c} />
            </div>
          ))}
        </LabMarquee>
      </LabScope>

      <h2 className="cb-h2">Por tipo</h2>
      <ul className="cb-home-groups">
        {GROUPS.map((g) => {
          const n = COMPONENTS.filter((c) => (g.categories as readonly string[]).includes(c.category)).length;
          return (
            <li key={g.id}>
              <Link href={`/componentes/explorar?grupo=${g.id}`}>
                <strong>{g.name}</strong>
                <span>{g.categories.join(", ")}</span>
                <em>{n} componentes</em>
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="cb-h2" id="como-usar">
        Cómo usar
      </h2>
      <LabScope>
        <FeatureTabs
          label="Cómo usar el banco"
          items={[
            {
              id: "instalar",
              title: "Instalar en otro proyecto",
              description: "Cada componente es un item del registry de shadcn, servido en /r/<nombre>.json.",
              panel: (
                <div className="cb-home-panel">
                  <CodeBlock
                    title="components.json"
                    code={`{\n  "registries": {\n    "@ui-kit": "http://localhost:3000/r/{name}.json"\n  }\n}`}
                  />
                  <CodeBlock title="bash" code="npx shadcn@latest add @ui-kit/rea-catalog" />
                  <p>
                    El CLI instala también el tema de la familia (<code>styles/&lt;familia&gt;.css</code>) y muestra la
                    línea de <code>@import</code> para tu CSS global.
                  </p>
                </div>
              ),
            },
            {
              id: "importar",
              title: "Importar en este repo",
              description: "Se importa desde components/ui; cada familia va dentro de su contenedor.",
              panel: (
                <div className="cb-home-panel">
                  <CodeBlock
                    title="Importar"
                    code={`import { Button } from "@/components/ui/ninja/button";\nimport { KraaProvider } from "@/components/ui/kraa/kraa-theme";\nimport { BlueButton } from "@/components/ui/remi/form-controls";`}
                  />
                  <p>
                    REMI va bajo <code>.remi</code>, Kraa dentro de <code>KraaProvider</code>, REA dentro de{" "}
                    <code>ReaProvider</code> y Lab bajo <code>.lab</code>. Ninja es el tema base y no necesita
                    contenedor.
                  </p>
                </div>
              ),
            },
            {
              id: "agregar",
              title: "Agregar un componente",
              description: "Tres piezas; si falta alguna, un test falla.",
              panel: (
                <div className="cb-home-panel">
                  {/* ProcessSteps usa la tinta de Lab, pensada sobre fondo claro: va en una superficie propia. */}
                  <LabScope surface className="cb-home-steps">
                    <ProcessSteps
                      variant="timeline"
                      steps={[
                        {
                          title: "Crearlo",
                          description: "En components/ui/ o components/blocks/, en la carpeta de su familia.",
                        },
                        { title: "Registrarlo", description: "Una entrada en lib/component-registry.ts." },
                        {
                          title: "Mostrarlo",
                          description:
                            "Vista previa y miniatura en components/docs/ (REA y Lab tienen archivo propio).",
                        },
                      ]}
                    />
                  </LabScope>
                </div>
              ),
            },
          ]}
        />
      </LabScope>
    </article>
  );
}
