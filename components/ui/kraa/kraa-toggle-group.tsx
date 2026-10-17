"use client";
import * as Toggle from "@radix-ui/react-toggle-group";
export type KraaChoice = { value: string; label: string; disabled?: boolean };
export type KraaToggleGroupProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  choices: KraaChoice[];
  disabled?: boolean;
};
export function KraaToggleGroup({ label, value, onValueChange, choices, disabled }: KraaToggleGroupProps) {
  return (
    <Toggle.Root
      type="single"
      aria-label={label}
      value={value}
      disabled={disabled}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      className="kraa-toggle-group"
    >
      {choices.map((c) => (
        <Toggle.Item className="kraa-toggle" key={c.value} value={c.value} disabled={c.disabled}>
          {c.label}
        </Toggle.Item>
      ))}
    </Toggle.Root>
  );
}
