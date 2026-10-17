import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryWheel } from "./category-wheel";
import { alturaEn, DistributionChart } from "./distribution-chart";
import { formatoContador, LabCount, LabLozenge } from "./lozenge";
import { LabNotification } from "./notification";
import { ProcessSteps } from "./process-steps";
import { SeriesChart } from "./series-chart";

const ETAPAS = [{ title: "Ingreso" }, { title: "Evaluación" }, { title: "Alta" }];

describe("ProcessSteps", () => {
  it("es una lista ordenada; sin current no destaca ninguna etapa", () => {
    render(<ProcessSteps steps={ETAPAS} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items.some((li) => li.hasAttribute("aria-current"))).toBe(false);
    expect(screen.queryByText("En curso")).toBeNull();
  });
  it("current marca la etapa con aria-current=step y texto, en ambas variantes", () => {
    for (const variant of ["chevrons", "timeline"] as const) {
      const { unmount } = render(<ProcessSteps steps={ETAPAS} variant={variant} current={1} />);
      expect(screen.getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
      expect(screen.getByText("En curso")).toBeInTheDocument();
      unmount();
    }
  });
});

describe("SeriesChart", () => {
  const series = [
    { id: "a", label: "Cardiovascular", values: [1, 2, 3] },
    { id: "b", label: "Contexto 1", values: [2, 2, 2] },
    { id: "c", label: "Contexto 2", values: [3, 1, 0] },
  ];
  it("dibuja destacadas rotuladas y contexto sin rótulo; la tabla trae todas", () => {
    const { container } = render(<SeriesChart title="Riesgo" x={[40, 50, 60]} series={series} highlight={["a"]} />);
    expect(container.querySelectorAll("[data-marks=highlight] path")).toHaveLength(1);
    expect(container.querySelectorAll("[data-marks=context] path")).toHaveLength(2);
    expect(container.querySelector("[data-marks=highlight] text")).toHaveTextContent("Cardiovascular");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    const tabla = screen.getByRole("table", { name: "Riesgo", hidden: true });
    expect(tabla.querySelectorAll("tbody tr")).toHaveLength(3);
    expect(tabla).toHaveTextContent("Cardiovascular · destacada");
  });
});

describe("DistributionChart", () => {
  it("alturaEn interpola entre puntos y se acota en los extremos", () => {
    const pts: [number, number][] = [
      [0, 0],
      [10, 10],
      [20, 0],
    ];
    expect(alturaEn(pts, 5)).toBe(5);
    expect(alturaEn(pts, 15)).toBe(5);
    expect(alturaEn(pts, -3)).toBe(0);
    expect(alturaEn(pts, 99)).toBe(0);
    expect(alturaEn([], 1)).toBe(0);
  });
  it("las anotaciones van en el gráfico y en una lista", () => {
    const { container } = render(
      <DistributionChart
        title="Edad"
        points={[
          [60, 1],
          [80, 9],
          [100, 1],
        ]}
        annotations={[{ x: 70, label: "Paciente A" }]}
        xLabel="Edad"
        yLabel="Pacientes"
      />,
    );
    expect(container.querySelectorAll("[data-marks=annotations] circle")).toHaveLength(1);
    expect(screen.getByRole("listitem")).toHaveTextContent("Paciente A: edad 70");
  });
});

describe("CategoryWheel", () => {
  it("un sector por categoría, leyenda numerada y colores que se repiten desde la sexta", () => {
    const cats = ["A", "B", "C", "D", "E", "F"].map((label) => ({ label }));
    const { container } = render(<CategoryWheel title="Tipos" categories={cats} />);
    const sect = container.querySelectorAll("svg path");
    expect(sect).toHaveLength(6);
    // La sexta no repite el color de la primera, que es su vecina.
    expect((sect[5] as SVGPathElement).style.fill).toBe("var(--lab-cat-2)");
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getAllByRole("listitem")[5]).toHaveTextContent("6F");
  });
  it("corta en 8 categorías", () => {
    const cats = Array.from({ length: 10 }, (_, i) => ({ label: `C${i}` }));
    render(<CategoryWheel title="T" categories={cats} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
  });
});

describe("LabLozenge y LabCount", () => {
  it("el contador formatea según el idioma, con signo y abreviatura", () => {
    expect(formatoContador(1234)).toBe("1.234");
    expect(formatoContador(4, { signed: true })).toBe("+4");
    expect(formatoContador(-4, { signed: true })).toBe("-4");
    expect(formatoContador(0, { signed: true })).toBe("0");
    expect(formatoContador(1234, { locale: "en-US" })).toBe("1,234");
    expect(formatoContador(1_284_000, { compact: true, locale: "en-US" })).toBe("1.3M");
  });
  it("la métrica solo aparece en lozenges con significado", () => {
    const { container } = render(
      <>
        <LabLozenge tone="warning" metric={3}>
          En riesgo
        </LabLozenge>
        <LabLozenge metric={3}>Neutro</LabLozenge>
      </>,
    );
    const [a, b] = container.querySelectorAll("[data-slot=lab-lozenge]");
    expect(a.querySelector("[data-slot=lab-count]")).toHaveTextContent("3");
    expect(b.querySelector("[data-slot=lab-count]")).toBeNull();
  });
  it("el lozenge trunca a 200 px y el ícono va oculto", () => {
    const { container } = render(<LabLozenge icon={<svg />}>Bloqueado</LabLozenge>);
    const l = container.querySelector("[data-slot=lab-lozenge]");
    expect(l?.className).toContain("max-w-[200px]");
    expect(l?.querySelector("[aria-hidden]")).not.toBeNull();
    render(<LabCount value={7} tone="danger" bold />);
    expect(screen.getByText("7").className).toContain("bg-lab-danger");
  });
});

describe("LabNotification", () => {
  it("rol según variante y estado, con el estado también en texto", () => {
    render(
      <>
        <LabNotification status="info" title="Info" />
        <LabNotification status="danger" title="Error" />
        <LabNotification variant="callout" status="warning" title="Nota" />
      </>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Información: Info");
    expect(screen.getByRole("alert")).toHaveTextContent("Error: Error");
    expect(screen.getByRole("note")).toHaveTextContent("Advertencia: Nota");
  });
  it("callout no se cierra y degrada éxito o error a info", () => {
    const onClose = vi.fn();
    render(<LabNotification variant="callout" status="danger" title="Ojo" onClose={onClose} />);
    expect(screen.queryByRole("button", { name: "Cerrar notificación" })).toBeNull();
    expect(screen.getByRole("note")).toHaveAttribute("data-status", "info");
  });
  it("actionable toma el foco y su única acción funciona", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <LabNotification
        variant="actionable"
        status="danger"
        title="Sincronización detenida"
        action={{ label: "Reintentar", onClick }}
      />,
    );
    const dialogo = screen.getByRole("alertdialog", { name: "Sincronización detenida" });
    expect(dialogo).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("toast con timeout se cierra solo; sin timeout persiste", () => {
    vi.useFakeTimers();
    const conTiempo = vi.fn();
    const sinTiempo = vi.fn();
    render(
      <>
        <LabNotification variant="toast" title="A" timeout={5000} onClose={conTiempo} />
        <LabNotification variant="toast" title="B" onClose={sinTiempo} />
      </>,
    );
    act(() => vi.advanceTimersByTime(4999));
    expect(conTiempo).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(conTiempo).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(60_000));
    expect(sinTiempo).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
