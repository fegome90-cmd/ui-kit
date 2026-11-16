// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  compareBoxSnapshots,
  createBoxSnapshot,
  createGridInspector,
} from "../../public/rea-grid-inspector/inspector.js";

const inspectors: ReturnType<typeof createGridInspector>[] = [];
afterEach(() => {
  inspectors.splice(0).forEach((inspector) => {
    inspector.destroy();
  });
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
function rect(x: number, y: number, width: number, height: number): DOMRect {
  return { x, y, left: x, top: y, width, height, right: x + width, bottom: y + height, toJSON: () => ({}) };
}
function surface(label: string, x = 10, width = 100) {
  const slide = document.createElement("section");
  const block = document.createElement("div");
  block.dataset.inspect = label;
  slide.append(block);
  document.body.append(slide);
  vi.spyOn(slide, "getBoundingClientRect").mockReturnValue(rect(0, 0, width, 100));
  vi.spyOn(block, "getBoundingClientRect").mockReturnValue(rect(x, 10, 20, 20));
  return { slide, block };
}
function setup() {
  const first = surface("Origen");
  const inspector = createGridInspector(first.slide, { width: 100, height: 100 });
  inspectors.push(inspector);
  inspector.show();
  return { ...first, inspector };
}
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("Falta fixture de auditoría");
  return value;
}
function choose() {
  const select = required(document.querySelector<HTMLSelectElement>('[aria-label="Bloque seleccionado"]'));
  select.value = "0";
  select.dispatchEvent(new Event("change"));
  return select;
}
function save() {
  const button = required(
    Array.from(document.querySelectorAll("button")).find((node) => node.textContent === "Guardar referencia"),
  );
  button.click();
  return button;
}
function history() {
  return required(document.querySelector('[aria-label="Comparación histórica"]')).textContent ?? "";
}

describe("auditoría independiente de comparación histórica", () => {
  it("copia y congela todos los valores sin conservar el objeto original", () => {
    const box = { x: 10, y: 20, width: 30, height: 40 };
    const size = { width: 100, height: 200 };
    const snapshot = createBoxSnapshot(box, size, "A", "2026-11-16T00:00:00Z");
    box.x = 90;
    size.width = 900;
    expect(snapshot.pixels.x).toBe(10);
    expect(snapshot.size.width).toBe(100);
    expect(snapshot.percent.x).toBe(10);
    for (const value of [snapshot, snapshot.pixels, snapshot.percent, snapshot.size])
      expect(Object.isFrozen(value)).toBe(true);
  });

  it("devuelve actual menos referencia y puntos porcentuales, no variación relativa", () => {
    const a = createBoxSnapshot({ x: 10, y: 0, width: 20, height: 20 }, { width: 100, height: 100 });
    const b = createBoxSnapshot({ x: 40, y: 0, width: 40, height: 40 }, { width: 200, height: 200 });
    expect(compareBoxSnapshots(a, b)).toEqual({
      sameSize: false,
      pixels: null,
      percent: { x: 10, y: 0, width: 0, height: 0 },
    });
    expect(compareBoxSnapshots(b, a).percent.x).toBe(-10);
  });

  it("conserva referencia al cambiar slide, resetea controles y compara tamaños diferentes", () => {
    const { inspector, block } = setup();
    choose();
    save();
    const oldHistory = history().split("Actual:")[0];
    const input = required(document.querySelector<HTMLInputElement>('[aria-label="x2"]'));
    input.value = "35";
    input.focus();
    const second = surface("Destino", 40, 200);
    inspector.setSlide(second.slide, { width: 200, height: 100 });
    expect(input.value).toBe("0");
    expect(document.activeElement).toBe(input);
    expect(required(document.querySelector<HTMLSelectElement>('[aria-label="Bloque seleccionado"]')).value).toBe("-1");
    block.remove();
    choose();
    expect(history()).toContain(oldHistory);
    expect(history()).toContain("Δx 10;");
    expect(history()).toContain("puntos porcentuales");
    expect(history()).toContain("delta px no comparable");
  });

  it("mantiene la referencia fija al mutar el origen y quita deltas si la geometría deja de ser válida", () => {
    const { inspector, slide, block } = setup();
    choose();
    const button = save();
    vi.mocked(block.getBoundingClientRect).mockReturnValue(rect(30, 10, 20, 20));
    inspector.refresh();
    expect(history()).toContain("Δx 20;");
    slide.style.rotate = "30deg";
    inspector.refresh();
    expect(history()).not.toContain("Δx");
    expect(history()).toContain("Origen");
    expect(button.disabled).toBe(true);
  });

  it("rechaza otro documento sin alterar selección ni referencia", () => {
    const { inspector } = setup();
    const select = choose();
    save();
    const before = history();
    const foreign = document.implementation.createHTMLDocument().createElement("section");
    expect(() => inspector.setSlide(foreign)).toThrow(TypeError);
    expect(select.value).toBe("0");
    expect(history()).toBe(before);
  });

  it("no permite capturar ni comparar una caja actual oculta o de tamaño cero", () => {
    const { inspector, block } = setup();
    choose();
    const button = save();
    vi.mocked(block.getBoundingClientRect).mockReturnValue(rect(0, 0, 0, 0));
    inspector.refresh();
    expect(button.disabled).toBe(true);
    expect(history()).not.toContain("Δx");
    expect(history()).toContain("Origen");
  });

  it("permite visibility visible en un hijo que revierte la visibility hidden del padre", () => {
    const { inspector, slide, block } = setup();
    slide.style.visibility = "hidden";
    block.style.visibility = "visible";
    inspector.refresh();
    choose();
    expect(save().disabled).toBe(false);
    expect(history()).toContain("Referencia histórica: Origen");
  });

  it("cambia captura al nuevo slide, conserva ocultación y no revive tras destroy", () => {
    const { inspector, block } = setup();
    const second = surface("Destino", 20);
    const mode = required(document.querySelector<HTMLSelectElement>('[aria-label="Modo de interacción"]'));
    mode.value = "select";
    mode.dispatchEvent(new Event("change"));
    inspector.setSlide(second.slide, { width: 100, height: 100 });
    const oldClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    block.dispatchEvent(oldClick);
    expect(oldClick.defaultPrevented).toBe(false);
    const newClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    second.block.dispatchEvent(newClick);
    expect(mode.value).toBe("read");
    expect(newClick.defaultPrevented).toBe(false);
    mode.value = "select";
    mode.dispatchEvent(new Event("change"));
    const oldClickAfterOptIn = new MouseEvent("click", { bubbles: true, cancelable: true });
    block.dispatchEvent(oldClickAfterOptIn);
    expect(oldClickAfterOptIn.defaultPrevented).toBe(false);
    const newClickAfterOptIn = new MouseEvent("click", { bubbles: true, cancelable: true });
    second.block.dispatchEvent(newClickAfterOptIn);
    expect(newClickAfterOptIn.defaultPrevented).toBe(true);
    inspector.hide();
    inspector.setSlide(required(block.parentElement), { width: 100, height: 100 });
    expect((document.querySelector(".rea-gi") as HTMLElement).hidden).toBe(true);
    inspector.destroy();
    inspector.setSlide(second.slide);
    inspector.show();
    expect(document.querySelector(".rea-gi")).toBeNull();
  });
});
