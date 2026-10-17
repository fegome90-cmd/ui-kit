/** Texto comparable: sin tildes, en minúsculas y sin espacios en los extremos. */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

/** true si la consulta aparece en alguno de los textos; una consulta vacía coincide siempre. */
export function matchesQuery(query: string, ...texts: (string | undefined)[]): boolean {
  const needle = fold(query);
  if (!needle) return true;
  return fold(texts.filter(Boolean).join(" ")).includes(needle);
}

/** Número con dos dígitos, como en los contadores del sitio ("01/04", "07%"). */
export const pad2 = (n: number) => String(Math.max(0, Math.round(n))).padStart(2, "0");

/** Limita un valor al rango [min, max]. */
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
