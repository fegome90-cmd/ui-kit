import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EncodingCompare } from "./encoding-compare";
import { LabBackdrop } from "./lab-backdrop";
import { PresenceDot } from "./presence-dot";
import { SignalDisclosure } from "./signal-disclosure";
import { StatRing } from "./stat-ring";

const DATOS = [
  { label: "Mañana", value: 12 },
  { label: "Tarde", value: 9 },
  { label: "Noche", value: 4 },
];

describe("PresenceDot", () => {
  it("con etiqueta es una imagen con nombre; sin etiqueta es decorativo", () => {
    const { container } = render(
      <>
        <PresenceDot label="Hay notas nuevas" />
        <PresenceDot />
      </>,
    );
    expect(screen.getByRole("img", { name: "Hay notas nuevas" })).toBeInTheDocument();
    const dots = container.querySelectorAll("[data-slot=presence-dot]");
    expect(dots[1]).toHaveAttribute("aria-hidden", "true");
  });

  it("dibuja tantos anillos como pide y el pulso solo con motion-safe", () => {
    const { container } = render(<PresenceDot label="x" rings={2} pulse />);
    const hijos = container.querySelectorAll("[data-slot=presence-dot] > span");
    expect(hijos).toHaveLength(3);
    expect(hijos[2].className).toContain("motion-safe:animate-lab-pulse");
  });
});

describe("StatRing", () => {
  it("es una figura cuya leyenda explica la cifra", () => {
    const { container } = render(<StatRing value="2B" caption="Personas con la condición" />);
    const fig = screen.getByRole("figure");
    expect(fig).toHaveTextContent("2B");
    expect(container.querySelector("figure > figcaption")).toHaveTextContent("Personas con la condición");
  });
});

describe("SignalDisclosure", () => {
  it("abre y cierra con clic y teclado, y el detalle sigue en el DOM", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <SignalDisclosure title="Indicaciones nuevas" summary="2 nuevas" onOpenChange={onOpenChange}>
        Ajuste de dosis
      </SignalDisclosure>,
    );
    const boton = screen.getByRole("button", { name: /Indicaciones nuevas/ });
    const detalle = screen.getByText("Ajuste de dosis");
    expect(boton).toHaveAttribute("aria-expanded", "false");
    expect(detalle).not.toBeVisible();
    expect(boton.getAttribute("aria-controls")).toBe(detalle.id);

    await user.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    expect(detalle).toBeVisible();

    boton.focus();
    await user.keyboard("{Enter}");
    expect(boton).toHaveAttribute("aria-expanded", "false");
    await user.keyboard(" ");
    expect(boton).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false, true]);
  });

  it("controlado: obedece a open y solo avisa", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <SignalDisclosure title="Fijo" open={false} onOpenChange={onOpenChange}>
        Detalle
      </SignalDisclosure>,
    );
    await user.click(screen.getByRole("button", { name: /Fijo/ }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: /Fijo/ })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("EncodingCompare", () => {
  it("cambia de codificación y la tabla siempre lleva los valores", async () => {
    const user = userEvent.setup();
    const onEncodingChange = vi.fn();
    const { container } = render(
      <EncodingCompare title="Pacientes por turno" data={DATOS} onEncodingChange={onEncodingChange} />,
    );
    const tabla = screen.getByRole("table", { name: "Pacientes por turno" });
    expect(tabla).toHaveTextContent("Mañana12");
    expect(container.querySelector("[data-marks=length]")?.querySelectorAll("rect")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Área" }));
    expect(screen.getByRole("button", { name: "Área" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector("[data-marks=area]")?.querySelectorAll("circle")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Arco" }));
    expect(container.querySelector("[data-marks=arc]")?.querySelectorAll("path")).toHaveLength(3);
    // En arco, la tabla agrega la parte del total: 12 de 25 = 48 %.
    expect(tabla).toHaveTextContent("48 %");
    expect(onEncodingChange.mock.calls.map((c) => c[0])).toEqual(["area", "arc"]);
  });

  it("el gráfico es aria-hidden: la tabla es la fuente accesible", () => {
    const { container } = render(<EncodingCompare title="T" data={DATOS} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("LabBackdrop", () => {
  it("las capas de fondo son decorativas y sin resplandor no dibuja la capa del acento", () => {
    const { container } = render(
      <>
        <LabBackdrop data-testid="a">Dato</LabBackdrop>
        <LabBackdrop data-testid="b" glow="none" />
      </>,
    );
    const [a, b] = container.querySelectorAll("[data-slot=lab-backdrop]");
    expect(a.querySelectorAll(":scope > [aria-hidden]")).toHaveLength(2);
    expect(b.querySelectorAll(":scope > [aria-hidden]")).toHaveLength(1);
    expect(a).toHaveTextContent("Dato");
  });
});
