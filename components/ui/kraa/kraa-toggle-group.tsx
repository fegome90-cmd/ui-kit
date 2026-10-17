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
      data-slot="kraa-toggle-group"
      aria-label={label}
      value={value}
      disabled={disabled}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      className="flex flex-wrap gap-0.5 rounded-[8px] bg-kraa-surface-soft p-0.5"
    >
      {choices.map((c) => (
        <Toggle.Item
          className="flex-1 rounded-[6px] border-0 bg-transparent px-3 py-1.5 text-kraa-muted transition-colors duration-150 data-[state=on]:bg-kraa-surface-active data-[state=on]:text-kraa-fg"
          key={c.value}
          value={c.value}
          disabled={c.disabled}
        >
          {c.label}
        </Toggle.Item>
      ))}
    </Toggle.Root>
  );
}
