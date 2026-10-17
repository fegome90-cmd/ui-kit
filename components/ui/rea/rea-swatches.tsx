export type ReaSwatch = { value: string; label?: string; ink?: string };

/** Tira de muestras de color con su valor escrito; el color nunca es la única información. */
function ReaSwatches({ colors, label = "Paleta" }: { colors: ReaSwatch[]; label?: string }) {
  return (
    <ul data-slot="rea-swatches" className="m-0 flex w-full list-none items-end gap-2 p-0" aria-label={label}>
      {colors.map((c) => (
        <li
          key={c.value}
          className="flex h-[180px] flex-1 items-end justify-center border border-rea-line px-1 py-3 font-rea-mono text-[10px] tracking-[-0.06em]"
          style={{ background: c.value, color: c.ink ?? "#fff" }}
        >
          {c.label ? `${c.label} · ${c.value}` : c.value}
        </li>
      ))}
    </ul>
  );
}

export { ReaSwatches };
