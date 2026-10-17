"use client";

import { type ReactNode, useState } from "react";
import { EncodingCompare } from "@/components/ui/lab/encoding-compare";
import { LabBackdrop, PATTERNS } from "@/components/ui/lab/lab-backdrop";
import { LabGlowCard } from "@/components/ui/lab/lab-glow-card";
import { LabGradientText } from "@/components/ui/lab/lab-gradient-text";
import { LabMarquee } from "@/components/ui/lab/lab-marquee";
import { LabPalette, LabScope } from "@/components/ui/lab/lab-palette";
import { LabRevealCard } from "@/components/ui/lab/lab-reveal-card";
import { PresenceDot } from "@/components/ui/lab/presence-dot";
import { SignalDisclosure } from "@/components/ui/lab/signal-disclosure";
import { StatRing } from "@/components/ui/lab/stat-ring";
import { PALETAS, PALETAS_LAB, type PaletaLab } from "@/lib/lab/paletas";

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

/** Ilustración propia y colorida para que se note el paso de grises a color. */
function Ilustracion() {
  return (
    <svg aria-hidden viewBox="0 0 240 120" className="block h-[120px] w-full">
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
      <EncodingCompare title="Mismo dato, como arco" data={TURNOS} defaultEncoding="arc" />
    </div>
  ),
  "lab-signal-disclosure": () => (
    <div className="grid w-full max-w-[460px] gap-[10px]">
      <SignalDisclosure title="Indicaciones nuevas" summary="2 desde el último turno (ficticio)">
        Ajuste de dosis de las 14:00 y control de glicemia cada 6 h.
      </SignalDisclosure>
      <SignalDisclosure title="Abierto por defecto" defaultOpen signal={<PresenceDot label="Nuevo" rings={1} />}>
        El detalle sigue en el DOM cuando está cerrado, con el atributo hidden.
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
  "lab-glow-card": (
    <span
      className="h-[44px] w-[90px] rounded-[8px] border border-lab-line"
      style={{
        background:
          "radial-gradient(60px circle at 30% 40%, color-mix(in oklab, var(--lab-accent) 30%, transparent), transparent)",
      }}
    />
  ),
};
