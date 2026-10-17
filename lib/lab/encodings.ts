// Codificaciones de magnitud para EncodingCompare (familia Lab). Mecanismo observado en Google Data GIF
// Maker (evidencia/2026-10-17-data-gif-maker): la misma tabla como círculos, dona o rectángulos.
// Ojo: no responden la misma pregunta. Longitud y área comparan cada valor con el mayor; el arco
// muestra la parte de cada valor en el total.

export interface Dato {
  label: string;
  value: number;
}

export const ENCODINGS = ["length", "area", "arc"] as const;
export type Encoding = (typeof ENCODINGS)[number];

/** Valores negativos o no finitos no tienen longitud, área ni arco: se tratan como 0. */
const limpio = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

/** Longitud: fracción del valor mayor (0–1). Es la codificación que mejor se compara a ojo. */
export function longitudes(datos: ReadonlyArray<Dato>): number[] {
  const max = Math.max(0, ...datos.map((d) => limpio(d.value)));
  return datos.map((d) => (max ? limpio(d.value) / max : 0));
}

/**
 * Área: radio relativo (0–1) para que el ÁREA del círculo sea proporcional al valor. Escalar el radio
 * directamente exageraría las diferencias al cuadrado.
 */
export function radios(datos: ReadonlyArray<Dato>): number[] {
  return longitudes(datos).map(Math.sqrt);
}

/** Arco: ángulos en radianes desde las 12, en sentido horario, como parte del total. */
export function arcos(datos: ReadonlyArray<Dato>): { inicio: number; fin: number; parte: number }[] {
  const total = datos.reduce((s, d) => s + limpio(d.value), 0);
  let acumulado = 0;
  return datos.map((d) => {
    const parte = total ? limpio(d.value) / total : 0;
    const inicio = acumulado * 2 * Math.PI;
    acumulado += parte;
    return { inicio, fin: acumulado * 2 * Math.PI, parte };
  });
}

/** Trazo SVG de un sector de anillo entre dos ángulos (0 = las 12). */
export function trazoArco(cx: number, cy: number, rExt: number, rInt: number, inicio: number, fin: number): string {
  // Un arco de 360° no se puede dibujar con un solo comando: se resta un epsilon.
  const f = fin - inicio >= 2 * Math.PI ? inicio + 2 * Math.PI - 1e-4 : fin;
  const punto = (r: number, a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)].map((n) => +n.toFixed(3));
  const grande = f - inicio > Math.PI ? 1 : 0;
  const [x1, y1] = punto(rExt, inicio);
  const [x2, y2] = punto(rExt, f);
  const [x3, y3] = punto(rInt, f);
  const [x4, y4] = punto(rInt, inicio);
  return `M${x1} ${y1}A${rExt} ${rExt} 0 ${grande} 1 ${x2} ${y2}L${x3} ${y3}A${rInt} ${rInt} 0 ${grande} 0 ${x4} ${y4}Z`;
}
