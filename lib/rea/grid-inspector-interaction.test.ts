/** @vitest-environment jsdom */
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertSupportedGeometry,
  createGridInspector,
  measureBox,
  measureDistance,
} from "../../public/rea-grid-inspector/inspector.js";

const created: ReturnType<typeof createGridInspector>[] = [];
const required = <T extends Element>(element: T | null): T => {
  if (!element) throw new Error("Fixture element is missing");
  return element;
};

function fixture() {
  document.body.innerHTML = `
    <button id="opener">Open</button>
    <main id="slide"><article data-inspect="A"><span id="child">A child</span></article><article data-inspect="B">B</article><p id="plain">Plain</p></main>
    <button id="after">After</button>`;
  const slide = required(document.querySelector<HTMLElement>("#slide"));
  const a = required(document.querySelector<HTMLElement>("[data-inspect='A']"));
  const b = required(document.querySelector<HTMLElement>("[data-inspect='B']"));
  const rect = (left: number, top: number, width: number, height: number) =>
    ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} }) as DOMRect;
  vi.spyOn(slide, "getBoundingClientRect").mockReturnValue(rect(100, 50, 200, 100));
  vi.spyOn(a, "getBoundingClientRect").mockReturnValue(rect(110, 60, 40, 20));
  vi.spyOn(b, "getBoundingClientRect").mockReturnValue(rect(160, 70, 20, 20));
  Object.defineProperties(slide, {
    offsetWidth: { configurable: true, value: 200 },
    offsetHeight: { configurable: true, value: 100 },
  });
  return { slide, a, b, rect };
}

function create(slide: HTMLElement, options: Parameters<typeof createGridInspector>[1] = {}) {
  const inspector = createGridInspector(slide, { width: 1000, height: 500, grid: false, ...options });
  created.push(inspector);
  return inspector;
}

function panel() {
  return required(document.querySelector<HTMLElement>(".rea-gi-panel"));
}

function select(label: string, value: string) {
  const control = required(panel().querySelector<HTMLSelectElement>(`[aria-label="${label}"]`));
  control.value = value;
  control.dispatchEvent(new Event("change", { bubbles: true }));
  return control;
}

function click(target: Element, x = 120, y = 70) {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, clientX: x, clientY: y });
  target.dispatchEvent(event);
  return event;
}

afterEach(() => {
  for (const inspector of created.splice(0)) inspector.destroy();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("interacción independiente del inspector de grilla", () => {
  it("conserva clicks y bubbling en modo lectura, también al ocultarlo", () => {
    const { slide, a } = fixture();
    const inspector = create(slide);
    const listener = vi.fn();
    slide.addEventListener("click", listener);

    inspector.show();
    const event = click(required(a.querySelector("span")));
    expect(event.defaultPrevented).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(panel().querySelector('[aria-label="Modo de interacción"]')?.getAttribute("value")).toBeNull();

    select("Modo de interacción", "select");
    select("Modo de interacción", "read");
    const normalClick = click(a);
    expect(normalClick.defaultPrevented).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
    inspector.hide();
    expect(click(a).defaultPrevented).toBe(false);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("hace opt-in de selección directa, conserva la selección por lista y no intercepta clicks del panel", () => {
    const { slide, a, b } = fixture();
    const inspector = create(slide);
    const listener = vi.fn();
    slide.addEventListener("click", listener);
    inspector.show();
    select("Modo de interacción", "select");

    const event = click(required(a.querySelector("span")));
    expect(event.defaultPrevented).toBe(true);
    expect(listener).not.toHaveBeenCalled();
    expect(panel().querySelector<HTMLSelectElement>('[aria-label="Bloque seleccionado"]')?.value).toBe("0");
    const plainClick = click(required(document.querySelector("#plain")));
    expect(plainClick.defaultPrevented).toBe(true);
    expect(panel().querySelector<HTMLSelectElement>('[aria-label="Bloque seleccionado"]')?.value).toBe("-1");

    select("Bloque seleccionado", "1");
    expect(panel().querySelector('[aria-live="polite"]')?.textContent).toContain("x 300 px");
    const panelEvent = click(required(panel().querySelector("button")));
    expect(panelEvent.defaultPrevented).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    expect(b.isConnected).toBe(true);
  });

  it("permite marcar dos puntos por coordenadas de click o por los cuatro inputs", () => {
    const { slide } = fixture();
    const inspector = create(slide);
    inspector.show();
    select("Modo de interacción", "ruler");
    const point1 = click(slide, 101, 51);
    const point2 = click(slide, 102, 52);
    expect(point1.defaultPrevented).toBe(true);
    expect(point2.defaultPrevented).toBe(true);
    const inputs = ["x1", "y1", "x2", "y2"].map((name) =>
      required(panel().querySelector<HTMLInputElement>(`[aria-label="${name}"]`)),
    );
    expect(inputs.map((input) => Number(input.value))).toEqual([5, 5, 10, 10]);
    expect(document.querySelectorAll(".rea-gi-outlines .rea-gi-dimension")).toHaveLength(1);

    ["3", "4", "6", "8"].forEach((value, i) => {
      inputs[i].value = value;
      inputs[i].dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(panel().querySelectorAll('[aria-live="polite"]')[1]?.textContent).toContain("d 5 px");
    expect(document.querySelectorAll(".rea-gi-outlines .rea-gi-dimension")).toHaveLength(1);
  });

  it("distinge separación, contacto y solapamiento con solapamientos firmados por eje", () => {
    const box = (x: number, y: number, width: number, height: number) =>
      measureBox(
        { left: 0, top: 0, width: 100, height: 100 },
        { left: x, top: y, width, height },
        { width: 100, height: 100 },
      );
    const separation = measureDistance(box(0, 0, 10, 10), box(13, 14, 10, 10));
    expect(separation.horizontal).toBeCloseTo(3);
    expect(separation.vertical).toBeCloseTo(4);
    expect(separation.distance).toBeCloseTo(5);
    expect(separation.overlapX).toBeCloseTo(-3);
    expect(separation.overlapY).toBeCloseTo(-4);
    expect(separation.relation).toBe("separation");
    expect(measureDistance(box(0, 0, 10, 10), box(10, 2, 10, 4))).toMatchObject({
      horizontal: 0,
      vertical: 0,
      overlapX: 0,
      overlapY: 4,
      relation: "contact",
    });
    expect(measureDistance(box(0, 0, 10, 10), box(5, 4, 10, 10))).toMatchObject({
      horizontal: 0,
      vertical: 0,
      overlapX: 5,
      overlapY: 6,
      relation: "overlap",
    });
  });

  it("acepta traslación/escala positivas, rechaza transformaciones no soportadas en un ancestro", () => {
    const { slide, a } = fixture();
    slide.style.transform = "matrix(2, 0, 0, 2, 10, 20)";
    expect(() => assertSupportedGeometry(a)).not.toThrow();
    slide.style.transform = "rotate(2deg)";
    expect(() => assertSupportedGeometry(a)).toThrow(RangeError);
    slide.style.transform = "skewX(2deg)";
    expect(() => assertSupportedGeometry(a)).toThrow(RangeError);
    slide.style.transform = "perspective(500px)";
    expect(() => assertSupportedGeometry(a)).toThrow(RangeError);
    slide.style.transform = "scale(-1)";
    expect(() => assertSupportedGeometry(a)).toThrow(RangeError);
    slide.style.transform = "translate3d(1px, 2px, 0)";
    expect(() => assertSupportedGeometry(a)).toThrow(RangeError);
    slide.style.transform = "scale3d(2, 2, 1)";
    expect(() => assertSupportedGeometry(a)).toThrow(RangeError);
  });

  it("no escribe coordenadas inválidas cuando la diapositiva tiene tamaño NaN o infinito", () => {
    const { slide } = fixture();
    const inspector = create(slide);
    inspector.show();
    select("Modo de interacción", "ruler");
    for (const width of [Number.NaN, Number.POSITIVE_INFINITY]) {
      vi.spyOn(slide, "getBoundingClientRect").mockReturnValue({
        left: 100,
        top: 50,
        width,
        height: 100,
        right: 100 + width,
        bottom: 150,
        x: 100,
        y: 50,
        toJSON() {},
      } as DOMRect);
      const event = click(slide, 101, 51);
      expect(event.defaultPrevented).toBe(true);
      expect(
        ["x1", "y1", "x2", "y2"].map(
          (name) => required(panel().querySelector<HTMLInputElement>(`[aria-label="${name}"]`)).value,
        ),
      ).toEqual(["0", "0", "0", "0"]);
      expect(panel().querySelectorAll('[aria-live="polite"]')[0]?.textContent).toContain("dimensiones");
    }
  });

  it("restaura foco al cerrar y destruye el panel sin dejarlo en el DOM", () => {
    const { slide } = fixture();
    const opener = required(document.querySelector<HTMLButtonElement>("#opener"));
    opener.focus();
    const inspector = create(slide);
    inspector.show();
    const close = required(panel().querySelector<HTMLButtonElement>("button"));
    close.focus();
    close.click();
    expect(document.activeElement).toBe(opener);
    expect(document.querySelector(".rea-gi")).toHaveProperty("hidden", true);
    inspector.destroy();
    inspector.destroy();
    expect(document.querySelector(".rea-gi")).toBeNull();
  });

  it("observa redimensionado y cancela RAF/desconecta al ocultar o destruir", () => {
    const { slide } = fixture();
    const callbacks: FrameRequestCallback[] = [];
    const request = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return 17;
    });
    const cancel = vi.fn();
    Object.defineProperty(window, "requestAnimationFrame", { configurable: true, value: request });
    Object.defineProperty(window, "cancelAnimationFrame", { configurable: true, value: cancel });
    const observers: Array<{
      callback: ResizeObserverCallback;
      observe: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
      notify: () => void;
    }> = [];
    class FakeResizeObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        observers.push(this);
      }
      notify() {
        this.callback([], this as unknown as ResizeObserver);
      }
    }
    Object.defineProperty(window, "ResizeObserver", { configurable: true, value: FakeResizeObserver });

    const inspector = create(slide);
    inspector.show();
    expect(observers[0].observe).toHaveBeenCalledTimes(3);
    observers[0].notify();
    expect(request).toHaveBeenCalledTimes(1);
    callbacks.shift()?.(0);
    observers[0].notify();
    inspector.hide();
    expect(observers[0].disconnect).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith(17);
    const priorRafCount = request.mock.calls.length;
    observers[0].notify();
    expect(request).toHaveBeenCalledTimes(priorRafCount);

    inspector.show();
    const secondObserver = observers[0];
    secondObserver.notify();
    inspector.destroy();
    expect(secondObserver.disconnect).toHaveBeenCalled();
    expect(document.querySelector(".rea-gi")).toBeNull();
  });

  it("mantiene nombres y regiones accesibles y anuncia resultado; declara foco visible en CSS", () => {
    const { slide } = fixture();
    const inspector = create(slide);
    inspector.show();
    expect(panel().getAttribute("aria-label")).toBeTruthy();
    for (const name of ["Modo de interacción", "Bloque seleccionado", "Comparar con bloque", "x1", "y1", "x2", "y2"])
      expect(panel().querySelector(`[aria-label="${name}"]`)).not.toBeNull();
    expect(panel().querySelector("button")?.textContent).toMatch(/Ocultar|Hide/);
    expect(panel().querySelectorAll('output[aria-live="polite"]')).toHaveLength(2);
    expect(document.querySelector(".rea-gi-outlines")?.getAttribute("aria-hidden")).toBe("true");
    const css = readFileSync("public/rea-grid-inspector/inspector.css", "utf8");
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*3px/);
  });
});
