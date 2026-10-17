"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/rea/use-reduced-motion";
import { cn } from "@/lib/utils";
import { useReaTheme } from "./rea-theme";

// Terreno topográfico del hero de REA (site-concept.html v4, initTerrain e initTerrain2D): curvas de nivel
// de un ruido fractal de 5 octavas que derivan unos segundos al cargar y levantan una colina bajo el
// puntero; las curvas de la colina toman el acento. WebGL2 con respaldo en Canvas 2D.
// Cambios respecto del original: los colores salen de --rea-ink y --rea-accent del contenedor (no de
// :root), el puntero se escucha en el elemento padre (en el sitio era #portada) y todo se libera al
// desmontar. Decorativo: aria-hidden y sin eventos de puntero propios.

/** "#0e0e0d" o "#0e0" → [r, g, b] entre 0 y 1. Un valor que no es hex da negro. */
export function rgbDeHex(hex: string): [number, number, number] {
  let h = hex.trim().replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((x) => x + x)
      .join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return [0, 0, 0];
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

const VERTEX = `#version 300 es
in vec2 pos;void main(){gl_Position=vec4(pos,0.0,1.0);}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 resolution,mouse; uniform float seconds,pressure;uniform vec3 ink,accent;
out vec4 result;
float rnd(vec2 v){return fract(sin(dot(v,vec2(53.71,87.29)))*43758.33);}
float smoothNoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1.,0.)),u.x),mix(rnd(i+vec2(0.,1.)),rnd(i+vec2(1.,1.)),u.x),u.y);}
float fractal(vec2 p){float total=0.,strength=.5;for(int n=0;n<5;n++){total+=smoothNoise(p)*strength;p=p*2.03+11.7;strength*=.5;}return total;}
float isoline(float h,float width){float cell=abs(fract(h+.5)-.5);return 1.-smoothstep(0.,fwidth(h)*width,cell);}
void main(){vec2 p=gl_FragCoord.xy/resolution.y;vec2 m=mouse/resolution.y;float radius=distance(p,m);float hill=exp(-radius*radius*5.2)*pressure;
float elevation=fractal(p*1.35+seconds*vec2(.017,.012))+hill*.53;
float scaled=elevation*18.;float minor=isoline(scaled,1.2);float major=isoline(scaled/5.,2.);float stripes=step(.5,fract(scaled*.5));
float fade=(smoothstep(.25,.85,gl_FragCoord.x/resolution.x)*.85+.15)*smoothstep(0.,.3,gl_FragCoord.y/resolution.y);
float strength=clamp(minor*.34+major*.62+hill*minor*.5+stripes*hill*.10,0.,1.)*fade;
vec3 tone=mix(ink,accent,clamp(hill*1.8,0.,1.));result=vec4(tone,strength*.34);
}`;

type Colores = () => { ink: string; accent: string };

/** Arranca el terreno en `canvas`. Devuelve la limpieza y una función para releer los colores. */
function iniciarTerreno(canvas: HTMLCanvasElement, colores: Colores, interactive: boolean) {
  const host = canvas.parentElement ?? canvas;
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false });
  return gl ? terrenoGL(canvas, gl, host, colores, interactive) : terreno2D(canvas, host, colores, interactive);
}

function terrenoGL(
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  host: HTMLElement,
  colores: Colores,
  interactive: boolean,
) {
  const nada = { limpiar: () => {}, recolorear: () => {} };
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const a = shader(gl.VERTEX_SHADER, VERTEX);
  const b = shader(gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!a || !b || !program) return nada;
  gl.attachShader(program, a);
  gl.attachShader(program, b);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return nada;
  // biome-ignore lint/correctness/useHookAtTopLevel: es WebGL (gl.useProgram), no un hook de React.
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "pos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(
    ["resolution", "mouse", "seconds", "pressure", "ink", "accent"].map((n) => [n, gl.getUniformLocation(program, n)]),
  );

  const recolorear = () => {
    const c = colores();
    gl.uniform3fv(u.ink, rgbDeHex(c.ink));
    gl.uniform3fv(u.accent, rgbDeHex(c.accent));
    schedule();
  };

  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  let mX = -10000;
  let mY = -10000;
  let tX = -10000;
  let tY = -10000;
  let pull = 0;
  let want = 0;
  let frame = 0;
  let last = performance.now();
  let clock = 0;
  let until = last + 4000;

  function loop(now: number) {
    frame = 0;
    const dt = Math.min(50, now - last) / 1000;
    last = now;
    // El terreno deriva 4 s al cargar y se detiene suavemente; el puntero lo reactiva 1,5 s.
    const fading = Math.max(0, Math.min(1, (until + 1000 - now) / 1000)) ** 2;
    clock += dt * fading;
    mX += (tX - mX) * 0.08;
    mY += (tY - mY) * 0.08;
    pull += (want - pull) * 0.04;
    gl.uniform2f(u.mouse, mX, mY);
    gl.uniform1f(u.pressure, pull);
    gl.uniform1f(u.seconds, clock);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (now < until + 1000 || Math.abs(want - pull) > 0.002 || Math.abs(tX - mX) + Math.abs(tY - mY) > 1) schedule();
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(loop);
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width * ratio));
    canvas.height = Math.max(1, Math.round(r.height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.resolution, canvas.width, canvas.height);
    schedule();
  }
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    tX = (e.clientX - r.left) * ratio;
    tY = (r.bottom - e.clientY) * ratio;
    if (mX < -5000) {
      mX = tX;
      mY = tY;
    }
    want = 1;
    until = performance.now() + 1500;
    schedule();
  };
  const onLeave = () => {
    want = 0;
    schedule();
  };

  recolorear();
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  if (interactive) {
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
  }
  return {
    recolorear,
    limpiar: () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    },
  };
}

function terreno2D(canvas: HTMLCanvasElement, host: HTMLElement, colores: Colores, interactive: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { limpiar: () => {}, recolorear: () => {} };
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  let pw = 0;
  let ph = 0;
  let x = -20000;
  let y = -20000;
  let px = -20000;
  let py = -20000;
  let pull = 0;
  let target = 0;
  let frame = 0;
  let life = performance.now() + 3600;
  let last = performance.now();
  let phase = 0;
  let visible = true;
  let { ink, accent } = colores();

  const curva = (xx: number, lane: number, base: number) =>
    base +
    28 * Math.sin(xx * 0.0047 + lane * 0.33 + phase * 0.015) +
    11 * Math.sin(xx * 0.0106 + lane * 0.83 + phase * 0.015);

  function draw(now: number) {
    frame = 0;
    if (!visible || document.hidden || !ctx) return;
    const dt = Math.min(50, now - last) / 1000;
    last = now;
    phase += dt * Math.max(0, Math.min(1, (life + 1000 - now) / 1000));
    x += (px - x) * 0.08;
    y += (py - y) * 0.08;
    pull += (target - pull) * 0.04;
    ctx.clearRect(0, 0, pw, ph);
    for (let lane = 0; lane < 28; lane++) {
      const base = ((lane + 1) * ph) / 30;
      for (let i = 0; i < Math.ceil(pw / 20); i++) {
        const xx = i * 20;
        const yy = curva(xx, lane, base);
        const hill = Math.exp(-(Math.hypot(xx - x, yy - y) ** 2) / 120000) * pull;
        const nextX = Math.min(pw, xx + 20);
        const nextY = curva(nextX, lane, base);
        const hill2 = Math.exp(-(Math.hypot(nextX - x, nextY - y) ** 2) / 120000) * pull;
        const sY = yy - hill * 62;
        const fX = Math.max(0.03, Math.min(1, (xx / pw - 0.21) / 0.64));
        const fY = Math.max(0.05, Math.min(1, (1 - sY / ph) / 0.29));
        ctx.strokeStyle = hill > 0.27 ? accent : ink;
        ctx.globalAlpha = fX * fY * (lane % 5 === 0 ? 0.43 : 0.19);
        ctx.lineWidth = lane % 5 === 0 ? 1.2 : 0.7;
        ctx.beginPath();
        ctx.moveTo(xx, sY);
        ctx.lineTo(nextX, nextY - hill2 * 62);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (now < life + 1000 || Math.abs(target - pull) > 0.002 || Math.abs(px - x) + Math.abs(py - y) > 0.5)
      requestDraw();
  }
  function requestDraw() {
    if (!frame && visible) frame = requestAnimationFrame(draw);
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    pw = r.width;
    ph = r.height;
    canvas.width = Math.max(1, Math.round(pw * ratio));
    canvas.height = Math.max(1, Math.round(ph * ratio));
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    requestDraw();
  }
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    px = e.clientX - r.left;
    py = e.clientY - r.top;
    if (x < -1000) {
      x = px;
      y = py;
    }
    target = 1;
    life = performance.now() + 1500;
    requestDraw();
  };
  const onLeave = () => {
    target = 0;
    requestDraw();
  };

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
  });
  io.observe(host);
  if (interactive) {
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
  }
  return {
    recolorear: () => {
      ({ ink, accent } = colores());
      requestDraw();
    },
    limpiar: () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    },
  };
}

type ReaTerrainProps = Omit<React.ComponentProps<"canvas">, "children"> & {
  /** Si el puntero levanta la colina. Sin interacción, el terreno solo deriva al cargar. */
  interactive?: boolean;
  /** Dónde corre. Por defecto, como en el original: puntero fino y al menos 900 px de ancho. */
  media?: string;
};

/**
 * Fondo animado de REA. Va dentro de un contenedor `relative isolate` (y dentro de ReaProvider): ocupa
 * todo el contenedor detrás del contenido. Con movimiento reducido no se dibuja.
 */
function ReaTerrain({
  interactive = true,
  media = "(pointer: fine) and (min-width: 900px)",
  className,
  ...props
}: ReaTerrainProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { theme, accent } = useReaTheme();
  const [ready, setReady] = React.useState(false);
  const recolorear = React.useRef<() => void>(() => {});
  // La media query se sigue en vivo: al cruzar el umbral (ensanchar o achicar), el terreno arranca o se limpia.
  const [cumple, setCumple] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia(media);
    setCumple(mq.matches);
    const on = () => setCumple(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [media]);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced || !cumple) return;
    const colores = () => {
      const cs = getComputedStyle(canvas);
      return { ink: cs.getPropertyValue("--rea-ink"), accent: cs.getPropertyValue("--rea-accent") };
    };
    const terreno = iniciarTerreno(canvas, colores, interactive);
    recolorear.current = terreno.recolorear;
    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      cancelAnimationFrame(id);
      terreno.limpiar();
      recolorear.current = () => {};
      setReady(false);
    };
  }, [reduced, cumple, interactive]);

  // El tema o el acento cambian los tokens del contenedor: se releen sin rearmar el terreno.
  // biome-ignore lint/correctness/useExhaustiveDependencies: theme y accent son el disparador.
  React.useEffect(() => {
    recolorear.current();
  }, [theme, accent]);

  return (
    <canvas
      ref={ref}
      data-slot="rea-terrain"
      data-ready={ready || undefined}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 size-full opacity-0 transition-opacity duration-[2s] ease-rea-out data-[ready]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export { ReaTerrain };
