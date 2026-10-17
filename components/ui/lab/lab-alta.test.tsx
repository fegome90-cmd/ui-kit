import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HierarchyCells, valorNodo } from "./hierarchy-cells";
import { RangeBars, textoRango } from "./range-bars";
import { TimeScale } from "./time-scale";

describe("TimeScale", () => {
  const events = [2009, 2013, 2014, 2021].map((a) => ({ at: a, label: String(a), content: <p>Hito {a}</p> }));
  it("ubica cada hito en proporción al tiempo, no a intervalos iguales", () => {
    render(<TimeScale label="Historia" events={events} />);
    const left = screen.getAllByRole("tab").map((t) => t.style.left);
    // 2009 → 0 %, 2013 → 4/12, 2014 → 5/12, 2021 → 100 %.
    expect(left.map((l) => Number.parseFloat(l).toFixed(2))).toEqual(["0.00", "33.33", "41.67", "100.00"]);
  });
  it("ordena por tiempo, fija el ancho mínimo y cambia con teclado", async () => {
    const user = userEvent.setup();
    const desordenados = [events[3], events[0], events[2], events[1]];
    render(<TimeScale label="Historia" events={desordenados} minUnitWidth={90} />);
    const lista = screen.getByRole("tablist", { name: "Historia" });
    expect(lista.style.minWidth).toBe(`${12 * 90}px`);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["2009", "2013", "2014", "2021"]);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Hito 2009");
    await user.click(screen.getByRole("tab", { name: "2013" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "2014" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Hito 2014");
    await user.keyboard("{End}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Hito 2021");
  });
});

describe("HierarchyCells", () => {
  const root = {
    id: "r",
    label: "Ingresos",
    children: [
      {
        id: "u",
        label: "Urgencia",
        children: [
          { id: "u1", label: "Adultos", value: 60 },
          { id: "u2", label: "Pediatría", value: 20 },
        ],
      },
      { id: "t", label: "Traslados", value: 20 },
    ],
  };
  it("valorNodo suma hijos e ignora valores inválidos", () => {
    expect(valorNodo(root)).toBe(100);
    expect(valorNodo({ id: "x", label: "x", value: -3 })).toBe(0);
  });
  it("muestra un nivel con valor y %, abre un nodo y vuelve por la miga de pan", async () => {
    const user = userEvent.setup();
    render(<HierarchyCells root={root} />);
    const urgencia = screen.getByRole("button", { name: /Urgencia: 80, 80 %\. Abrir 2 partes/ });
    expect(screen.getByText("Traslados").closest("li")).toHaveTextContent("20 · 20 %");
    await user.click(urgencia);
    expect(screen.getByText("Adultos").closest("li")).toHaveTextContent("60 · 75 %");
    expect(screen.getByText("Urgencia", { selector: "[aria-current=location]" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ingresos" }));
    expect(screen.getByRole("button", { name: /Urgencia/ })).toBeInTheDocument();
  });
});

describe("RangeBars", () => {
  it("textoRango con signo en cada caso", () => {
    expect(textoRango(30, 40, "%")).toBe("+30–40 %");
    expect(textoRango(-30, -20, "%")).toBe("−20–30 %");
    expect(textoRango(-5, 10, "%")).toBe("−5–+10 %");
    expect(textoRango(0, 3)).toBe("+0–3");
  });
  it("una barra por rango y el valor en texto accesible", () => {
    const { container } = render(
      <RangeBars
        title="Efecto"
        unit="%"
        ranges={[
          { label: "Ventas", min: 30, max: 40 },
          { label: "Pérdida", min: -30, max: -20 },
        ]}
      />,
    );
    expect(container.querySelectorAll("[data-marks=ranges] rect")).toHaveLength(2);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Ventas: +30–40 %",
      "Pérdida: −20–30 %",
    ]);
  });
});
