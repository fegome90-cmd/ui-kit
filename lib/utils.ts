import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge no conoce las escalas tipográficas propias: sin esto toma `text-rea-step-4`
// por un color y lo descarta al combinarlo con `text-rea-ink`. Cada familia que agregue
// tamaños al tema (@theme --text-*) los registra aquí.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "nav", "rea-step-1", "rea-step-2", "rea-step-3", "rea-step-4"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
