"use client";
import * as Slider from "@radix-ui/react-slider";
import * as React from "react";
import { cx } from "@/lib/kraa/kraa-utils";
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
    <div className="kraa-slider-wrap">
      <Slider.Root
        className={cx("kraa-slider", className)}
        value={values}
        {...props}
        onValueChange={(next) => {
          if (value === undefined) setLocal(next);
          props.onValueChange?.(next);
        }}
      >
        <Slider.Track className="kraa-slider-track">
          <Slider.Range className="kraa-slider-range" />
        </Slider.Track>
        {values.map((_, i) => (
          <Slider.Thumb
            className="kraa-slider-thumb"
            // biome-ignore lint/suspicious/noArrayIndexKey: cada thumb es una posición fija del rango
            key={i}
            aria-label={thumbLabels?.[i] ?? (values.length === 1 ? label : `${label} ${i === 0 ? "mínimo" : "máximo"}`)}
          />
        ))}
      </Slider.Root>
      <div className="kraa-range-values" aria-hidden="true">
        {values.map((v, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: un valor por thumb, en el mismo orden
          <span key={i}>{Math.round(v * 100) / 100}</span>
        ))}
      </div>
    </div>
  );
}
