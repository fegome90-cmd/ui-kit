import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Track de 2px gris con tramo activo coral. Thumb circular coral de 20px con
 * punto blanco central, o bien una píldora con el valor (`formatLabel`).
 * `ticks` dibuja las marcas segmentadas que se ven en el panel de filtros.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ticks = 0,
  formatLabel,
  onValueChange,
  "aria-label": ariaLabel,
  thumbLabels,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  ticks?: number;
  formatLabel?: (v: number) => string;
  /** Nombre accesible por thumb; si se omite se deriva de aria-label (+ mín./máx. en rangos) */
  thumbLabels?: string[];
}) {
  const [internal, setInternal] = React.useState(value ?? defaultValue ?? [min]);
  const values = value ?? internal;
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onValueChange={(v) => {
        setInternal(v);
        onValueChange?.(v);
      }}
      className={cn(
        "relative flex w-full touch-none items-center select-none h-5 data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-0.5 w-full grow overflow-hidden bg-muted">
        {ticks > 0 && (
          <div className="absolute inset-0 flex justify-between">
            {Array.from({ length: ticks + 1 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: marcas estáticas sin identidad propia
              <span key={i} className="h-full w-0.5 bg-card" />
            ))}
          </div>
        )}
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {values.map((v, i) => (
        <SliderPrimitive.Thumb
          // biome-ignore lint/suspicious/noArrayIndexKey: cada thumb es una posición fija del rango
          key={i}
          aria-label={
            thumbLabels?.[i] ??
            (ariaLabel && values.length > 1 ? `${ariaLabel} (${i === 0 ? "mínimo" : "máximo"})` : ariaLabel)
          }
          className={cn(
            "relative flex h-5 min-w-5 cursor-grab items-center justify-center rounded-full before:absolute before:-inset-[6px] before:rounded-full before:content-[''] bg-primary text-xs font-medium text-primary-foreground outline-none transition-transform duration-(--duration-color) ease-out-quart hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/40 active:cursor-grabbing",
            formatLabel && "px-1.5",
          )}
        >
          {formatLabel ? formatLabel(v) : <span className="size-1.5 rounded-full bg-primary-foreground" />}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
