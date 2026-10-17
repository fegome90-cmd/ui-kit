import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BentoGrid, BentoItem } from "./bento-grid";
import { ChapterCard } from "./chapter-card";
import { DivergingHeatmap } from "./diverging-heatmap";
import { FeatureTabs } from "./feature-tabs";
import { ProportionSplit } from "./proportion-split";
import { ScrollySection } from "./scrolly-section";

describe("ProportionSplit", () => {
  it("porcentajes desde los valores (no desde la forma) y una lista por parte", () => {
    const { container } = render(
      <ProportionSplit
        title="Turno"
        parts={[
          { label: "Registro", value: 47, items: ["Notas"] },
          { label: "Atención", value: 53, items: ["Curaciones", "Fármacos"] },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: /Registro.*47 %/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Atención.*53 %/ })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(container.querySelectorAll("svg path")).toHaveLength(2);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
  it("corta en tres partes y normaliza a porcentajes del total", () => {
    render(
      <ProportionSplit
        title="T"
        parts={[
          { label: "A", value: 1 },
          { label: "B", value: 1 },
          { label: "C", value: 2 },
          { label: "D", value: 9 },
        ]}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getByRole("heading", { name: /C.*50 %/ })).toBeInTheDocument();
  });
});

describe("FeatureTabs", () => {
  const items = [
    { id: "a", title: "Enriquecimiento", description: "Completa datos", panel: <p>Panel A</p> },
    { id: "b", title: "Flujos", description: "Reglas", panel: <p>Panel B</p> },
    { id: "c", title: "Informes", panel: <p>Panel C</p> },
  ];
  it("tablist vertical: una pestaña seleccionada y su panel", () => {
    render(<FeatureTabs label="Funciones" items={items} />);
    expect(screen.getByRole("tablist", { name: "Funciones" })).toHaveAttribute("aria-orientation", "vertical");
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false"]);
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(screen.getByRole("tabpanel", { name: "Enriquecimiento" })).toHaveTextContent("Panel A");
  });
  it("clic, flechas, Inicio y Fin cambian la selección y el foco", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FeatureTabs label="F" items={items} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Flujos" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel B");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Informes" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel C");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Enriquecimiento" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Informes" })).toHaveFocus();
    await user.keyboard("{Home}{ArrowUp}");
    expect(screen.getByRole("tab", { name: "Informes" })).toHaveAttribute("aria-selected", "true");
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["b", "c", "a", "c", "a", "c"]);
  });
});

describe("ChapterCard", () => {
  it("es un enlace con el color AA de su capítulo y la lista de secciones", () => {
    render(
      <ChapterCard
        index={4}
        title="La tierra"
        media={<span>img</span>}
        sections={[{ id: "4.1", title: "Agua" }]}
        href="#c4"
      />,
    );
    const link = screen.getByRole("link", { name: /Capítulo 4.*La tierra.*4\.1.*Agua/ });
    // Capítulo 4: fondo amarillo #fbd236 y texto negro (Voices usaba coral: 2,58:1).
    expect(link.style.background).toBe("rgb(251, 210, 54)");
    expect(link.style.color).toBe("rgb(0, 0, 0)");
  });
  it("desde el capítulo 6 los colores se repiten", () => {
    render(<ChapterCard index={6} title="T" media={null} href="#" />);
    expect(screen.getByRole("link").style.background).toBe("rgb(230, 80, 60)");
  });
  it("con 0, negativos o decimales da la vuelta en lugar de romperse", () => {
    const fondo = (index: number) => {
      const { unmount } = render(<ChapterCard index={index} title="T" media={null} href="#" />);
      const bg = screen.getByRole("link").style.background;
      unmount();
      return bg;
    };
    expect(fondo(0)).toBe(fondo(5));
    expect(fondo(-4)).toBe(fondo(1));
    expect(fondo(2.7)).toBe(fondo(2));
    expect(fondo(0)).not.toBe("");
  });
});

describe("DivergingHeatmap", () => {
  const props = {
    title: "Flujo",
    rows: ["UCI", "Medicina"],
    cols: ["00h", "02h", "04h"],
    values: [
      [0, -50, 2_000_000],
      [150, -15_000, 99],
    ],
    negativeLabel: "Egresos",
    positiveLabel: "Ingresos",
  };
  it("una celda por valor; el cero queda vacío; la tabla trae los valores", () => {
    const { container } = render(<DivergingHeatmap {...props} />);
    const rects = container.querySelectorAll("[data-marks=cells] rect");
    expect(rects).toHaveLength(6);
    expect((rects[0] as SVGRectElement).style.fill).toBe("transparent");
    expect((rects[2] as SVGRectElement).style.fill).toContain("85%");
    const tabla = screen.getByRole("table", { name: "Flujo", hidden: true });
    expect(tabla).toHaveTextContent("-15.000");
  });
  it("esquema accesible por defecto (naranja/azul) y el medido de Voices como opción", () => {
    const { container, rerender } = render(<DivergingHeatmap {...props} />);
    const r = () => (container.querySelectorAll("[data-marks=cells] rect")[1] as SVGRectElement).style.fill;
    // jsdom normaliza los colores a rgb(r, g, b).
    expect(r()).toContain("rgb(230, 97, 1)");
    rerender(<DivergingHeatmap {...props} scheme="voices" />);
    expect(r()).toContain("rgb(250, 86, 50)");
  });
});

describe("BentoGrid", () => {
  it("cada tamaño ocupa sus columnas de la grilla de 5", () => {
    const { container } = render(
      <BentoGrid>
        <BentoItem size="sm">a</BentoItem>
        <BentoItem size="lg">b</BentoItem>
        <BentoItem size="full">c</BentoItem>
      </BentoGrid>,
    );
    const [a, b, c] = container.querySelectorAll("[data-slot=lab-glow-card]");
    expect(a.className).toContain("min-[760px]:col-span-2");
    expect(b.className).toContain("min-[760px]:col-span-3");
    expect(c.className).toContain("min-[760px]:col-span-5");
    expect(a).toHaveAttribute("data-bento-size", "sm");
  });
});

describe("ScrollySection", () => {
  it("sin IntersectionObserver queda en el primer paso; escenas inactivas inertes", () => {
    const { container } = render(
      <ScrollySection
        steps={[
          { id: "1", title: "Uno", visual: <span>V1</span> },
          { id: "2", title: "Dos", visual: <span>V2</span> },
        ]}
      />,
    );
    const pasos = screen.getAllByRole("listitem");
    expect(pasos[0]).toHaveAttribute("aria-current", "step");
    expect(pasos[1]).not.toHaveAttribute("aria-current");
    const escenas = container.querySelectorAll("[data-escena]");
    expect(escenas[0].className).toContain("opacity-100");
    expect(escenas[1].className).toContain("opacity-0");
    expect(escenas[1]).toHaveAttribute("inert");
  });
});
