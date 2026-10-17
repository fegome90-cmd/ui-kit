"use client";
import * as React from "react";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import {
  KraaField,
  KraaFieldGroup,
  KraaFieldLabel,
  KraaFieldLegend,
  KraaFieldSet,
  KraaSelect,
} from "@/components/ui/kraa/kraa-field";
import { KraaRangeSlider } from "@/components/ui/kraa/kraa-range-slider";
import { KraaToggleGroup } from "@/components/ui/kraa/kraa-toggle-group";
import { DEFAULT_TYPOGRAPHY, FONT_FAMILIES, normalizeTypography, type TypographyConfig } from "@/lib/kraa/kraa-model";

const CAPTION = "font-kraa-ui text-[11px] leading-normal text-kraa-muted";
export type KraaTypographySettingsProps = {
  value: TypographyConfig;
  onValueChange: (value: TypographyConfig) => void;
  licensedSuisseAvailable?: boolean;
};
export function KraaTypographySettings({
  value,
  onValueChange,
  licensedSuisseAvailable = false,
}: KraaTypographySettingsProps) {
  const id = React.useId(),
    v = normalizeTypography(value);
  const change = (next: Partial<TypographyConfig>) => onValueChange(normalizeTypography({ ...v, ...next }));
  return (
    <section
      data-slot="kraa-typography-settings"
      className="rounded-[24px] bg-kraa-surface-soft p-6"
      aria-labelledby={`${id}-title`}
    >
      <header className="mb-7 flex items-center justify-between gap-4 max-[700px]:items-start">
        <h2 id={`${id}-title`} className="text-xl">
          Ajustes de lectura
        </h2>
        <KraaButton onClick={() => onValueChange({ ...DEFAULT_TYPOGRAPHY })}>Restablecer</KraaButton>
      </header>
      <div className="grid grid-cols-[minmax(200px,260px)_minmax(0,1fr)] gap-10 max-[700px]:grid-cols-1 max-[700px]:gap-6">
        <KraaFieldSet>
          <KraaFieldLegend>Tipografía</KraaFieldLegend>
          <KraaFieldGroup>
            <KraaField>
              <KraaFieldLabel htmlFor={`${id}-font`}>Familia</KraaFieldLabel>
              <KraaSelect
                id={`${id}-font`}
                value={v.font}
                onChange={(e) => change({ font: e.target.value as TypographyConfig["font"] })}
              >
                <option value="inter">Inter · incluida</option>
                <option value="serif">Domine · fallback Georgia</option>
                <option value="mono">Monaspace · fallback monospace</option>
                {licensedSuisseAvailable && <option value="suisse">SuisseIntl · licencia propia</option>}
              </KraaSelect>
            </KraaField>
            <KraaField>
              <KraaFieldLabel>Tamaño</KraaFieldLabel>
              <KraaRangeSlider
                label="Tamaño de texto"
                min={12}
                max={40}
                step={1}
                value={[v.size]}
                onValueChange={(a) => change({ size: a[0] })}
              />
            </KraaField>
            <KraaField>
              <KraaFieldLabel>Interlineado</KraaFieldLabel>
              <KraaRangeSlider
                label="Interlineado"
                min={1.2}
                max={2}
                step={0.05}
                value={[v.lineHeight]}
                onValueChange={(a) => change({ lineHeight: a[0] })}
              />
            </KraaField>
            <KraaField>
              <KraaFieldLabel>Ancho</KraaFieldLabel>
              <KraaRangeSlider
                label="Ancho de lectura"
                min={320}
                max={960}
                step={20}
                value={[v.width]}
                onValueChange={(a) => change({ width: a[0] })}
              />
            </KraaField>
            <KraaField>
              <KraaFieldLabel>Escala</KraaFieldLabel>
              <KraaToggleGroup
                label="Escala tipográfica"
                value={v.mode}
                onValueChange={(mode) => change({ mode: mode as TypographyConfig["mode"] })}
                choices={[
                  { value: "static", label: "Estática" },
                  { value: "fluid", label: "Fluida" },
                ]}
              />
            </KraaField>
          </KraaFieldGroup>
        </KraaFieldSet>
        <section
          className="min-w-0 self-start rounded-[16px] bg-kraa-surface-soft p-5 [overflow-wrap:anywhere]"
          aria-label="Muestra tipográfica"
        >
          <p className={CAPTION}>VISTA PREVIA</p>
          <p style={{ fontFamily: FONT_FAMILIES[v.font], fontSize: v.size, lineHeight: v.lineHeight }}>
            Una página tranquila para escribir, mirar de nuevo y encontrar lo que importa.
          </p>
          <p className={CAPTION}>
            {v.size} px · {v.lineHeight} de interlineado · {v.width} px de ancho
          </p>
        </section>
      </div>
    </section>
  );
}
