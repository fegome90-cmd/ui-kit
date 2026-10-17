import { cn } from "@/lib/utils";
import { ICON_SHAPES, ICON_VIEWBOX, type IconName, QR_SVG } from "./icon-shapes";

// El viewBox está medido a 1 unidad = 1 px de la captura, así que el tamaño natural de cada
// ícono sale de ahí. Excepciones medidas aparte en la captura.
const NATURAL_PX: Partial<Record<IconName, [number, number]>> = { alert: [22, 22] };

function naturalSize(name: IconName): [number, number] {
  const fixed = NATURAL_PX[name];
  if (fixed) return fixed;
  const [, , w, h] = (ICON_VIEWBOX[name] ?? "0 0 24 24").split(" ").map(Number);
  return [w, h];
}

/**
 * Ícono del monitor. Sin `size` usa su tamaño natural; con `size` se dibuja cuadrado.
 * Las clases icon / icon-<nombre> se conservan como marcadores (p. ej. para has-[.icon-person]).
 */
export function Icon({
  name,
  color = "currentColor",
  size,
  className,
}: {
  name: IconName;
  color?: string;
  size?: number;
  className?: string;
}) {
  const viewBox = ICON_VIEWBOX[name] ?? "0 0 24 24";
  const shape = ICON_SHAPES[name].replaceAll("currentColor", color);
  const [w, h] = size ? [size, size] : naturalSize(name);
  return (
    <svg
      className={cn("icon", `icon-${name}`, "max-w-none", className)}
      width={w}
      height={h}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: ICON_SHAPES son constantes del código, nunca datos de usuario
      dangerouslySetInnerHTML={{ __html: shape }}
    />
  );
}

export function QrIcon() {
  return (
    <span
      className="inline-flex text-remi-qr [&_svg]:block [&_svg]:size-[23px]"
      aria-hidden="true"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: QR_SVG es una constante del código
      dangerouslySetInnerHTML={{ __html: QR_SVG }}
    />
  );
}

/** Cruz gruesa "+" de la captura (antes era el carácter "+", demasiado delgado). */
export function PlusIcon() {
  return (
    <svg
      className="icon-plus block flex-none"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.4 0h4.2v5.4H15v4.2H9.6V15H5.4V9.6H0V5.4h5.4Z" fill="#4f81bd" />
    </svg>
  );
}
