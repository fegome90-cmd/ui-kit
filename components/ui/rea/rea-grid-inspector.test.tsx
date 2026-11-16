import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createGridInspector } from "@/public/rea-grid-inspector/inspector.js";
import { ReaGridInspector } from "./rea-grid-overlay";

function required<T extends Element = HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing fixture: ${selector}`);
  return element;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
function fixture() {
  document.body.innerHTML =
    '<button id="launcher">Abrir</button><section id="slide"><a href="#destination" data-inspect="Enlace">Texto</a><p data-inspect="Segundo">Otro</p></section>';
  const slide = required<HTMLElement>("#slide");
  vi.spyOn(slide, "getBoundingClientRect").mockReturnValue({ left: 10, top: 20, width: 480, height: 270 } as DOMRect);
  for (const el of slide.children)
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ left: 34, top: 47, width: 120, height: 54 } as DOMRect);
  return slide;
}
describe("inspector DOM aislado", () => {
  it("no muta contenido, layout inline, navegación ni atributos; selecciona con controles accesibles", () => {
    const slide = fixture();
    const original = slide.outerHTML;
    const inspector = createGridInspector(slide, { width: 960, height: 540 });
    inspector.show();
    const select = required<HTMLSelectElement>('[aria-label="Bloque seleccionado"]');
    fireEvent.change(select, { target: { value: "0" } });
    expect(document.querySelector("output")?.textContent).toContain("x 48 px (5%)");
    fireEvent.change(required('[aria-label="Comparar con bloque"]'), { target: { value: "1" } });
    expect(document.querySelector("output")?.textContent).toContain("distancia 0 px");
    expect(document.querySelector(".rea-gi-outlines")).toHaveAttribute("aria-hidden", "true");
    expect(slide.outerHTML).toBe(original);
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    slide.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    inspector.hide();
    inspector.show();
    inspector.destroy();
    inspector.destroy();
    inspector.show();
    expect(slide.outerHTML).toBe(original);
    expect(document.querySelector(".rea-gi")).toBeNull();
  });
  it("no roba foco, Escape local lo devuelve y hide cancela RAF/eventos", () => {
    const slide = fixture();
    const launcher = required<HTMLButtonElement>("#launcher");
    launcher.focus();
    const remove = vi.spyOn(window, "removeEventListener");
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const inspector = createGridInspector(slide, { width: 960, height: 540, locale: "en" });
    inspector.show();
    expect(document.activeElement).toBe(launcher);
    const select = required<HTMLSelectElement>('[aria-label="Selected block"]');
    select.focus();
    window.dispatchEvent(new Event("resize"));
    fireEvent.keyDown(select, { key: "Escape" });
    expect(document.activeElement).toBe(launcher);
    expect(document.querySelector(".rea-gi")).toHaveAttribute("hidden");
    expect(cancel).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
    inspector.destroy();
  });
  it("actualiza bloques dinámicos y soporta diapositiva oculta", async () => {
    const slide = fixture();
    const inspector = createGridInspector(slide, { width: 960, height: 540 });
    inspector.show();
    slide.querySelector("a")?.remove();
    inspector.refresh();
    expect(document.querySelectorAll('[aria-label="Bloque seleccionado"] option')).toHaveLength(2);
    vi.mocked(slide.getBoundingClientRect).mockReturnValue({ left: 0, top: 0, width: 0, height: 0 } as DOMRect);
    inspector.refresh();
    expect(document.querySelector("output")?.textContent).toContain("no visible");
    inspector.destroy();
    await Promise.resolve();
    expect(document.querySelector(".rea-gi")).toBeNull();
  });
});

describe("adaptador React", () => {
  it("conserva selección al cambiar sólo la identidad del callback y usa su versión vigente", () => {
    const slide = fixture();
    const ref = { current: slide };
    const first = vi.fn();
    const latest = vi.fn();
    const view = render(
      <ReaGridInspector slideRef={ref} visible onVisibleChange={(value) => first(value)} width={960} height={540} />,
    );
    const select = required<HTMLSelectElement>('[aria-label="Bloque seleccionado"]');
    fireEvent.change(select, { target: { value: "0" } });
    view.rerender(
      <ReaGridInspector slideRef={ref} visible onVisibleChange={(value) => latest(value)} width={960} height={540} />,
    );
    expect(required<HTMLSelectElement>('[aria-label="Bloque seleccionado"]').value).toBe("0");
    fireEvent.click(required('[aria-label="Ocultar inspector"]'));
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledWith(false);
    view.unmount();
  });

  it("oculta retícula y panel al cerrar, vuelve a abrir y declara supresión de impresión", () => {
    const slide = fixture();
    const ref = { current: slide };
    const change = vi.fn();
    const view = render(<ReaGridInspector slideRef={ref} visible onVisibleChange={change} width={960} height={540} />);
    const grid = document.querySelector('[data-slot="rea-grid-overlay"]');
    expect(grid).toHaveAttribute("data-visible", "true");
    expect(grid?.className).toContain("print:hidden");
    fireEvent.click(document.querySelector('[aria-label="Ocultar inspector"]') as HTMLButtonElement);
    expect(change).toHaveBeenCalledWith(false);
    expect(grid).toHaveAttribute("data-visible", "false");
    expect(document.querySelector(".rea-gi")).toBeNull();
    view.rerender(<ReaGridInspector slideRef={ref} visible={false} onVisibleChange={change} />);
    view.rerender(<ReaGridInspector slideRef={ref} visible onVisibleChange={change} width={960} height={540} />);
    expect(grid).toHaveAttribute("data-visible", "true");
    expect(document.querySelector(".rea-gi")).not.toBeNull();
    view.unmount();
    expect(document.querySelector(".rea-gi")).toBeNull();
  });
  it("aísla teclado del panel sin cancelar navegación del contenido", () => {
    const slide = fixture();
    const inspector = createGridInspector(slide, { width: 960, height: 540 });
    inspector.show();
    const navigation = vi.fn();
    document.addEventListener("keydown", navigation);
    fireEvent.keyDown(document.querySelector(".rea-gi select") as HTMLSelectElement, { key: "ArrowRight" });
    expect(navigation).not.toHaveBeenCalled();
    fireEvent.keyDown(slide, { key: "ArrowRight" });
    expect(navigation).toHaveBeenCalledOnce();
    document.removeEventListener("keydown", navigation);
    inspector.destroy();
  });
});
