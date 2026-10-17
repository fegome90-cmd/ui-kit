import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EncodingCompare } from "./encoding-compare";
import { LabBackdrop, PATTERNS } from "./lab-backdrop";
import { LabGlowCard } from "./lab-glow-card";
import { LabGradientText } from "./lab-gradient-text";
import { LabMarquee } from "./lab-marquee";
import { LabPalette, LabScope } from "./lab-palette";
import { LabRevealCard } from "./lab-reveal-card";
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
    const panel = detalle.closest("[data-slot=signal-disclosure-panel]");
    expect(boton).toHaveAttribute("aria-expanded", "false");
    // Cerrado: en el DOM, pero inerte (sin foco ni lector de pantalla) y sin altura.
    expect(panel).toHaveAttribute("inert");
    expect(panel?.className).toContain("grid-rows-[0fr]");
    expect(boton.getAttribute("aria-controls")).toBe(detalle.closest("section")?.id);

    await user.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("inert");
    expect(panel?.className).toContain("grid-rows-[1fr]");

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

  it("animate hace crecer las marcas solo con motion-safe, desde su origen", () => {
    const { container, rerender } = render(<EncodingCompare title="T" data={DATOS} />);
    expect(container.querySelector("rect")?.getAttribute("class")).not.toContain("animate-lab-grow");
    rerender(<EncodingCompare title="T" data={DATOS} animate />);
    const cls = container.querySelector("rect")?.getAttribute("class") ?? "";
    expect(cls).toContain("motion-safe:animate-lab-grow");
    expect(cls).toContain("[transform-origin:left_center]");
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

describe("fondos", () => {
  it.each(PATTERNS)("%s dibuja sus capas decorativas y deja el contenido encima", (pattern) => {
    const { container } = render(<LabBackdrop pattern={pattern}>Dato</LabBackdrop>);
    const raiz = container.querySelector("[data-slot=lab-backdrop]");
    expect(raiz).toHaveAttribute("data-pattern", pattern);
    expect(raiz?.querySelectorAll(":scope > [aria-hidden]").length).toBeGreaterThanOrEqual(2);
    expect(raiz).toHaveTextContent("Dato");
  });
  it("rotating solo gira con motion-safe", () => {
    const { container } = render(<LabBackdrop pattern="rotating" />);
    expect(container.querySelector(".motion-safe\\:animate-lab-rotate")).not.toBeNull();
  });
});

describe("paletas", () => {
  it("LabScope aplica la paleta y la neutra no lleva atributo", () => {
    const { container } = render(
      <>
        <LabScope palette="meridian" surface>
          x
        </LabScope>
        <LabScope>y</LabScope>
      </>,
    );
    const [a, b] = container.querySelectorAll("[data-slot=lab-scope]");
    expect(a).toHaveAttribute("data-lab-palette", "meridian");
    expect(a.className).toContain("bg-lab-bg");
    expect(b).not.toHaveAttribute("data-lab-palette");
    expect(b).toHaveClass("lab");
  });
  it("LabPalette lista los nueve roles con su origen", () => {
    render(<LabPalette palette="bioage" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
    expect(screen.getByText("--lab-accent")).toBeInTheDocument();
    expect(screen.getByText(/#a56cff · medido/)).toBeInTheDocument();
    expect(screen.getByText(/#342059 · derivado/)).toBeInTheDocument();
  });
});

describe("movimiento y superficies", () => {
  it("LabMarquee: un grupo con nombre y la copia del bucle oculta e inerte", () => {
    const { container } = render(
      <LabMarquee label="Clientes">
        <span>Higro</span>
      </LabMarquee>,
    );
    expect(screen.getByRole("group", { name: "Clientes" })).toBeInTheDocument();
    expect(screen.getAllByText("Higro")).toHaveLength(2);
    const copia = container.querySelector("[aria-hidden][inert]");
    expect(copia).toHaveTextContent("Higro");
  });
  it("LabGradientText solo vuelve transparente el texto con soporte de background-clip", () => {
    render(<LabGradientText>Titular</LabGradientText>);
    const el = screen.getByText("Titular");
    expect(el.className).toContain("supports-[background-clip:text]:[-webkit-text-fill-color:transparent]");
    expect(el.className).toContain("text-lab-ink");
  });
  it("LabRevealCard es un enlace con el título como nombre", () => {
    render(<LabRevealCard href="/c1" eyebrow="Capítulo 1" title="Cambios grandes" media={<span>img</span>} />);
    expect(screen.getByRole("link", { name: /Cambios grandes/ })).toHaveAttribute("href", "/c1");
  });
  it("LabGlowCard lleva el brillo a la posición del puntero", () => {
    const { container } = render(<LabGlowCard>Low-Code</LabGlowCard>);
    const card = container.querySelector("[data-slot=lab-glow-card]") as HTMLElement;
    card.getBoundingClientRect = () => ({ left: 10, top: 20 }) as DOMRect;
    fireEvent.pointerMove(card, { clientX: 60, clientY: 70 });
    expect(card.style.getPropertyValue("--lab-glow-x")).toBe("50px");
    expect(card.style.getPropertyValue("--lab-glow-y")).toBe("50px");
  });
});
