"use client";

import type { ReactNode } from "react";
import { EncodingCompare } from "@/components/ui/lab/encoding-compare";
import { LabBackdrop } from "@/components/ui/lab/lab-backdrop";
import { PresenceDot } from "@/components/ui/lab/presence-dot";
import { SignalDisclosure } from "@/components/ui/lab/signal-disclosure";
import { StatRing } from "@/components/ui/lab/stat-ring";

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
      <LabBackdrop className="rounded-[12px] p-[24px]">
        <p className="m-0 text-[13px] text-lab-muted">soft · corner</p>
        <p className="m-0 mt-[4px] text-[20px] font-semibold">El dato va encima</p>
      </LabBackdrop>
      <LabBackdrop tone="deep" glow="center" className="rounded-[12px] p-[24px]">
        <p className="m-0 text-[13px] opacity-80">deep · center</p>
        <p className="m-0 mt-[4px] text-[20px] font-semibold">El dato va encima</p>
      </LabBackdrop>
    </div>
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
  "lab-backdrop": <LabBackdrop tone="deep" className="h-[50px] w-[120px] rounded-[8px]" />,
};
