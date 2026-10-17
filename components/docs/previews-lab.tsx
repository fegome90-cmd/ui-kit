"use client";

import { CircleCheck, TriangleAlert } from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/lab/bento-grid";
import { CategoryWheel } from "@/components/ui/lab/category-wheel";
import { ChapterCard } from "@/components/ui/lab/chapter-card";
import { DistributionChart } from "@/components/ui/lab/distribution-chart";
import { DivergingHeatmap } from "@/components/ui/lab/diverging-heatmap";
import { DotNav } from "@/components/ui/lab/dot-nav";
import { EncodingCompare } from "@/components/ui/lab/encoding-compare";
import { FeatureTabs } from "@/components/ui/lab/feature-tabs";
import { FilteredStat } from "@/components/ui/lab/filtered-stat";
import { HierarchyCells } from "@/components/ui/lab/hierarchy-cells";
import { LabBackdrop, PATTERNS } from "@/components/ui/lab/lab-backdrop";
import { LabGlowCard } from "@/components/ui/lab/lab-glow-card";
import { LabGradientText } from "@/components/ui/lab/lab-gradient-text";
import { LabMarquee } from "@/components/ui/lab/lab-marquee";
import { LabPalette, LabScope } from "@/components/ui/lab/lab-palette";
import { LabRevealCard } from "@/components/ui/lab/lab-reveal-card";
import { LabCount, LabLozenge } from "@/components/ui/lab/lozenge";
import { LabNotification } from "@/components/ui/lab/notification";
import { PresenceDot } from "@/components/ui/lab/presence-dot";
import { ProcessSteps } from "@/components/ui/lab/process-steps";
import { ProportionSplit } from "@/components/ui/lab/proportion-split";
import { RadialBars } from "@/components/ui/lab/radial-bars";
import { RangeBars } from "@/components/ui/lab/range-bars";
import { ScrollySection } from "@/components/ui/lab/scrolly-section";
import { SeriesChart } from "@/components/ui/lab/series-chart";
import { SignalDisclosure } from "@/components/ui/lab/signal-disclosure";
import { StatRing } from "@/components/ui/lab/stat-ring";
import { TimeScale } from "@/components/ui/lab/time-scale";
import { PALETAS, PALETAS_LAB, type PaletaLab } from "@/lib/lab/paletas";
import { cn } from "@/lib/utils";

// Datos ficticios: ilustran el mecanismo, no son datos clínicos.
const TURNOS = [
  { label: "Mañana", value: 12 },
  { label: "Tarde", value: 9 },
  { label: "Noche", value: 4 },
];

const fila = "flex flex-wrap items-end gap-[32px]";

/** Una variante con su nombre debajo, para que la vista previa se lea sin abrir el código. */
function Muestra({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-[10px]">
      <span className="flex h-[24px] items-center">{children}</span>
      <code className="text-[12px] text-lab-muted">{texto}</code>
    </div>
  );
}

const ETAPAS = [
  { title: "Ingreso", description: "Triage y registro (ficticio)." },
  { title: "Evaluación", description: "Exámenes y diagnóstico." },
  { title: "Tratamiento", description: "Indicaciones y controles." },
  { title: "Alta", description: "Epicrisis y seguimiento." },
];

// Series ficticias: riesgo relativo por edad. Dos destacadas y seis de contexto.
const EDADES = [40, 50, 60, 70, 80];
const SERIES = [
  { id: "cv", label: "Cardiovascular", values: [2, 5, 11, 22, 38] },
  { id: "dm", label: "Diabetes", values: [3, 6, 10, 15, 19] },
  ...[1, 2, 3, 4, 5, 6].map((k) => ({
    id: `c${k}`,
    label: `Contexto ${k}`,
    values: EDADES.map((e, i) => Math.round((k * 1.3 + 1) * (1 + i * 0.6) + ((e * k) % 7))),
  })),
];

const DISTRIBUCION: [number, number][] = [
  [60, 1],
  [65, 3],
  [70, 7],
  [75, 14],
  [80, 24],
  [85, 31],
  [90, 22],
  [95, 9],
  [100, 2],
];

function NotificationPreview() {
  const [abiertas, setAbiertas] = useState({ inline: true, toast: true, accion: true });
  const [log, setLog] = useState("");
  const cerrar = (k: keyof typeof abiertas) => () => setAbiertas((a) => ({ ...a, [k]: false }));
  return (
    <div className="grid w-full max-w-[560px] gap-[10px]">
      {(["info", "success", "warning", "danger"] as const).map((st) => (
        <LabNotification
          key={st}
          status={st}
          title={
            {
              info: "Turno actualizado",
              success: "Indicación guardada",
              warning: "Turno sin cubrir",
              danger: "No se pudo guardar",
            }[st]
          }
        >
          {
            {
              info: "Hay 2 ingresos nuevos.",
              success: "Quedó en la ficha del paciente.",
              warning: "Falta asignar la cama 12.",
              danger: "Revisá la conexión y reintentá.",
            }[st]
          }
        </LabNotification>
      ))}
      {abiertas.inline && (
        <LabNotification status="warning" title="Inline cerrable" onClose={cerrar("inline")}>
          Persiste hasta que la cerrás.
        </LabNotification>
      )}
      {abiertas.accion && (
        <LabNotification
          variant="actionable"
          status="danger"
          title="Sincronización detenida"
          action={{ label: "Reintentar", onClick: () => setLog("Acción: Reintentar") }}
          onClose={cerrar("accion")}
        >
          Una sola acción; toma el foco al aparecer.
        </LabNotification>
      )}
      {abiertas.toast && (
        <LabNotification
          variant="toast"
          status="success"
          title="Toast"
          timestamp="Hoy, 14:32"
          onClose={cerrar("toast")}
        >
          Flotante y breve.
        </LabNotification>
      )}
      <LabNotification variant="callout" status="warning" title="Callout">
        Llega con la página y no se cierra.
      </LabNotification>
      <button
        type="button"
        className="justify-self-start rounded-full border border-lab-line px-[12px] py-[4px] text-[13px]"
        onClick={() => {
          setAbiertas({ inline: true, toast: true, accion: true });
          setLog("");
        }}
      >
        Restablecer
      </button>
      {log && <p className="m-0 text-[13px] text-lab-muted">{log}</p>}
    </div>
  );
}

/** Ilustración propia y colorida para que se note el paso de grises a color. */
function Ilustracion() {
  return (
    // slice = object-fit: cover para un SVG en línea (object-fit no se aplica a <svg>).
    <svg aria-hidden viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice" className="block h-[120px] w-full">
      <rect width="240" height="120" fill="#e6503c" />
      <circle cx="70" cy="70" r="38" fill="#f5c518" />
      <rect x="120" y="30" width="90" height="70" rx="6" fill="#006a5d" />
      <circle cx="190" cy="40" r="16" fill="#a5104f" />
    </svg>
  );
}

function PalettePreview() {
  const [palette, setPalette] = useState<PaletaLab>("bioage");
  return (
    <div className="grid w-full gap-[14px]">
      {/* biome-ignore lint/a11y/useSemanticElements: grupo de botones conmutables. */}
      <div role="group" aria-label="Paleta" className="flex flex-wrap gap-[6px]">
        {PALETAS_LAB.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={palette === p}
            onClick={() => setPalette(p)}
            className="rounded-full border border-lab-line px-[12px] py-[4px] text-[13px] aria-pressed:bg-lab-ink aria-pressed:text-lab-on-ink"
          >
            {PALETAS[p].nombre}
          </button>
        ))}
      </div>
      <LabScope palette={palette} surface className="grid gap-[16px] rounded-[12px] p-[20px]">
        <div className="flex flex-wrap items-center gap-[24px]">
          <StatRing size="sm" tone="accent" value="2B" caption="Cifra en anillo" />
          <PresenceDot label="Presencia" rings={2} />
          <p className="m-0 text-[28px] font-bold">
            <LabGradientText>Mismo componente</LabGradientText>
          </p>
        </div>
        <LabPalette palette={palette} />
      </LabScope>
    </div>
  );
}

export const LAB_PREVIEWS: Record<string, () => ReactNode> = {
  "lab-presence-dot": () => (
    <div className="grid gap-[24px]">
      <div className={fila}>
        <Muestra texto="sm">
          <PresenceDot label="Presencia, pequeño" size="sm" />
        </Muestra>
        <Muestra texto="md">
          <PresenceDot label="Presencia" />
        </Muestra>
        <Muestra texto="lg">
          <PresenceDot label="Presencia, grande" size="lg" />
        </Muestra>
        <Muestra texto="muted">
          <PresenceDot label="Presencia atenuada" tone="muted" />
        </Muestra>
      </div>
      <div className={fila}>
        <Muestra texto="rings={1}">
          <PresenceDot label="Con un anillo" rings={1} />
        </Muestra>
        <Muestra texto="rings={2}">
          <PresenceDot label="Con dos anillos" rings={2} />
        </Muestra>
        <Muestra texto="pulse">
          <PresenceDot label="Con pulso" pulse />
        </Muestra>
      </div>
      <p className="m-0 text-[13px] text-lab-muted">El pulso solo corre si el sistema no pide movimiento reducido.</p>
    </div>
  ),
  "lab-stat-ring": () => (
    <div className="flex flex-wrap items-start gap-[32px]">
      <StatRing size="sm" value="988 M" caption="Personas con obesidad (ficticio)" />
      <StatRing value="2B" caption="Personas con enfermedad cardiometabólica (ficticio)" />
      <StatRing size="lg" tone="accent" value="1 284" caption="Controles registrados este mes (ficticio)" />
    </div>
  ),
  "lab-encoding-compare": () => (
    <div className="grid w-full max-w-[420px] gap-[16px]">
      <EncodingCompare title="Pacientes por turno (ficticio)" data={TURNOS} />
      <EncodingCompare title="Mismo dato, como arco (animate)" data={TURNOS} defaultEncoding="arc" animate />
    </div>
  ),
  "lab-signal-disclosure": () => (
    <div className="grid w-full max-w-[460px] gap-[10px]">
      <SignalDisclosure title="Indicaciones nuevas" summary="2 desde el último turno (ficticio)">
        Ajuste de dosis de las 14:00 y control de glicemia cada 6 h.
      </SignalDisclosure>
      <SignalDisclosure title="Abierto por defecto" defaultOpen signal={<PresenceDot label="Nuevo" rings={1} />}>
        El detalle sigue en el DOM cuando está cerrado: queda inert y con visibility: hidden.
      </SignalDisclosure>
    </div>
  ),
  "lab-backdrop": () => (
    <div className="grid w-full gap-[12px] min-[640px]:grid-cols-2">
      {PATTERNS.map((pattern) => (
        <LabBackdrop key={pattern} pattern={pattern} tone="deep" className="min-h-[150px] rounded-[12px] p-[20px]">
          <p className="m-0 text-[13px] opacity-80">pattern="{pattern}" · deep</p>
          <p className="m-0 mt-[4px] text-[20px] font-semibold">El dato va encima</p>
        </LabBackdrop>
      ))}
      <LabBackdrop pattern="wash" className="min-h-[150px] rounded-[12px] p-[20px]">
        <p className="m-0 text-[13px] text-lab-muted">pattern="wash" · soft</p>
        <p className="m-0 mt-[4px] text-[20px] font-semibold">El dato va encima</p>
      </LabBackdrop>
    </div>
  ),
  "lab-palette": PalettePreview,
  "lab-gradient-text": () => (
    <div className="grid gap-[16px]">
      {(["neutral", "paradigm"] as const).map((p) => (
        <LabScope key={p} palette={p} surface className="rounded-[12px] p-[24px]">
          <p className="m-0 text-[40px] leading-[1.05] font-bold">
            <LabGradientText>AI-native engineering</LabGradientText>
          </p>
          <p className="m-0 mt-[6px] text-[13px] text-lab-muted">Paleta {PALETAS[p].nombre}</p>
        </LabScope>
      ))}
    </div>
  ),
  "lab-marquee": () => (
    <div className="grid w-full gap-[10px]">
      <LabMarquee label="Clientes (ficticio)">
        {["Lightyear", "Higro", "Zurich", "Nexus", "Ridgeview", "Auteur"].map((n) => (
          <span key={n} className="text-[20px] font-semibold whitespace-nowrap text-lab-muted">
            {n}
          </span>
        ))}
      </LabMarquee>
      <p className="m-0 text-[13px] text-lab-muted">
        Se pausa al pasar el puntero. Con movimiento reducido, queda quieta.
      </p>
    </div>
  ),
  "lab-reveal-card": () => (
    <div className="grid w-full max-w-[560px] gap-[12px] min-[560px]:grid-cols-2">
      <LabRevealCard href="#" eyebrow="Capítulo 1" title="Cambios grandes" media={<Ilustracion />}>
        Pasá el puntero o enfocá con Tab.
      </LabRevealCard>
      <LabScope palette="voices">
        <LabRevealCard href="#" eyebrow="Capítulo 2" title="La tierra" media={<Ilustracion />}>
          Paleta Voices.
        </LabRevealCard>
      </LabScope>
    </div>
  ),
  "lab-glow-card": () => (
    <LabScope
      palette="paradigm"
      surface
      className="grid w-full gap-[12px] rounded-[12px] p-[20px] min-[640px]:grid-cols-2"
    >
      {["Low-Code", "Web y móvil"].map((t) => (
        <LabGlowCard key={t} tabIndex={0}>
          <p className="m-0 text-[18px] font-semibold">{t}</p>
          <p className="m-0 mt-[6px] text-[14px] text-lab-muted">Mové el puntero sobre la tarjeta.</p>
        </LabGlowCard>
      ))}
    </LabScope>
  ),
};

LAB_PREVIEWS["lab-process-steps"] = () => (
  <div className="grid w-full gap-[28px]">
    <ProcessSteps steps={ETAPAS.slice(0, 3)} />
    <ProcessSteps steps={ETAPAS} variant="timeline" current={1} />
    <ProcessSteps
      className="max-w-[560px]"
      variant="staircase"
      steps={[{ title: "Diagnóstico" }, { title: "Tratamiento" }, { title: "Seguimiento" }]}
    />
  </div>
);
LAB_PREVIEWS["lab-series-chart"] = () => (
  <div className="w-full max-w-[640px]">
    <SeriesChart title="Riesgo relativo por edad (ficticio)" x={EDADES} series={SERIES} highlight={["cv", "dm"]} />
    <SeriesChart
      className="mt-[24px]"
      title="Con evento anotado y proyección (ficticio)"
      x={["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"]}
      series={[{ id: "b", label: "Consultas", values: [12, 14, 13, 41, 22, 18, 19, 21] }]}
      highlight={["b"]}
      events={[{ at: 3, label: "Brote de influenza" }]}
      projectedFrom={5}
    />
  </div>
);
LAB_PREVIEWS["lab-distribution-chart"] = () => (
  <div className="w-full max-w-[640px]">
    <DistributionChart
      title="Edad al alta (ficticio)"
      points={DISTRIBUCION}
      annotations={[
        { x: 68, label: "Paciente A" },
        { x: 97, label: "Paciente B" },
      ]}
      xLabel="Edad"
      yLabel="Pacientes"
    />
  </div>
);
LAB_PREVIEWS["lab-category-wheel"] = () => (
  <CategoryWheel
    title="Tipos de alerta"
    categories={[
      { label: "Signos vitales", description: "presión, saturación" },
      { label: "Medicación" },
      { label: "Laboratorio" },
      { label: "Caídas" },
      { label: "Dolor" },
      { label: "Nutrición" },
    ]}
  />
);
LAB_PREVIEWS["lab-lozenge"] = () => (
  <div className="grid gap-[14px]">
    <div className="flex flex-wrap items-center gap-[8px]">
      <LabLozenge>Borrador</LabLozenge>
      <LabLozenge tone="info">En revisión</LabLozenge>
      <LabLozenge tone="success" icon={<CircleCheck />}>
        Completado
      </LabLozenge>
      <LabLozenge tone="warning" icon={<TriangleAlert />} metric={3}>
        En riesgo
      </LabLozenge>
      <LabLozenge tone="danger">Bloqueado</LabLozenge>
      <LabLozenge tone="info">Una etiqueta demasiado larga que el lozenge trunca a 200 px</LabLozenge>
    </div>
    <div className="flex flex-wrap items-center gap-[16px] text-[14px]">
      <span>
        Pendientes <LabCount value={12} />
      </span>
      <span>
        Cambio <LabCount value={4} signed tone="success" />
      </span>
      <span>
        Lecturas <LabCount value={1284000} compact />
      </span>
      <span>
        Alertas <LabCount value={7} tone="danger" bold />
      </span>
    </div>
  </div>
);
LAB_PREVIEWS["lab-notification"] = NotificationPreview;

// Grilla ficticia de ingresos (+) y egresos (−) por sala y hora, con valores de varios órdenes de magnitud.
const SALAS = ["UCI", "Intermedio", "Medicina", "Cirugía", "Pediatría", "Urgencia"];
const HORAS = Array.from({ length: 12 }, (_, i) => `${String(i * 2).padStart(2, "0")}h`);
const FLUJO = SALAS.map((_, r) =>
  HORAS.map((_, c) => {
    const base = Math.round(Math.sin(r * 1.7 + c * 0.9) * 10 ** (1 + ((r + c) % 5)));
    return (r * 7 + c * 3) % 11 === 0 ? 0 : base;
  }),
);

LAB_PREVIEWS["lab-proportion-split"] = () => (
  <div className="w-full max-w-[560px]">
    <ProportionSplit
      title="¿En qué se va un turno? (ficticio)"
      parts={[
        { label: "Registro", value: 47, items: ["Notas de evolución", "Indicaciones", "Balance hídrico"] },
        { label: "Atención directa", value: 53, items: ["Curaciones", "Administración de fármacos", "Educación"] },
      ]}
    />
  </div>
);
LAB_PREVIEWS["lab-feature-tabs"] = () => (
  <div className="w-full">
    <FeatureTabs
      label="Funciones (ficticio)"
      items={[
        {
          id: "enriquecer",
          title: "Enriquecimiento automático",
          description: "Completa datos faltantes desde fuentes conectadas.",
          panel: <p className="m-0 text-[18px]">Panel: enriquecimiento</p>,
        },
        {
          id: "flujos",
          title: "Flujos a medida",
          description: "Reglas por servicio y por turno.",
          panel: <p className="m-0 text-[18px]">Panel: flujos</p>,
        },
        {
          id: "informes",
          title: "Informes al instante",
          description: "Resumen del turno en un clic.",
          panel: <p className="m-0 text-[18px]">Panel: informes</p>,
        },
      ]}
    />
  </div>
);
LAB_PREVIEWS["lab-chapter-card"] = () => (
  <div className="grid w-full gap-[16px] min-[640px]:grid-cols-2">
    <ChapterCard
      index={1}
      title={"Cambios\ngrandes"}
      media={<Ilustracion />}
      sections={[
        { id: "1.1", title: "Raíces" },
        { id: "1.2", title: "Un futuro móvil" },
      ]}
      href="#"
    />
    <ChapterCard
      index={2}
      title={"La tierra"}
      media={<Ilustracion />}
      sections={[{ id: "2.1", title: "Agua" }]}
      href="#"
    />
  </div>
);
LAB_PREVIEWS["lab-diverging-heatmap"] = () => (
  <div className="grid w-full max-w-[620px] gap-[24px]">
    <DivergingHeatmap
      title="Egresos e ingresos por sala y hora (ficticio)"
      rows={SALAS}
      cols={HORAS}
      values={FLUJO}
      negativeLabel="Egresos"
      positiveLabel="Ingresos"
    />
    <DivergingHeatmap
      title='scheme="voices" (coral y verde medidos)'
      rows={SALAS}
      cols={HORAS}
      values={FLUJO}
      negativeLabel="Egresos"
      positiveLabel="Ingresos"
      scheme="voices"
    />
  </div>
);
LAB_PREVIEWS["lab-bento-grid"] = () => (
  <LabScope palette="paradigm" surface className="w-full rounded-[16px] p-[16px]">
    <BentoGrid>
      <BentoItem size="sm" tabIndex={0}>
        <p className="m-0 text-[20px] font-semibold">Low-Code</p>
        <p className="m-0 mt-[6px] text-[14px] text-lab-muted">sm · 2/5</p>
      </BentoItem>
      <BentoItem size="lg" tabIndex={0}>
        <p className="m-0 text-[20px] font-semibold">Apps a medida</p>
        <p className="m-0 mt-[6px] text-[14px] text-lab-muted">lg · 3/5</p>
      </BentoItem>
      <BentoItem size="lg" tabIndex={0}>
        <p className="m-0 text-[20px] font-semibold">Web y móvil</p>
      </BentoItem>
      <BentoItem size="sm" tabIndex={0}>
        <p className="m-0 text-[20px] font-semibold">Escala</p>
      </BentoItem>
      <BentoItem size="full" tabIndex={0}>
        <p className="m-0 text-[20px] font-semibold">Componentes · full</p>
      </BentoItem>
    </BentoGrid>
  </LabScope>
);
LAB_PREVIEWS["lab-scrolly-section"] = () => (
  <div className="w-full">
    <p className="m-0 mb-[16px] text-[13px] text-lab-muted">
      Bajá con el scroll: la escena de la izquierda sigue al paso del centro. La escena es decorativa: los datos también
      van en el texto de cada paso.
    </p>
    <ScrollySection
      steps={[
        {
          id: "cifra",
          title: "Dos mil millones de personas",
          body: "Primero, la magnitud: 2 mil millones de personas (ficticio).",
          visual: (
            <div className="grid size-full place-items-center">
              <StatRing size="lg" tone="accent" value="2B" caption="Cifra en anillo" />
            </div>
          ),
        },
        {
          id: "series",
          title: "El riesgo crece con la edad",
          body: "Después, la secuencia: de los 40 a los 80 años, el riesgo cardiovascular sube de 2 a 38 y el de diabetes, de 3 a 19.",
          visual: (
            <div className="grid size-full place-items-center">
              <SeriesChart
                className="w-full"
                title="Riesgo relativo"
                x={EDADES}
                series={SERIES.slice(0, 4)}
                highlight={["cv"]}
              />
            </div>
          ),
        },
        {
          id: "categorias",
          title: "Y no es una sola causa",
          body: "Al final, las cuatro causas: A, B, C y D.",
          visual: (
            <div className="grid size-full place-items-center">
              <CategoryWheel
                title="Causas"
                categories={[{ label: "A" }, { label: "B" }, { label: "C" }, { label: "D" }]}
                size={200}
              />
            </div>
          ),
        },
      ]}
    />
  </div>
);

LAB_PREVIEWS["lab-time-scale"] = () => (
  <div className="w-full">
    <TimeScale
      label="Historia del servicio (ficticio)"
      minUnitWidth={48}
      events={[2009, 2013, 2014, 2016, 2018, 2021].map((a) => ({
        at: a,
        label: String(a),
        content: (
          <p className="m-0 text-[15px] text-lab-ink">
            <strong>{a}</strong>: hito ficticio. Entre 2009 y 2013 pasaron 4 años; entre 2013 y 2014, uno.
          </p>
        ),
      }))}
    />
  </div>
);
LAB_PREVIEWS["lab-hierarchy-cells"] = () => (
  <div className="w-full max-w-[640px]">
    <HierarchyCells
      root={{
        id: "todo",
        label: "Ingresos del mes (ficticio)",
        children: [
          {
            id: "urg",
            label: "Urgencia",
            children: [
              { id: "u1", label: "Adultos", value: 420 },
              { id: "u2", label: "Pediatría", value: 180 },
              { id: "u3", label: "Maternidad", value: 90 },
            ],
          },
          {
            id: "prog",
            label: "Programados",
            children: [
              { id: "p1", label: "Cirugía", value: 260 },
              { id: "p2", label: "Medicina", value: 140 },
            ],
          },
          { id: "tras", label: "Traslados", value: 75 },
          { id: "otros", label: "Otros", value: 30 },
        ],
      }}
    />
  </div>
);
LAB_PREVIEWS["lab-range-bars"] = () => (
  <div className="w-full max-w-[600px]">
    <RangeBars
      title="Efecto estimado de una intervención (ficticio)"
      unit="%"
      ranges={[
        { label: "Adherencia", min: 30, max: 40 },
        { label: "Reingresos", min: -30, max: -20 },
        { label: "Tiempo de espera", min: -5, max: 10 },
      ]}
    />
  </div>
);

LAB_PREVIEWS["lab-filtered-stat"] = () => (
  <div className="w-full">
    <FilteredStat
      title="Pacientes con control al día (ficticio)"
      label="Servicio"
      unit="%"
      reference="todos"
      segments={[
        { id: "todos", label: "Todos", value: 24, detail: "+11 puntos desde 2023" },
        { id: "aps", label: "APS", value: 28, detail: "+9 puntos desde 2023" },
        {
          id: "urg",
          label: "Urgencia",
          value: 19,
          detail: "+14 puntos desde 2023",
          note: "Muestra chica: 86 pacientes. Leer con cautela.",
        },
        { id: "ped", label: "Pediatría", value: 31, detail: "+6 puntos desde 2023" },
        { id: "mat", label: "Maternidad", value: 22, detail: "+3 puntos desde 2023" },
      ]}
    />
  </div>
);

function DotNavPreview() {
  const caja = useRef<HTMLDivElement>(null);
  const base = useId().replace(/:/g, "");
  const secciones = ["Inicio", "Resumen", "Evaluar", "Planificar", "Formar", "Competir", "Cerrar"].map((label, i) => ({
    id: `${base}-s${i}`,
    label,
  }));
  return (
    <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-end gap-[20px]">
      <DotNav label="Secciones del informe" sections={secciones} root={caja} />
      <div ref={caja} className="h-[340px] overflow-y-auto rounded-[12px] border border-lab-line bg-lab-surface">
        {secciones.map((s, i) => (
          <section key={s.id} id={s.id} className="min-h-[300px] border-b border-lab-line p-[24px] outline-none">
            <p className="m-0 text-[12px] font-semibold uppercase tracking-[3px] text-lab-muted">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="m-0 mt-[6px] text-[22px] font-semibold text-lab-ink">{s.label}</h3>
            <p className="m-0 mt-[8px] max-w-[48ch] text-[14px] leading-[1.5] text-lab-muted">
              Sección ficticia. Bajá con el scroll: el punto de la izquierda sigue a la sección que cruza el 40 % del
              alto visible.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
LAB_PREVIEWS["lab-dot-nav"] = () => <DotNavPreview />;

LAB_PREVIEWS["lab-radial-bars"] = () => (
  <div className="grid w-full justify-items-center gap-[40px]">
    <RadialBars
      title="Menciones por tema (ficticio)"
      unit="menciones"
      items={[
        { label: "Acceso", value: 649 },
        { label: "Espera", value: 512 },
        { label: "Trato", value: 430 },
        { label: "Costos", value: 388 },
        { label: "Medicamentos", value: 301 },
        { label: "Información", value: 276 },
        { label: "Infraestructura", value: 190 },
        { label: "Seguridad", value: 154 },
        { label: "Digital", value: 120 },
        { label: "Otros", value: 64 },
      ]}
    />
    <RadialBars
      title="Consultas más buscadas (ficticio)"
      variant="ranking"
      unit="búsquedas"
      items={[
        ["Fiebre", 980],
        ["Tos", 760],
        ["Cefalea", 690],
        ["Dolor lumbar", 540],
        ["Alergia", 430],
        ["Insomnio", 380],
        ["Gastritis", 360],
        ["Ansiedad", 300],
        ["Mareo", 190],
        ["Otitis", 186],
        ["Conjuntivitis", 170],
        ["Acné", 150],
        ["Caries", 120],
        ["Esguince", 100],
        ["Varicela", 70],
        ["Herpes", 60],
      ].map(([label, value]) => ({ label: String(label), value: Number(value) }))}
    />
  </div>
);

export const LAB_THUMBS: Record<string, ReactNode> = {
  "lab-presence-dot": <PresenceDot rings={2} />,
  "lab-stat-ring": <StatRing size="sm" value="2B" caption="" className="scale-[0.6]" />,
  "lab-encoding-compare": (
    <svg aria-hidden viewBox="0 0 90 40" className="h-[40px]">
      <rect x="0" y="4" width="70" height="8" rx="2" className="fill-lab-accent" />
      <rect x="0" y="16" width="52" height="8" rx="2" className="fill-lab-accent" opacity="0.72" />
      <rect x="0" y="28" width="24" height="8" rx="2" className="fill-lab-accent" opacity="0.5" />
    </svg>
  ),
  "lab-signal-disclosure": (
    <span className="flex items-center gap-[8px] rounded-[8px] border border-lab-line bg-lab-surface px-[10px] py-[6px] text-[12px]">
      <PresenceDot size="sm" /> Indicaciones nuevas ▾
    </span>
  ),
  "lab-backdrop": <LabBackdrop tone="deep" pattern="aurora" className="h-[50px] w-[120px] rounded-[8px]" />,
  "lab-palette": (
    <span className="flex gap-[4px]">
      {(["bioage", "meridian", "paradigm", "voices"] as const).map((p) => (
        <span key={p} className="size-[18px] rounded-full" style={{ background: PALETAS[p].colores.accent.hex }} />
      ))}
    </span>
  ),
  "lab-gradient-text": (
    <span className="text-[22px] font-bold">
      <LabGradientText>Aa</LabGradientText>
    </span>
  ),
  "lab-marquee": <span className="text-[12px] text-lab-muted">← Lightyear · Higro · Zurich ←</span>,
  "lab-reveal-card": <span className="h-[44px] w-[70px] rounded-[6px] bg-lab-accent grayscale" />,
  "lab-process-steps": <span className="text-[12px] font-semibold text-lab-ink">1 → 2 → 3</span>,
  "lab-series-chart": (
    <svg aria-hidden viewBox="0 0 90 40" className="h-[40px]">
      <path d="M0 35 L30 30 L60 22 L90 18" fill="none" className="stroke-lab-context" />
      <path d="M0 32 L30 26 L60 28 L90 30" fill="none" className="stroke-lab-context" />
      <path d="M0 36 L30 30 L60 16 L90 4" fill="none" strokeWidth="2.5" className="stroke-lab-accent" />
    </svg>
  ),
  "lab-distribution-chart": (
    <svg aria-hidden viewBox="0 0 90 40" className="h-[40px]">
      <path d="M0 38 C30 38 40 4 55 4 C70 4 75 38 90 38 Z" className="fill-lab-accent-soft stroke-lab-accent" />
      <circle cx="30" cy="30" r="3" className="fill-lab-surface stroke-lab-ink" />
    </svg>
  ),
  "lab-category-wheel": (
    <span className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="size-[14px] rounded-[3px]" style={{ background: `var(--lab-cat-${n})` }} />
      ))}
    </span>
  ),
  "lab-lozenge": (
    <span className="flex items-center gap-[6px]">
      <LabLozenge tone="success">En curso</LabLozenge>
      <LabCount value={12} />
    </span>
  ),
  "lab-notification": (
    <span className="rounded-[4px] border-l-[3px] border-l-lab-warning bg-lab-warning-soft px-[8px] py-[4px] text-[12px] text-lab-ink">
      Turno sin cubrir
    </span>
  ),
  "lab-glow-card": (
    <span
      className="h-[44px] w-[90px] rounded-[8px] border border-lab-line"
      style={{
        background:
          "radial-gradient(60px circle at 30% 40%, color-mix(in oklab, var(--lab-accent) 30%, transparent), transparent)",
      }}
    />
  ),
  "lab-proportion-split": (
    <svg aria-hidden viewBox="0 0 40 40" className="h-[40px]">
      <path d="M20 20 L20 2 A18 18 0 0 1 22 38 Z" className="fill-lab-ink" />
      <path d="M18 20 L18 2 A18 18 0 0 0 16 38 Z" className="fill-lab-accent" />
    </svg>
  ),
  "lab-feature-tabs": (
    <span className="grid w-[110px] gap-[3px]">
      <span className="h-[14px] rounded-[3px] border border-lab-line bg-lab-surface" />
      <span className="h-[6px] rounded-[3px] bg-lab-line" />
      <span className="h-[6px] rounded-[3px] bg-lab-line" />
    </span>
  ),
  "lab-chapter-card": (
    <span className="grid w-[70px]" style={{ background: "var(--lab-cat-2)", color: "var(--lab-cat-2-text)" }}>
      <span className="h-[22px] bg-lab-line" />
      <span className="px-[4px] font-lab-condensed text-[14px] uppercase">Cap. 2</span>
    </span>
  ),
  "lab-diverging-heatmap": (
    <span className="grid grid-cols-6 gap-[2px]">
      {[-5, -3, -1, 1, 3, 5, -4, -2, 0, 2, 4, 5].map((t, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: miniatura fija.
          key={i}
          className="size-[10px]"
          style={{
            background:
              t === 0
                ? "transparent"
                : `color-mix(in oklab, ${t < 0 ? "rgb(230 97 1)" : "rgb(33 102 172)"} ${Math.abs(t) * 17}%, transparent)`,
          }}
        />
      ))}
    </span>
  ),
  "lab-bento-grid": (
    <span className="grid w-[100px] grid-cols-5 gap-[3px]">
      <span className="col-span-2 h-[16px] rounded-[4px] border border-lab-line" />
      <span className="col-span-3 h-[16px] rounded-[4px] border border-lab-line" />
      <span className="col-span-3 h-[16px] rounded-[4px] border border-lab-line" />
      <span className="col-span-2 h-[16px] rounded-[4px] border border-lab-line" />
    </span>
  ),
  "lab-scrolly-section": (
    <span className="flex items-center gap-[6px] text-[11px] text-lab-muted">
      <span className="size-[28px] rounded-[6px] bg-lab-accent-soft" /> 01 / 03 ↓
    </span>
  ),
  "lab-time-scale": (
    <span className="relative block h-[16px] w-[110px] border-b border-lab-line">
      {[0, 44, 55, 77, 99].map((x, i) => (
        <span
          key={x}
          className={cn(
            "absolute top-[9px] size-[8px] rotate-45 border border-lab-ink",
            i === 0 ? "bg-lab-ink" : "bg-lab-surface",
          )}
          style={{ left: x }}
        />
      ))}
    </span>
  ),
  "lab-hierarchy-cells": (
    <span className="grid h-[44px] w-[90px] grid-cols-[3fr_2fr] grid-rows-2 gap-[2px]">
      <span className="row-span-2" style={{ background: "var(--lab-cat-1)" }} />
      <span style={{ background: "var(--lab-cat-2)" }} />
      <span style={{ background: "var(--lab-cat-3)" }} />
    </span>
  ),
  "lab-range-bars": (
    <svg aria-hidden viewBox="0 0 90 40" className="h-[40px]">
      <line x1="45" x2="45" y1="0" y2="40" className="stroke-lab-ink" />
      <rect x="60" y="8" width="18" height="8" rx="4" className="fill-lab-accent" />
      <rect x="18" y="24" width="14" height="8" rx="4" className="fill-lab-accent" />
    </svg>
  ),
  "lab-filtered-stat": (
    <span className="grid justify-items-center gap-[4px]">
      <span className="text-[22px] font-bold leading-none text-lab-ink">24 %</span>
      <span className="flex gap-[2px] rounded-full bg-lab-ink p-[2px]">
        <span className="h-[8px] w-[20px] rounded-full bg-lab-surface" />
        <span className="h-[8px] w-[20px]" />
        <span className="h-[8px] w-[20px]" />
      </span>
    </span>
  ),
  "lab-dot-nav": (
    <span className="grid w-[22px] justify-items-center gap-[3px] rounded-full bg-lab-ink py-[6px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "grid size-[12px] place-items-center rounded-full border",
            i === 1 ? "border-lab-on-ink" : "border-transparent",
          )}
        >
          <span className="size-[3px] rounded-full bg-lab-on-ink" />
        </span>
      ))}
    </span>
  ),
  "lab-radial-bars": (
    <svg aria-hidden viewBox="0 0 60 60" className="h-[48px]">
      <circle cx="30" cy="30" r="7" className="fill-none stroke-lab-line" />
      {[24, 16, 20, 12, 18, 10, 14, 8].map((l, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={a}
            x1={30 + 7 * Math.sin(a)}
            y1={30 - 7 * Math.cos(a)}
            x2={30 + (7 + l) * Math.sin(a)}
            y2={30 - (7 + l) * Math.cos(a)}
            strokeWidth={3}
            strokeLinecap="round"
            className="stroke-lab-accent"
          />
        );
      })}
    </svg>
  ),
};
