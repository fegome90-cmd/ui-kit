/* Íconos de los diálogos de escala y de la pantalla de Indicaciones.
   Redibujados en SVG desde las capturas de referencia (no son assets originales). */

type P = { size?: number; className?: string };
const svg = (vb: string, size: number, className: string | undefined, children: React.ReactNode) => (
  <svg viewBox={vb} width={size} height={size} className={className} aria-hidden="true" focusable="false">
    {children}
  </svg>
);

/** Círculo con "i" (información del ítem). */
export const InfoIcon = ({ size = 18, className }: P) =>
  svg(
    "0 0 18 18",
    size,
    className,
    <>
      <circle cx="9" cy="9" r="7.9" fill="#fff" stroke="#111" strokeWidth="1.6" />
      <circle cx="9" cy="5.1" r="1.25" fill="#111" />
      <path d="M7.2 7.6h2.8v5.2h1.2v1.3H6.9v-1.3h1.2V8.9h-.9Z" fill="#111" />
    </>,
  );

/** Chevron en círculo gris claro (desplegar ítem). */
export const ChevronCircle = ({ size = 13, className, open = false }: P & { open?: boolean }) =>
  svg(
    "0 0 13 13",
    size,
    className,
    <>
      <circle cx="6.5" cy="6.5" r="5.9" fill="#fafafa" stroke="#c9c9c9" strokeWidth=".9" />
      <path
        d={open ? "m4.2 7.6 2.3-2.3 2.3 2.3" : "m4.2 5.4 2.3 2.3 2.3-2.3"}
        fill="none"
        stroke="#7d7d7d"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  );

/** Disquete (botón Guardar). */
export const SaveIcon = ({ size = 16, className }: P) =>
  svg(
    "0 0 16 16",
    size,
    className,
    <>
      <path d="M1 1h11.5L15 3.5V15H1Z" fill="#2f9bff" />
      <path d="M4 1h7v4.6H4Z" fill="#fff" />
      <path d="M8.6 1.8h1.6v3H8.6Z" fill="#2f9bff" />
      <path d="M3.4 9h9.2v6H3.4Z" fill="#cfe8ff" />
    </>,
  );

/** Flecha en círculo (paginador). */
export const ArrowCircle = ({ size = 20, className, dir = "left" }: P & { dir?: "left" | "right" }) =>
  svg(
    "0 0 20 20",
    size,
    className,
    <>
      <circle cx="10" cy="10" r="9" fill="#fff" />
      <path
        d={dir === "left" ? "M10.6 5.3 5.9 10l4.7 4.7M6.3 10h8" : "M9.4 5.3 14.1 10l-4.7 4.7M13.7 10h-8"}
        fill="none"
        stroke="#0075dd"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  );

/** Calendario (campo de fecha). */
export const CalendarIcon = ({ size = 18, className }: P) =>
  svg(
    "0 0 18 18",
    size,
    className,
    <>
      <rect x="1.5" y="3" width="15" height="13.5" rx="1.5" fill="#fff" stroke="#9a9a9a" />
      <path d="M1.5 6.5h15" stroke="#9a9a9a" />
      <path d="M5 1.5v3M13 1.5v3" stroke="#9a9a9a" strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M4 9h1.6M8.2 9h1.6M12.4 9H14M4 11.5h1.6M8.2 11.5h1.6M12.4 11.5H14M4 14h1.6M8.2 14h1.6"
        stroke="#b4b4b4"
        strokeWidth="1.2"
      />
    </>,
  );

/** Chevron blanco para botones de selección. */
export const ChevronDown = ({ size = 14, className }: P) =>
  svg(
    "0 0 14 14",
    size,
    className,
    <path
      d="m2.5 4.8 4.5 4.5 4.5-4.5"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );

/** Burbuja de comentario; `highlight` = naranja (hay comentario). */
export const CommentIcon = ({ size = 26, className, highlight = false }: P & { highlight?: boolean }) =>
  svg(
    "0 0 26 26",
    size,
    className,
    <>
      <path
        d="M4 3h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9l-4.5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        fill={highlight ? "#f39c12" : "#2c3e50"}
      />
      <path d="M7 8.5h12M7 12.5h7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </>,
  );

/** Burbuja oscura con lápiz (editar indicación). */
export const EditBubbleIcon = ({ size = 26, className }: P) =>
  svg(
    "0 0 26 26",
    size,
    className,
    <>
      <path d="M4 3h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9l-4.5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="#2c3e50" />
      <path d="m9.3 15.2.5-2.6 6.4-6.4 2.1 2.1-6.4 6.4Z" fill="#fff" />
    </>,
  );

/** Cuadro con lápiz (indicación confirmada, pendiente de validar). */
export const EditSquareIcon = ({ size = 28, className }: P) =>
  svg(
    "0 0 28 28",
    size,
    className,
    <>
      <path
        d="M15 5H5.5A2.5 2.5 0 0 0 3 7.5v15A2.5 2.5 0 0 0 5.5 25h15a2.5 2.5 0 0 0 2.5-2.5V13"
        fill="none"
        stroke="#2c3e50"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="m10 18.2.9-4.3L21.7 3.1l3.4 3.4-10.8 10.8Z" fill="#2c3e50" />
    </>,
  );

/** Check verde en círculo (validado / administrado). */
export const CheckCircle = ({ size = 28, className }: P) =>
  svg(
    "0 0 28 28",
    size,
    className,
    <>
      <circle cx="14" cy="14" r="13" fill="#2ecc71" />
      <path
        d="m8 14.4 4.2 4.1 8-8.3"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  );

/** X roja en círculo (no administrado). */
export const XCircle = ({ size = 18, className }: P) =>
  svg(
    "0 0 18 18",
    size,
    className,
    <>
      <circle cx="9" cy="9" r="8.5" fill="#e74c3c" />
      <path d="m6 6 6 6M12 6l-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </>,
  );

/** Reloj (dosis programada). */
export const ClockIcon = ({ size = 18, className }: P) =>
  svg(
    "0 0 18 18",
    size,
    className,
    <>
      <circle cx="9" cy="9" r="7.6" fill="none" stroke="#34495e" strokeWidth="1.9" />
      <path d="M8.6 4.8v4.6l2.7 2" fill="none" stroke="#34495e" strokeWidth="1.9" strokeLinecap="round" />
    </>,
  );

/** Flechas opuestas rojas (cambio / intercambio en la indicación). */
export const SwapIcon = ({ size = 24, className }: P) =>
  svg(
    "0 0 24 24",
    size,
    className,
    <path
      d="M20 7.5H5m4-4-4 4 4 4M4 16.5h15m-4-4 4 4-4 4"
      fill="none"
      stroke="#a52a2a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );

/** Rombo gris con flecha (re-programar). */
export const RescheduleIcon = ({ size = 24, className }: P) =>
  svg(
    "0 0 24 24",
    size,
    className,
    <>
      <path d="M12 1.5 22.5 12 12 22.5 1.5 12Z" fill="#4d5866" />
      <path
        d="M8 15.5v-2.2a2.3 2.3 0 0 1 2.3-2.3h5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="m13.4 8.6 2.6 2.4-2.6 2.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  );

/** "H" blanca en cuadro (cabecera de horas). */
export const HourSquare = ({ size = 16, className }: P) =>
  svg(
    "0 0 16 16",
    size,
    className,
    <>
      <rect x=".5" y=".5" width="15" height="15" rx="2" fill="#fff" />
      <path d="M4.5 3.5v9M11.5 3.5v9M4.5 8h7" stroke="#0070c0" strokeWidth="2.3" />
    </>,
  );
