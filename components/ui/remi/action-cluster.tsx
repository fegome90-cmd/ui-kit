import { Icon } from "./icons";

/**
 * Grupo de acciones de la fila: cuidados (verde/rojo) · vista cama · Atender.
 * `alert` pinta el primer botón en rojo (actividades pendientes).
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
    <div className="action-cluster">
      <button
        type="button"
        className={alert ? "action-red" : "action-green"}
        title="Actividades de cuidado"
        aria-label={`Actividades de cuidado${alert ? " con aviso" : ""}${suffix}`}
        onClick={onCare}
      >
        <Icon name="usercheck" color={alert ? "#ff3f32" : "#00cd2a"} size={25} />
      </button>
      <button
        type="button"
        className="action-blue"
        title="Vista cama"
        aria-label={`Vista cama${suffix}`}
        onClick={onBed}
      >
        <Icon name="bed" color="#fff" size={27} />
      </button>
      <button
        type="button"
        className="attend-button"
        title="Atender"
        aria-label={`Atender${suffix}`}
        onClick={onAttend}
      >
        Atender
      </button>
    </div>
  );
}
