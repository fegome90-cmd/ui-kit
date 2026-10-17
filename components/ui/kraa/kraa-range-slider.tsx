"use client";
import * as Slider from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "@/lib/utils";

export type KraaRangeSliderProps = React.ComponentProps<typeof Slider.Root> & { label: string; thumbLabels?: string[] };
export function KraaRangeSlider({
  label,
  thumbLabels,
  className,
  value,
  defaultValue = [16],
  ...props
}: KraaRangeSliderProps) {
  const [local, setLocal] = React.useState(defaultValue);
  const values = value ?? local;
  return (
    <div data-slot="kraa-range-slider" className="py-2">
      <Slider.Root
        className={cn(
          "relative flex h-7 w-full touch-none items-center select-none transition-opacity duration-200 data-disabled:opacity-50",
          className,
        )}
        value={values}
        {...props}
        onValueChange={(next) => {
          if (value === undefined) setLocal(next);
          props.onValueChange?.(next);
        }}
      >
        <Slider.Track className="relative h-7 w-full rounded-[8px] bg-kraa-surface-soft">
          <Slider.Range className="absolute h-full rounded-[6px] bg-kraa-surface-active transition-colors duration-200" />
        </Slider.Track>
        {values.map((_, i) => (
          <Slider.Thumb
            className="block h-7 w-2 cursor-ew-resize rounded-[6px] bg-kraa-muted transition-colors duration-200 hover:bg-kraa-fg"
            // biome-ignore lint/suspicious/noArrayIndexKey: cada thumb es una posición fija del rango
            key={i}
            aria-label={thumbLabels?.[i] ?? (values.length === 1 ? label : `${label} ${i === 0 ? "mínimo" : "máximo"}`)}
          />
        ))}
      </Slider.Root>
      <div className="flex justify-between pt-1 text-[10px] text-kraa-muted" aria-hidden="true">
        {values.map((v, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: un valor por thumb, en el mismo orden
          <span key={i}>{Math.round(v * 100) / 100}</span>
        ))}
      </div>
    </div>
  );
}
