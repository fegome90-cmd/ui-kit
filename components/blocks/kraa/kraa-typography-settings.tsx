"use client";
import * as React from "react";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import {
  KraaField,
  KraaFieldGroup,
  KraaFieldLabel,
  KraaFieldLegend,
  KraaFieldSet,
} from "@/components/ui/kraa/kraa-field";
import { KraaRangeSlider } from "@/components/ui/kraa/kraa-range-slider";
import { KraaToggleGroup } from "@/components/ui/kraa/kraa-toggle-group";
import { DEFAULT_TYPOGRAPHY, FONT_FAMILIES, normalizeTypography, type TypographyConfig } from "@/lib/kraa/kraa-model";
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
    <section className="kraa-typography-settings" aria-labelledby={`${id}-title`}>
      <header className="kraa-settings-head">
        <h2 id={`${id}-title`}>Ajustes de lectura</h2>
        <KraaButton onClick={() => onValueChange({ ...DEFAULT_TYPOGRAPHY })}>Restablecer</KraaButton>
      </header>
      <div className="kraa-settings-grid">
        <KraaFieldSet>
          <KraaFieldLegend>Tipografía</KraaFieldLegend>
          <KraaFieldGroup>
            <KraaField>
              <KraaFieldLabel htmlFor={`${id}-font`}>Familia</KraaFieldLabel>
              <select
                id={`${id}-font`}
                className="kraa-select"
                value={v.font}
                onChange={(e) => change({ font: e.target.value as TypographyConfig["font"] })}
              >
                <option value="inter">Inter · incluida</option>
                <option value="serif">Domine · fallback Georgia</option>
                <option value="mono">Monaspace · fallback monospace</option>
                {licensedSuisseAvailable && <option value="suisse">SuisseIntl · licencia propia</option>}
              </select>
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
        <section className="kraa-settings-preview" aria-label="Muestra tipográfica">
          <p className="kraa-caption">VISTA PREVIA</p>
          <p style={{ fontFamily: FONT_FAMILIES[v.font], fontSize: v.size, lineHeight: v.lineHeight }}>
            Una página tranquila para escribir, mirar de nuevo y encontrar lo que importa.
          </p>
          <p className="kraa-caption">
            {v.size} px · {v.lineHeight} de interlineado · {v.width} px de ancho
          </p>
        </section>
      </div>
    </section>
  );
}
