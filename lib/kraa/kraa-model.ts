export type DocumentItem = {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  author?: string;
  initials?: string;
  favorite?: boolean;
};
export type TypographyConfig = {
  font: "inter" | "serif" | "mono" | "suisse";
  size: number;
  lineHeight: number;
  width: number;
  mode: "static" | "fluid";
};
export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  font: "inter",
  size: 16,
  lineHeight: 1.55,
  width: 680,
  mode: "static",
};
export const FONT_FAMILIES = {
  inter: '"Kraa Inter", Inter, sans-serif',
  serif: "Domine, Georgia, serif",
  mono: 'Monaspace, "Courier New", monospace',
  suisse: 'SuisseIntl, "Kraa Inter", Inter, sans-serif',
} as const;
const finite = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);
export function normalizeTypography(value: Partial<TypographyConfig>): TypographyConfig {
  const v = { ...DEFAULT_TYPOGRAPHY, ...value };
  return {
    font: Object.hasOwn(FONT_FAMILIES, v.font) ? v.font : "inter",
    size: Math.min(40, Math.max(12, finite(v.size, 16))),
    lineHeight: Math.min(2, Math.max(1.2, finite(v.lineHeight, 1.55))),
    width: Math.min(960, Math.max(320, finite(v.width, 680))),
    mode: v.mode === "fluid" ? "fluid" : "static",
  };
}
export function typographyFontSize(config: TypographyConfig) {
  const v = normalizeTypography(config);
  return v.mode === "fluid" ? `clamp(${Math.min(14, v.size)}px, ${v.size / 10}vw, ${v.size}px)` : `${v.size}px`;
}
export function filterDocuments(items: DocumentItem[], query: string) {
  const needle = query
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
  return items.filter((item) =>
    [item.title, item.excerpt, item.author]
      .filter(Boolean)
      .join(" ")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase()
      .includes(needle),
  );
}
