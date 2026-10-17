import { ICON_SHAPES, ICON_VIEWBOX, type IconName, QR_SVG } from "./icon-shapes";

export function Icon({ name, color = "currentColor", size = 23 }: { name: IconName; color?: string; size?: number }) {
  const viewBox = ICON_VIEWBOX[name] ?? "0 0 24 24";
  const shape = ICON_SHAPES[name].replaceAll("currentColor", color);
  return (
    <svg
      className={`icon icon-${name}`}
      width={size}
      height={size}
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
      style={{ display: "inline-flex" }}
      aria-hidden="true"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: QR_SVG es una constante del código
      dangerouslySetInnerHTML={{ __html: QR_SVG }}
    />
  );
}

/** Cruz gruesa "+" de la captura (antes era el carácter "+", demasiado delgado). */
export function PlusIcon() {
  return (
    <svg className="icon-plus" width="15" height="15" viewBox="0 0 15 15" aria-hidden="true" focusable="false">
      <path d="M5.4 0h4.2v5.4H15v4.2H9.6V15H5.4V9.6H0V5.4h5.4Z" fill="#4f81bd" />
    </svg>
  );
}
