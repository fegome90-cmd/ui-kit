"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import * as React from "react";
import type { Estado } from "@/lib/lab/semantica";
import { cn } from "@/lib/utils";

// Notificaciones según las pautas de IBM Carbon (carbondesignsystem.com, Notification > Guidelines, leídas
// el 2026-10-17). Cada variante interrumpe distinto:
//   inline      en el flujo, junto a lo que afecta; persiste hasta cerrarla o resolverla.
//   toast       flotante y breve; persiste salvo que se le dé `timeout` (Carbon sugiere 5 s). Lo que diga
//               debe poder encontrarse en otro lado, porque puede desaparecer.
//   actionable  inline o toast con UNA acción; toma el foco al aparecer y persiste hasta cerrarla.
//   callout     llega con la página, va junto al contenido, no se cierra; solo info o advertencia.
// Estado = color + ícono + texto: nunca solo color. Error se anuncia como alert; el resto como status.

const ICONO: Record<Estado, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};
const NOMBRE: Record<Estado, string> = {
  info: "Información",
  success: "Éxito",
  warning: "Advertencia",
  danger: "Error",
};
const BORDE: Record<Estado, string> = {
  info: "border-l-lab-info",
  success: "border-l-lab-success",
  warning: "border-l-lab-warning",
  danger: "border-l-lab-danger",
};
// Clases escritas completas: Tailwind solo genera las que encuentra literales en el código.
const SUAVE: Record<Estado, string> = {
  info: "bg-lab-info-soft",
  success: "bg-lab-success-soft",
  warning: "bg-lab-warning-soft",
  danger: "bg-lab-danger-soft",
};
const TEXTO: Record<Estado, string> = {
  info: "text-lab-info",
  success: "text-lab-success",
  warning: "text-lab-warning",
  danger: "text-lab-danger",
};

type Variante = "inline" | "toast" | "actionable" | "callout";

type LabNotificationProps = Omit<React.ComponentProps<"div">, "title" | "role"> & {
  variant?: Variante;
  status?: Estado;
  /** Corto y sin punto final. */
  title?: string;
  /** Una o dos frases; no repite el título. */
  children?: React.ReactNode;
  /** Muestra la ×. Sin onClose no hay cierre (callout nunca lo tiene). */
  onClose?: () => void;
  /** Solo actionable: la única acción. */
  action?: { label: string; onClick: () => void };
  /** Solo toast: milisegundos hasta cerrarse solo (llama a onClose). */
  timeout?: number;
  /** Solo toast: hora en que se envió. */
  timestamp?: string;
};

function LabNotification({
  variant = "inline",
  status = "info",
  title,
  children,
  onClose,
  action,
  timeout,
  timestamp,
  className,
  ...props
}: LabNotificationProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onCloseRef = React.useRef(onClose);
  const hasOnClose = !!onClose;
  // Callout no admite éxito ni error (Carbon): se degrada a info.
  const estado: Estado = variant === "callout" && (status === "success" || status === "danger") ? "info" : status;
  const Icono = ICONO[estado];

  // Actionable toma el foco al aparecer, para que teclado y lector de pantalla lleguen a la acción.
  React.useEffect(() => {
    if (variant === "actionable") ref.current?.focus();
  }, [variant]);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (variant !== "toast" || !timeout || !hasOnClose) return;
    const t = window.setTimeout(() => onCloseRef.current?.(), timeout);
    return () => window.clearTimeout(t);
  }, [variant, timeout, hasOnClose]);

  const rol =
    variant === "callout"
      ? "note"
      : variant === "actionable"
        ? "alertdialog"
        : estado === "danger"
          ? "alert"
          : "status";
  const cerrable = variant !== "callout" && !!onClose;

  return (
    <div
      ref={ref}
      data-slot="lab-notification"
      data-variant={variant}
      data-status={estado}
      {...(variant === "actionable"
        ? ({ role: "alertdialog", "aria-label": title ?? NOMBRE[estado] } as const)
        : { role: rol })}
      tabIndex={variant === "actionable" ? -1 : undefined}
      className={cn(
        "flex items-start gap-[12px] border-l-[3px] bg-lab-surface px-[16px] py-[12px] text-[14px] text-lab-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-lab-accent",
        BORDE[estado],
        variant === "toast" ? "w-[min(100%,360px)] rounded-[8px] shadow-[0_6px_20px_rgb(0_0_0/0.16)]" : "rounded-[6px]",
        variant === "callout" ? "bg-lab-accent-soft" : "",
        variant === "inline" || variant === "actionable" ? SUAVE[estado] : "",
        className,
      )}
      {...props}
    >
      <Icono aria-hidden className={cn("mt-[2px] size-[18px] shrink-0", TEXTO[estado])} />
      <div className="grid min-w-0 flex-1 gap-[2px]">
        <p className="m-0">
          <span className="sr-only">{NOMBRE[estado]}: </span>
          {title && <strong className="font-semibold">{title}</strong>}
          {title && children ? " " : null}
          {children}
        </p>
        {timestamp && <p className="m-0 text-[12px] text-lab-muted">{timestamp}</p>}
      </div>
      {variant === "actionable" && action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 rounded-[6px] border border-lab-line px-[10px] py-[4px] text-[13px] font-semibold text-lab-ink hover:bg-lab-surface focus-visible:outline-2 focus-visible:outline-lab-accent"
        >
          {action.label}
        </button>
      )}
      {cerrable && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="-mt-[2px] -mr-[6px] grid size-[28px] shrink-0 place-items-center rounded-[6px] text-lab-muted hover:text-lab-ink focus-visible:outline-2 focus-visible:outline-lab-accent"
        >
          <X aria-hidden className="size-[16px]" />
        </button>
      )}
    </div>
  );
}

export { LabNotification };
