import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ReaCommandPalette, useCommandShortcut } from "./rea-command-palette";
import { ReaFilterGroup } from "./rea-filter-group";
import { ReaCodeBox } from "./rea-inspector";
import { ReaScrollProgress } from "./rea-scroll-progress";
import { nextAccent } from "./rea-theme";
import { useReaToast } from "./rea-toast";
import { SlideNavigator } from "./slide-navigator";

function Deck({ count = 5, start = 0 }: { count?: number; start?: number }) {
  const [i, setI] = useState(start);
  return <SlideNavigator index={i} count={count} onChange={setI} />;
}

describe("SlideNavigator", () => {
  it("no se renderiza sin diapositivas", () => {
    const { container } = render(<SlideNavigator index={0} count={0} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("limita el índice y deshabilita la flecha del extremo", () => {
    render(<SlideNavigator index={99} count={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Diapositiva siguiente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir a diapositiva 3" })).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });
  it("navega con flechas, Inicio y Fin con el foco dentro", async () => {
    const user = userEvent.setup();
    render(<Deck />);
    await user.click(screen.getByRole("button", { name: "Ir a diapositiva 2" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
    await user.keyboard("{End}");
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
    await user.keyboard("{Home}");
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });
  it("ignora atajos con modificadores", () => {
    const onChange = vi.fn();
    render(<SlideNavigator index={1} count={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("navigation"), { key: "ArrowRight", metaKey: true });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("ReaFilterGroup", () => {
  it("marca una sola opción con aria-pressed y avisa el cambio", async () => {
    const onValueChange = vi.fn();
    render(
      <ReaFilterGroup
        label="Tipo"
        value="all"
        onValueChange={onValueChange}
        options={[
          { value: "all", label: "Todo" },
          { value: "tokens", label: "Tokens", count: 3 },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "Tipo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todo" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Tokens/ })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(screen.getByRole("button", { name: /Tokens/ }));
    expect(onValueChange).toHaveBeenCalledWith("tokens");
  });
});

function Palette({ onSelect }: { onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  useCommandShortcut(() => setOpen(true));
  return (
    <ReaCommandPalette
      open={open}
      onOpenChange={setOpen}
      onSelect={onSelect}
      commands={[
        { id: "theme", label: "Alternar tema", hint: "Apariencia" },
        { id: "nav", label: "SlideNavigator", keywords: "diapositivas" },
      ]}
    />
  );
}

describe("ReaCommandPalette", () => {
  it("abre con Ctrl+K, filtra sin tildes y ejecuta el comando elegido", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");
    const input = screen.getByRole("textbox", { name: "Buscar comandos" });
    expect(input).toHaveFocus();
    await user.type(input, "DIAPÓSITIVAS");
    expect(screen.queryByRole("button", { name: /Alternar tema/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /SlideNavigator/ }));
    expect(onSelect).toHaveBeenCalledWith("nav");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("anuncia cuando no hay coincidencias", async () => {
    const user = userEvent.setup();
    render(<Palette onSelect={() => {}} />);
    await user.keyboard("{Control>}k{/Control}");
    await user.type(screen.getByRole("textbox", { name: "Buscar comandos" }), "zzz");
    expect(screen.getByRole("status")).toHaveTextContent("No hay comandos que coincidan.");
  });
});

describe("ReaCodeBox", () => {
  it("si el portapapeles falla lo dice y no lo da por copiado", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("bloqueado"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const onCopyResult = vi.fn();
    render(<ReaCodeBox code="npx algo" onCopyResult={onCopyResult} />);
    await userEvent.click(screen.getByRole("button", { name: /Copiar ejemplo/ }));
    expect(onCopyResult).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: /No se pudo copiar/ })).toBeInTheDocument();
  });
});

describe("ReaScrollProgress", () => {
  it("acota el valor y trata lo no finito como 0", () => {
    const { rerender } = render(<ReaScrollProgress value={1.7} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    rerender(<ReaScrollProgress value={Number.NaN} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });
});

describe("useReaToast y nextAccent", () => {
  it("el aviso se oculta solo tras la duración", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useReaToast(1000));
    act(() => result.current.show("Hola"));
    expect(result.current.message).toBe("Hola");
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.message).toBeNull();
    vi.useRealTimers();
  });
  it("el acento cicla azul → naranjo → lima → azul", () => {
    expect(nextAccent("blue")).toBe("orange");
    expect(nextAccent("orange")).toBe("lime");
    expect(nextAccent("lime")).toBe("blue");
  });
});
