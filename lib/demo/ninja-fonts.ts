import type { FontCardProps } from "@/components/blocks/ninja/font-card";
import type { HeadlineFont } from "@/components/ui/ninja/animated-headline";

// Datos de muestra de la demo de Ninja: tipografías libres (Fontsource) cargadas
// en styles/ninja-demo-fonts.css. Fundiciones y precios solo ilustran el layout.
export const DEMO_FONT_CARDS: FontCardProps[] = [
  {
    name: "Fraunces",
    foundry: "Undercase Type",
    price: "$0",
    styles: 18,
    fontFamily: "'Fraunces Variable'",
    fontWeight: 400,
  },
  { name: "Archivo Black", foundry: "Omnibus-Type", price: "$0", styles: 1, fontFamily: "'Archivo Black'" },
  { name: "DM Serif Display", foundry: "Colophon", price: "$0", styles: 2, fontFamily: "'DM Serif Display'" },
];

export const DEMO_HEADLINE_FONTS: HeadlineFont[] = [
  { family: "'Fraunces Variable'", weight: 600, label: "Fraunces" },
  { family: "'Archivo Black'", label: "Archivo Black" },
  { family: "'Abril Fatface'", label: "Abril Fatface" },
  { family: "'Anybody Variable'", weight: 800, label: "Anybody" },
  { family: "'Bebas Neue'", label: "Bebas Neue" },
  { family: "'Playfair Display Variable'", weight: 800, style: "italic", label: "Playfair Display Italic" },
  { family: "'Rubik Mono One'", label: "Rubik Mono One" },
];
