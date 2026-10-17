import { useId } from "react";
import { CalendarIcon, ChevronDown } from "./kit-icons";

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
    <div className="fld" style={{ width }}>
      <label htmlFor={id}>{label}</label>
      <div className="fld-control">{children}</div>
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
        className={value ? "" : "is-placeholder"}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="fld-chevron" aria-hidden="true">
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
        className="fld-date"
      />
      <span className="fld-calendar" aria-hidden="true">
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
      <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
      <span className="fld-unit">{unit}</span>
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
      <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}
