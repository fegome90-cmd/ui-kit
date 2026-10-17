export type ReaSwatch = { value: string; label?: string; ink?: string };

/** Tira de muestras de color con su valor escrito; el color nunca es la única información. */
export function ReaSwatches({ colors, label = "Paleta" }: { colors: ReaSwatch[]; label?: string }) {
  return (
    <ul className="rea-swatches" aria-label={label} style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {colors.map((c) => (
        <li key={c.value} className="rea-swatch" style={{ background: c.value, color: c.ink ?? "#fff" }}>
          {c.label ? `${c.label} · ${c.value}` : c.value}
        </li>
      ))}
    </ul>
  );
}
