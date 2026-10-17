// Geometría de los gráficos de Lab (series destacadas, distribución, rueda de categorías). Puro y sin
// dependencias: el SVG lo arma cada componente.

export type Punto = [number, number];

/** Escala lineal de [d0, d1] a [r0, r1]. Con dominio de ancho cero devuelve el centro del rango. */
export function escala(d0: number, d1: number, r0: number, r1: number) {
  return (v: number) => (d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));
}

/** Mínimo y máximo de valores finitos. Sin valores, [0, 1]. */
export function extension(valores: ReadonlyArray<number>): [number, number] {
  const v = valores.filter(Number.isFinite);
  return v.length ? [Math.min(...v), Math.max(...v)] : [0, 1];
}

const f = (n: number) => +n.toFixed(2);

/** Polilínea SVG. */
export function trazoLinea(puntos: ReadonlyArray<Punto>): string {
  return puntos.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join("");
}

/**
 * Curva suave que pasa por todos los puntos (Catmull-Rom a Bézier). `tension` 0 da una polilínea.
 * Los puntos de control se acotan al rango vertical de sus vecinos para no inventar picos.
 */
export function trazoSuave(puntos: ReadonlyArray<Punto>, tension = 0.5): string {
  if (puntos.length < 3 || tension === 0) return trazoLinea(puntos);
  let d = `M${f(puntos[0][0])} ${f(puntos[0][1])}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;
    const lo = Math.min(p1[1], p2[1]);
    const hi = Math.max(p1[1], p2[1]);
    const c1: Punto = [p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2, p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2];
    const c2: Punto = [p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2, p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2];
    c1[1] = Math.min(hi, Math.max(lo, c1[1]));
    c2[1] = Math.min(hi, Math.max(lo, c2[1]));
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** Área bajo una curva suave hasta la línea base `y0`. */
export function trazoArea(puntos: ReadonlyArray<Punto>, y0: number, tension = 0.5): string {
  if (!puntos.length) return "";
  const ultimo = puntos[puntos.length - 1];
  return `${trazoSuave(puntos, tension)}L${f(ultimo[0])} ${f(y0)}L${f(puntos[0][0])} ${f(y0)}Z`;
}

/** Hasta `n` marcas «redondas» (1, 2 o 5 × 10^k) que cubren [min, max]. */
export function marcas(min: number, max: number, n = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [min];
  const crudo = (max - min) / Math.max(1, n);
  const pot = 10 ** Math.floor(Math.log10(crudo));
  // Tolerancia: (0,9 - 0,3) / 3 da 0,20000000000000004 y saltaría al paso 0,5.
  const paso = [1, 2, 5, 10].map((m) => m * pot).find((p) => p >= crudo * (1 - 1e-9)) ?? 10 * pot;
  const res: number[] = [];
  for (let v = Math.ceil(min / paso) * paso; v <= max + paso * 1e-9; v += paso) res.push(+v.toFixed(10));
  return res;
}

/**
 * Marcas para un eje: como `marcas`, pero redondeando hacia afuera para que el eje cubra todo el dato
 * (con marcas(0, 38) el eje terminaría en 30 y la serie se saldría del gráfico).
 */
export function marcasEje(min: number, max: number, n = 5): number[] {
  const m = marcas(min, max, n);
  if (m.length < 2) return m;
  const paso = m[1] - m[0];
  const desde = Math.floor(min / paso) * paso;
  const hasta = Math.ceil(max / paso - 1e-9) * paso;
  const res: number[] = [];
  for (let v = desde; v <= hasta + paso * 1e-9; v += paso) res.push(+v.toFixed(10));
  return res;
}

/**
 * Índice de color (1 a `n`) para la categoría `i` de `total`, en una rueda: cicla los colores, pero la
 * última no repite el de la primera, porque son vecinas.
 */
export function colorCategoria(i: number, total: number, n = 5): number {
  const c = (i % n) + 1;
  return i === total - 1 && total > n && c === 1 ? 2 : c;
}

/** Ángulos (radianes, 0 = las 12, horario) de `n` sectores iguales con un hueco de `hueco` radianes. */
export function sectores(n: number, hueco = 0.04): { inicio: number; fin: number; medio: number }[] {
  const paso = (2 * Math.PI) / Math.max(1, n);
  return Array.from({ length: n }, (_, i) => {
    const inicio = i * paso + hueco / 2;
    const fin = (i + 1) * paso - hueco / 2;
    return { inicio, fin, medio: (inicio + fin) / 2 };
  });
}

/** Punto sobre un círculo en el ángulo dado (0 = las 12). */
export function polar(cx: number, cy: number, r: number, a: number): Punto {
  return [f(cx + r * Math.sin(a)), f(cy - r * Math.cos(a))];
}

/**
 * Tramo logarítmico con signo, como la leyenda de Voices (explore-the-data: 0, 100, 1k, 10k, 100k, 1M+).
 * 0 = sin dato o cero; ±1 = menos de 100; ±2 = 100–999; ±3 = 1k–9,9k; ±4 = 10k–99,9k; ±5 = 100k o más.
 */
export function tramoLog(v: number): number {
  if (!Number.isFinite(v) || v === 0) return 0;
  const a = Math.abs(v);
  const t = a < 100 ? 1 : a < 1e3 ? 2 : a < 1e4 ? 3 : a < 1e5 ? 4 : 5;
  return Math.sign(v) * t;
}

/** Opacidad de cada tramo, medida en la leyenda de Voices. */
export const OPACIDAD_TRAMO = [0, 0.15, 0.3, 0.5, 0.68, 0.85] as const;

export interface Celda {
  i: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Treemap «squarified» (Bruls, Huizing y van Wijk, 2000): reparte el rectángulo en celdas de área
 * proporcional a cada valor, buscando que sean lo más cuadradas posible para poder compararlas. Devuelve
 * las celdas en el orden de entrada (`i` es el índice original). Valores ≤ 0 o no finitos no ocupan área.
 */
export function squarify(valores: ReadonlyArray<number>, x: number, y: number, w: number, h: number): Celda[] {
  const items = valores
    .map((v, i) => ({ i, v: Number.isFinite(v) && v > 0 ? v : 0 }))
    .filter((it) => it.v > 0)
    .sort((a, b) => b.v - a.v);
  const total = items.reduce((s, it) => s + it.v, 0);
  if (!total || w <= 0 || h <= 0) return [];
  const escalaArea = (w * h) / total;
  const areas = items.map((it) => ({ i: it.i, a: it.v * escalaArea }));
  const res: Celda[] = [];
  let r = { x, y, w, h };
  const peor = (fila: { a: number }[], lado: number) => {
    const s = fila.reduce((acc, f) => acc + f.a, 0);
    const max = Math.max(...fila.map((f) => f.a));
    const min = Math.min(...fila.map((f) => f.a));
    return Math.max((lado * lado * max) / (s * s), (s * s) / (lado * lado * min));
  };
  const colocar = (fila: { i: number; a: number }[]) => {
    const s = fila.reduce((acc, f) => acc + f.a, 0);
    if (r.w >= r.h) {
      // Columna a la izquierda, de alto completo.
      const ancho = s / r.h;
      let yy = r.y;
      for (const f of fila) {
        const alto = f.a / ancho;
        res.push({ i: f.i, x: r.x, y: yy, w: ancho, h: alto });
        yy += alto;
      }
      r = { x: r.x + ancho, y: r.y, w: r.w - ancho, h: r.h };
    } else {
      // Fila arriba, de ancho completo.
      const alto = s / r.w;
      let xx = r.x;
      for (const f of fila) {
        const ancho = f.a / alto;
        res.push({ i: f.i, x: xx, y: r.y, w: ancho, h: alto });
        xx += ancho;
      }
      r = { x: r.x, y: r.y + alto, w: r.w, h: r.h - alto };
    }
  };
  let fila: { i: number; a: number }[] = [];
  for (const it of areas) {
    const lado = Math.min(r.w, r.h);
    if (!fila.length || peor([...fila, it], lado) <= peor(fila, lado)) fila.push(it);
    else {
      colocar(fila);
      fila = [it];
    }
  }
  if (fila.length) colocar(fila);
  return res.sort((a, b) => a.i - b.i);
}
