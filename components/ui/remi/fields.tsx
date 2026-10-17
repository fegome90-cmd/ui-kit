import { useId } from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronDown } from "./kit-icons";

const CONTROL =
  "h-[21px] min-w-0 flex-1 rounded-none border border-remi-field-border bg-white px-[5px] text-[12px] text-remi-ink placeholder:text-remi-placeholder placeholder:italic";

/* Campos del formulario de Indicaciones: etiqueta arriba en negrita pequeña,
   borde azul grisáceo, texto de ayuda en cursiva. */

function Field({
  label,
  children,
  width,
  id,
}: {
  label: string;
  children: React.ReactNode;
  width?: number | string;
  id: string;
}) {
  return (
    <div data-slot="field" className="flex min-w-0 flex-col gap-[3px]" style={{ width }}>
      <label htmlFor={id} className="text-[11px] text-remi-ink">
        {label}
      </label>
      <div className="relative flex h-[21px]">{children}</div>
    </div>
  );
}

/** Select con botón azul de chevron a la derecha. */
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  width,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  width?: number | string;
}) {
  const id = useId();
  return (
    <Field label={label} width={width} id={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(CONTROL, "appearance-none pr-8", !value && "text-remi-placeholder italic")}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute top-0 right-0 flex h-[21px] w-[26px] items-center justify-center bg-remi-blue"
        aria-hidden="true"
      >
        <ChevronDown />
      </span>
    </Field>
  );
}

/** Fecha y hora con ícono de calendario (input nativo datetime-local). */
export function DateField({
  label,
  value,
  onChange,
  width,
  withTime = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  width?: number | string;
  withTime?: boolean;
}) {
  const id = useId();
  return (
    <Field label={label} width={width} id={id}>
      <input
        id={id}
        type={withTime ? "datetime-local" : "date"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // El indicador nativo queda invisible sobre el ícono, así el clic sigue abriendo el selector.
        className={cn(
          CONTROL,
          "pr-[26px] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-[21px] [&::-webkit-calendar-picker-indicator]:w-[26px] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
        )}
      />
      <span className="pointer-events-none absolute top-px right-1" aria-hidden="true">
        <CalendarIcon />
      </span>
    </Field>
  );
}

/** Número con caja gris de unidad ("--" si no hay). */
export function UnitInput({
  label,
  value,
  onChange,
  unit = "--",
  width,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  width?: number | string;
}) {
  const id = useId();
  return (
    <Field label={label} width={width} id={id}>
      <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className={CONTROL} />
      <span className="flex min-w-10 items-center justify-center border border-l-0 border-remi-field-border bg-remi-unit text-[11px] text-remi-unit-text">
        {unit}
      </span>
    </Field>
  );
}

/** Texto simple con placeholder en cursiva. */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  width,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: number | string;
}) {
  const id = useId();
  return (
    <Field label={label} width={width} id={id}>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={CONTROL}
      />
    </Field>
  );
}
