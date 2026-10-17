import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DotNav, seccionVisible } from "./dot-nav";
import { FilteredStat, textoCifra } from "./filtered-stat";
import { altoMontante, ProcessSteps } from "./process-steps";
import { ordenRanking, RadialBars } from "./radial-bars";

describe("FilteredStat", () => {
  const segments = [
    { id: "todos", label: "Todos", value: 24, detail: "+11 puntos" },
    { id: "aps", label: "APS", value: 28 },
    { id: "urg", label: "Urgencia", value: 19, note: "Muestra chica." },
  ];
  it("muestra el primer segmento y cambia la cifra al elegir otro", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <FilteredStat title="Control" label="Servicio" unit="%" segments={segments} onValueChange={onValueChange} />,
    );
    expect(screen.getByRole("group", { name: "Servicio" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Todos" })).toBeChecked();
    expect(container.querySelector("[data-value]")).toHaveTextContent("24%");
    expect(screen.getByText("+11 puntos")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "APS" }));
    expect(onValueChange).toHaveBeenCalledWith("aps");
    expect(container.querySelector("[data-value]")).toHaveTextContent("28%");
    expect(container.querySelector("[aria-live=polite]")).toHaveTextContent("APS: 28%");
  });
  it("la referencia aparece solo al elegir otro segmento", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FilteredStat title="Control" label="Servicio" unit="%" reference="todos" segments={segments} />,
    );
    expect(container.querySelector("[data-reference]")).toBeNull();
    await user.click(screen.getByRole("radio", { name: "APS" }));
    expect(container.querySelector("[data-reference]")).toHaveTextContent("Todos: 24 %");
  });
  it("la nota marca el segmento y se lee bajo la cifra", async () => {
    const user = userEvent.setup();
    render(<FilteredStat title="Control" label="Servicio" segments={segments} />);
    const urg = screen.getByRole("radio", { name: /^Urgencia\s*\(con nota\)$/ });
    expect(screen.queryByText("Muestra chica.")).toBeNull();
    await user.click(urg);
    expect(screen.getByText("Muestra chica.")).toBeInTheDocument();
  });
  it("controlado: sigue a value", () => {
    render(<FilteredStat title="Control" label="Servicio" segments={segments} value="urg" />);
    expect(screen.getByRole("radio", { name: /Urgencia/ })).toBeChecked();
  });
  it("formatea la cifra con unidad", () => {
    expect(textoCifra(1234.5, "%")).toBe("1.234,5 %");
    expect(textoCifra(7)).toBe("7");
  });
});

describe("DotNav", () => {
  const sections = ["a", "b", "c"].map((id) => ({ id, label: `Sección ${id.toUpperCase()}` }));
  it("elige la última sección que cruza la línea, o mantiene la anterior", () => {
    expect(seccionVisible(["a", "b", "c"], new Set(["a", "b"]))).toBe("b");
    expect(seccionVisible(["a", "b", "c"], new Set(), "c")).toBe("c");
  });
  it("nombra cada enlace y marca la actual con aria-current", () => {
    render(<DotNav label="Secciones" sections={sections} current="b" />);
    expect(screen.getByRole("navigation", { name: "Secciones" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sección B" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Sección A" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Sección C" })).toHaveAttribute("href", "#c");
  });
  it("sigue al scroll con IntersectionObserver y salta con clic", async () => {
    let avisar: (e: { target: Element; isIntersecting: boolean }[]) => void = () => {};
    const observados: Element[] = [];
    class IO {
      constructor(cb: typeof avisar) {
        avisar = cb;
      }
      observe(el: Element) {
        observados.push(el);
      }
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", IO);
    Element.prototype.scrollIntoView = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <DotNav label="Secciones" sections={sections} />
        {sections.map((s) => (
          <section key={s.id} id={s.id} />
        ))}
      </>,
    );
    expect(observados.map((e) => e.id)).toEqual(["a", "b", "c"]);
    act(() => avisar([{ target: observados[2], isIntersecting: true }]));
    expect(screen.getByRole("link", { name: "Sección C" })).toHaveAttribute("aria-current", "location");
    await user.click(screen.getByRole("link", { name: "Sección A" }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(observados[0]);
    expect(screen.getByRole("link", { name: "Sección A" })).toHaveAttribute("aria-current", "location");
    vi.unstubAllGlobals();
  });
});

describe("RadialBars", () => {
  const items = [
    { label: "B", value: 50 },
    { label: "A", value: 100 },
    { label: "C", value: 25 },
  ];
  it("barras: el largo desde el círculo interior es proporcional al valor", () => {
    const { container } = render(<RadialBars title="Temas" items={items} />);
    const largo = [...container.querySelectorAll("[data-marks=bars] line")].map((l) =>
      Math.hypot(
        Number(l.getAttribute("x2")) - Number(l.getAttribute("x1")),
        Number(l.getAttribute("y2")) - Number(l.getAttribute("y1")),
      ),
    );
    expect(largo[0] / largo[1]).toBeCloseTo(0.5, 1);
    expect(largo[2] / largo[1]).toBeCloseTo(0.25, 1);
  });
  it("ranking: ordena de mayor a menor, área proporcional y lista accesible", () => {
    const { container } = render(<RadialBars title="Ranking" items={items} variant="ranking" unit="u" />);
    const r = [...container.querySelectorAll("[data-marks=ranking] circle")].map((c) => Number(c.getAttribute("r")));
    expect((r[1] / r[0]) ** 2).toBeCloseTo(0.5, 1);
    expect([...container.querySelectorAll("text")].map((t) => t.textContent)[0]).toBe("1 · A");
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["A: 100 u", "B: 50 u", "C: 25 u"]);
    expect(ordenRanking(items).map((i) => i.puesto)).toEqual([1, 2, 3]);
  });
});

describe("ProcessSteps: escalera", () => {
  const steps = [{ title: "Diagnóstico" }, { title: "Tratamiento" }, { title: "Seguimiento" }];
  it("cada montante es más bajo y cada peldaño más ancho que el anterior", () => {
    const { container } = render(<ProcessSteps variant="staircase" steps={steps} />);
    const alto = [...container.querySelectorAll<HTMLElement>("[data-riser]")].map((e) => e.style.height);
    expect(alto).toEqual(["166px", "115px", "64px"]);
    const crecer = [...container.querySelectorAll<HTMLElement>("li")].map((e) => e.style.flexGrow);
    expect(crecer).toEqual(["2", "3", "4"]);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("1. Diagnóstico");
  });
  it("marca la etapa en curso", () => {
    render(<ProcessSteps variant="staircase" steps={steps} current={2} />);
    expect(screen.getAllByRole("listitem")[2]).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("En curso")).toBeInTheDocument();
  });
  it("con una sola etapa usa el alto mayor", () => {
    expect(altoMontante(0, 1)).toBe(166);
    expect(altoMontante(4, 5)).toBe(64);
  });
});
