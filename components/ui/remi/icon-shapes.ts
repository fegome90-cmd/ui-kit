// Iconografía redibujada en SVG para el prototipo (no son assets originales).
// Son constantes del código: es seguro inyectarlas con dangerouslySetInnerHTML.
// Nunca pasar datos de pacientes por estas funciones.

export const ICON_SHAPES = {
  // Rayo de un solo trazo en zigzag, medido sobre la captura (círculo rojo puro).
  alert:
    '<circle cx="12" cy="12" r="11" fill="#ff0000"/>' +
    '<path d="M17.28 5.4 13.65 5.4 9.91 9.36 9.91 10.9 11.45 10.9 6.61 18.93 15.74 10.02 13.54 10.02Z" fill="#fff"/>',
  person:
    '<circle cx="9" cy="5.6" r="4.3" fill="#2ecc71"/>' +
    '<path d="M1.3 20.6v-4c0-4 3.2-6.4 7.4-6.4s7.4 2.4 7.4 6.4v4Z" fill="#2ecc71"/>' +
    '<circle cx="17.2" cy="18.6" r="4.9" fill="#fff"/>' +
    '<circle cx="17.2" cy="18.6" r="3.1" fill="#fff" stroke="#2ecc71" stroke-width="1.7"/>',
  nurse:
    '<circle cx="12" cy="12" r="11" fill="#0070c0"/>' +
    '<path d="M8 8.6Q8 7 9.6 7h4.8Q16 7 16 8.6V12h1v2h1v2.2h-3v.9H9v-.9H6V14h1v-2h1Z" fill="#fff"/>' +
    '<path d="M12 7.8v2.7M10.65 9.15h2.7" stroke="#0070c0" stroke-width="1"/>' +
    '<path d="M9 12h6v1.6c0 1.7-1.3 2.7-3 2.7s-3-1-3-2.7Z" fill="#0070c0"/>',
  stethoscope:
    '<circle cx="12" cy="12" r="11" fill="#0070c0"/>' +
    '<path d="M7 6.2v5.5a2.5 2.5 0 0 0 5 0V6.2M9.5 14.2v.9a1.6 1.6 0 0 0 1.6 1.6h3.8a1.6 1.6 0 0 0 1.6-1.6v-4.6" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>' +
    '<circle cx="16.6" cy="9.6" r="1.5" fill="#fff"/>',
  chat:
    '<path d="M2.6 1h14.8A1.6 1.6 0 0 1 19 2.6v11.8a1.6 1.6 0 0 1-1.6 1.6H11l-4 3.2V16H2.6A1.6 1.6 0 0 1 1 14.4V2.6A1.6 1.6 0 0 1 2.6 1Z" fill="#2ecc71"/>' +
    '<path d="M5.5 6h9v1.1h-9Z" fill="#fff"/><path d="M6 9h5v2H6Z" fill="#fff" opacity=".55"/>',
  hc:
    '<path d="M4.6 1h14.8Q21 1 21 2.6V14H3V2.6Q3 1 4.6 1Zm.4 2.2v8.8h14V3.2Z" fill="#f1c40f" fill-rule="evenodd"/>' +
    '<path d="M11 5h2v2h2v2h-2v2h-2V9H9V7h2Z" fill="#f1c40f"/>' +
    '<path d="M1 16h9v1h4v-1h9v2l-1.2 1H2.2L1 18Z" fill="#f1c40f"/>',
  heart:
    '<rect x=".5" y=".5" width="33" height="32" rx="3" fill="#ffc100" stroke="#f0a800" stroke-width="1"/>' +
    '<path d="M17.5 9C15.5 5.5 12 4.6 9.5 5.6 6.5 6.8 5 9.5 5.2 12.5 5.5 15.5 7.5 17.5 10 20l7.5 7 7.5-7c2.5-2.5 4.5-4.5 4.8-7.5.2-3-1.3-5.7-4.3-6.9-2.5-1-6-.1-8 3.4Z" fill="none" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/>' +
    '<path d="M5.4 15.5H9l3-5 5.5 8 4.5-7.5 3 4.5h4.4" fill="none" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>',
  tick:
    '<circle cx="14.5" cy="14.5" r="13.5" fill="#27ae60"/>' +
    '<path d="m9.4 14.9 4.1 3.7 6.7-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  requests:
    '<path d="M3 1h3.8v2.6H3Zm5.3 0h4.4v2.6H8.3ZM3 15h3.8v2.8H3Zm5.3 0h4v2.8h-4Z" fill="#2c3e50"/>' +
    '<circle cx="5" cy="10" r="3" fill="none" stroke="#2c3e50" stroke-width="1.8"/>' +
    '<path d="M5 8.7v2.6M3.7 10h2.6" stroke="#2c3e50" stroke-width="1.1"/>' +
    '<path d="M10 5.6v7.8M12.7 5.6v7.8M9.4 5.6h3.9" fill="none" stroke="#2c3e50" stroke-width="1.4"/>' +
    '<path d="M13.4 2.2 17.3 1l3.8 15-4.9.9Z" fill="none" stroke="#2c3e50" stroke-width="1.5" stroke-linejoin="round"/>',
  glass:
    '<circle cx="8.6" cy="9.9" r="6.7" fill="none" stroke="#2c3e50" stroke-width="3.1"/>' +
    '<path d="m14 15.4 6.6 6.2" stroke="#2c3e50" stroke-width="3" stroke-linecap="round"/>',
  bed:
    '<path d="M2 5.5v17h2.25v-3h16.25v3h2.25V14H4.25V5.5Z" fill="#fff"/>' +
    '<path d="M4.75 10.45q.75-2.7 3.6-2.7h2.25l1.3 2.7H21v2.8H4.75Z" fill="#fff"/>' +
    '<path d="M4.5 12.6h16.5" stroke="#0876cf" stroke-width=".75"/>',
  usercheck:
    '<path d="M7.2 9c0-2.8 2.1-4.3 5.3-4.3s5.3 1.5 5.3 4.3v3.2c0 2.7.7 4.3 1.8 5.8l-4.1 1.1h-6L5.4 18c1.1-1.5 1.8-3.1 1.8-5.8Z" fill="#fff" data-icon-detail="nurse-hair"/>' +
    '<path d="m7.3 7.5 5.2-3 5.2 3-.6 4.1H7.9Z" fill="#fff" data-icon-detail="nurse-cap"/>' +
    '<path d="M11.7 6.8h1.6v1.4h1.4v1.6h-1.4v1.4h-1.6V9.8h-1.4V8.2h1.4Z" fill="currentColor"/>' +
    '<path d="M8.8 12.9h7.4v1.3c0 2.5-1.5 4.1-3.7 4.1s-3.7-1.6-3.7-4.1Z" fill="currentColor" data-icon-detail="nurse-face"/>' +
    '<path d="m8.3 19.7 4.2 3.5 4.2-3.5c3.6 1 5.3 3.3 5.4 7.4H2.9c.1-4.1 1.8-6.4 5.4-7.4Z" fill="#fff" data-icon-detail="nurse-uniform"/>' +
    '<circle cx="24.1" cy="22.8" r="6.8" fill="#fff" stroke="currentColor" stroke-width="1.15" data-icon-detail="nurse-clock"/>' +
    '<path d="M24.1 19.15v4.2h2.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter"/>',
  library:
    '<rect x="4" y="4" width="3" height="16" fill="#314658"/><rect x="10" y="4" width="3" height="16" fill="#314658"/>',
} as const;

export type IconName = keyof typeof ICON_SHAPES;

/** viewBox de cada ícono (1 unidad = 1 px de la captura). Por defecto 24×24. */
export const ICON_VIEWBOX: Partial<Record<IconName, string>> = {
  person: "0 0 22 24",
  chat: "0 0 20 20",
  hc: "0 0 24 20",
  heart: "0 0 34 33",
  tick: "0 0 29 29",
  requests: "0 0 24 20",
  usercheck: "0 0 32 32",
};

// QR medido sobre la captura: marcos de 3 px con hueco de 3 px (sin punto central).
export const QR_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
<path fill-rule="evenodd" fill="currentColor" d="M1 1.5h9v9H1Zm3 3v3h3v-3ZM13 1.5h9v9h-9Zm3 3v3h3v-3ZM1 13.5h9v9H1Zm3 3v3h3v-3Z"/>
<path fill="currentColor" d="M13 13.5h4V15h3v-1.5h2v5h-.8v1H18v-1h-2.8v4H13Z"/>
<path fill="currentColor" opacity=".6" d="M18 20.8h1.6v1.4H18Zm3 0h1.6v1.4H21Z"/></svg>`;
