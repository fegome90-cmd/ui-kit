import { cn } from "@/lib/utils";
import { Icon } from "./icons";

const BTN =
  "flex h-[31px] min-w-0 flex-none appearance-none items-center justify-center overflow-hidden p-0 leading-none text-white shadow-none";

/**
 * Grupo de acciones de la fila: cuidados (verde/rojo) · vista cama · Atender.
 * `alert` pinta el primer botón en rojo (actividades pendientes) y lo dice en el nombre accesible.
 */
export function ActionCluster({
  alert = false,
  onCare,
  onBed,
  onAttend,
  context = "",
}: {
  alert?: boolean;
  onCare?: () => void;
  onBed?: () => void;
  onAttend?: () => void;
  /** Texto añadido a los nombres accesibles, p. ej. la cama. */
  context?: string;
}) {
  const suffix = context ? `, ${context}` : "";
  return (
    <div data-slot="action-cluster" className="flex w-[124px] items-center justify-start gap-px">
      <button
        type="button"
        className={cn(
          BTN,
          "w-8 rounded-l-[3px] border",
          alert ? "border-remi-red-border bg-remi-red" : "border-remi-green-border bg-remi-green",
        )}
        title="Actividades de cuidado"
        aria-label={`Actividades de cuidado${alert ? " con aviso" : ""}${suffix}`}
        onClick={onCare}
      >
        <Icon name="usercheck" color={alert ? "#ff3f32" : "#00cd2a"} size={28} className="block" />
      </button>
      <button
        type="button"
        className={cn(BTN, "ml-px w-[31px] rounded-none border border-remi-blue-border bg-remi-blue")}
        title="Vista cama"
        aria-label={`Vista cama${suffix}`}
        onClick={onBed}
      >
        <Icon name="bed" color="#fff" size={27} className="block" />
      </button>
      <button
        type="button"
        className={cn(
          BTN,
          "w-[58px] rounded-r-[3px] border border-remi-blue-border bg-remi-blue text-[12px] font-semibold hover:bg-remi-attend-hover",
        )}
        title="Atender"
        aria-label={`Atender${suffix}`}
        onClick={onAttend}
      >
        Atender
      </button>
    </div>
  );
}
