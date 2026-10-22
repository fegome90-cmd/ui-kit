import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MotionDriver, MotionFrame, SceneHost, TransitionResult } from "@/lib/motion/types";
import { FocusExpand, type FocusExpandHandle, type FocusExpandItem } from "./focus-expand";
import { SceneEnter, type SceneEnterHandle } from "./scene-enter";
import { StepReveal } from "./step-reveal";

const items: FocusExpandItem[] = [
  { id: "a", title: "Objetivo A", summary: "Resumen A", content: <p>Contenido A original</p> },
  { id: "b", title: "Objetivo B", summary: "Resumen B", content: <p>Contenido B original</p> },
];

function driverFixture(complete = true) {
  let host: SceneHost;
  const frames: MotionFrame[] = [];
  const driver: MotionDriver = {
    capture: vi.fn(() => undefined),
    play: vi.fn((_snapshot, frame, done) => {
      frames.push(frame);
      if (complete) done();
    }),
    settle: vi.fn(),
    destroy: vi.fn(),
  };
  const loadDriver = vi.fn(async (nextHost: SceneHost) => {
    host = nextHost;
    return driver;
  });
  return {
    driver,
    frames,
    loadDriver,
    get host() {
      return host;
    },
  };
}

async function driverReady(fixture: ReturnType<typeof driverFixture>) {
  await act(async () => {
    await Promise.resolve();
  });
  expect(fixture.loadDriver).toHaveBeenCalled();
}

afterEach(() => vi.restoreAllMocks());

describe("FocusExpand: commit, intención y foco", () => {
  it("mantiene el origen y texto anteriores hasta la captura; play observa el commit nuevo", async () => {
    const fixture = driverFixture();
    const { rerender } = render(
      <FocusExpand label="Objetivos" items={items} value={null} contentKey="uno" loadDriver={fixture.loadDriver} />,
    );
    await driverReady(fixture);
    const order: string[] = [];
    vi.mocked(fixture.driver.capture).mockImplementation(() => {
      order.push("capture");
      expect(fixture.host.root).toHaveTextContent("Objetivo A");
      expect(fixture.host.root).not.toHaveTextContent("Título actualizado");
      expect(fixture.host.root.dataset.motionContentKey).toBe("uno");
      return undefined;
    });
    vi.mocked(fixture.driver.play).mockImplementation((_snapshot, _frame, done) => {
      order.push("play");
      expect(fixture.host.root).toHaveTextContent("Título actualizado");
      expect(fixture.host.root.dataset.motionContentKey).toBe("dos");
      expect(fixture.host.getDetailHeading()).toHaveTextContent("Título actualizado");
      done();
    });
    const updated = [{ ...items[0], title: "Título actualizado", content: <p>Contenido actualizado</p> }, items[1]];
    rerender(
      <FocusExpand
        label="Objetivos"
        items={updated}
        value="a"
        contentKey="dos"
        origin="deck-forward"
        loadDriver={fixture.loadDriver}
      />,
    );
    await waitFor(() => expect(order).toEqual(["capture", "play"]));
    expect(screen.getByRole("region", { name: "Título actualizado" })).toHaveTextContent("Contenido actualizado");
  });

  it("cambia solo contenido con la misma selección, conserva el foco y no recaptura geometría", async () => {
    const fixture = driverFixture();
    const { rerender } = render(
      <>
        <button type="button">Selector externo</button>
        <FocusExpand
          label="Objetivos"
          items={items}
          defaultValue="a"
          contentKey="uno"
          origin="pointer"
          loadDriver={fixture.loadDriver}
        />
      </>,
    );
    await driverReady(fixture);
    screen.getByRole("button", { name: "Selector externo" }).focus();
    const updated = [{ ...items[0], content: <p>Contenido A revisado</p> }, items[1]];
    rerender(
      <>
        <button type="button">Selector externo</button>
        <FocusExpand
          label="Objetivos"
          items={updated}
          defaultValue="a"
          contentKey="dos"
          origin="pointer"
          loadDriver={fixture.loadDriver}
        />
      </>,
    );
    await waitFor(() => expect(fixture.frames.at(-1)?.kind).toBe("content"));
    expect(fixture.driver.capture).not.toHaveBeenCalled();
    expect(screen.getByRole("region", { name: "Objetivo A" })).toHaveTextContent("Contenido A revisado");
    expect(screen.getByRole("button", { name: "Selector externo" })).toHaveFocus();
    expect(screen.getByRole("button", { name: /Objetivo A/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("abre por teclado, cambia de objetivo y Escape retorna al disparador vigente", async () => {
    const user = userEvent.setup();
    const outerEscape = vi.fn();
    render(
      // biome-ignore lint/a11y/noStaticElementInteractions: anfitrión de prueba que detecta Escape propagado por sus controles hijos.
      <div onKeyDown={outerEscape}>
        <FocusExpand label="Objetivos" items={items} loadDriver={false} />
      </div>,
    );
    const first = screen.getByRole("button", { name: /Objetivo A/ });
    first.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Objetivo A" })).toHaveFocus());
    expect(first).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: /Objetivo B/ }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Objetivo B" })).toHaveFocus());
    outerEscape.mockClear();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByRole("button", { name: /Objetivo B/ })).toHaveFocus());
    expect(screen.queryByRole("region", { name: "Objetivo B" })).not.toBeInTheDocument();
    expect(outerEscape).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(outerEscape).toHaveBeenCalledOnce();
  });

  it("una selección controlada espera al consumidor y los cambios directos conservan el foco", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <FocusExpand label="Objetivos" items={items} value={null} onValueChange={change} loadDriver={false} />,
    );
    const button = screen.getByRole("button", { name: /Objetivo A/ });
    await user.click(button);
    expect(change).toHaveBeenCalledWith("a");
    expect(button).toHaveAttribute("aria-expanded", "false");
    rerender(<FocusExpand label="Objetivos" items={items} value="b" onValueChange={change} loadDriver={false} />);
    await waitFor(() => expect(screen.getByRole("region", { name: "Objetivo B" })).toBeVisible());
    expect(button).toHaveFocus();
  });

  it("resuelve todas las solicitudes rápidas y no confirma el commit abortado", async () => {
    const ref = createRef<FocusExpandHandle>();
    render(<FocusExpand ref={ref} label="Objetivos" items={items} loadDriver={false} />);
    let first: Promise<TransitionResult> | undefined;
    let second: Promise<TransitionResult> | undefined;
    act(() => {
      first = ref.current?.transitionTo({ view: "detail", targetId: "a" }, { origin: "deck-forward" });
      second = ref.current?.transitionTo({ view: "detail", targetId: "b" }, { origin: "deck-forward" });
    });
    await expect(first).resolves.toMatchObject({ status: "superseded" });
    await expect(second).resolves.toMatchObject({ status: "completed" });
    expect(screen.getByRole("region", { name: "Objetivo B" })).toHaveTextContent("Contenido B original");
    expect(screen.getByRole("button", { name: /Objetivo A/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("desmontar cancela una transición pendiente y destruye su driver sin avisos de lifecycle", async () => {
    const fixture = driverFixture(false);
    const ref = createRef<FocusExpandHandle>();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = render(
      <StrictMode>
        <FocusExpand ref={ref} label="Objetivos" items={items} loadDriver={fixture.loadDriver} />
      </StrictMode>,
    );
    await driverReady(fixture);
    let result: Promise<TransitionResult> | undefined;
    act(() => {
      result = ref.current?.transitionTo({ view: "detail", targetId: "a" }, { origin: "deck-forward" });
    });
    await waitFor(() => expect(fixture.driver.play).toHaveBeenCalled());
    unmount();
    await expect(result).resolves.toMatchObject({ status: "destroyed" });
    expect(fixture.driver.destroy).toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
  });

  it("una recuperación fallida antigua no sustituye una intención más reciente", async () => {
    const ref = createRef<FocusExpandHandle>();
    const resultObserver = vi.fn();
    render(
      <FocusExpand ref={ref} label="Objetivos" items={items} loadDriver={false} onTransitionResult={resultObserver} />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    resultObserver.mockClear();
    let failed: Promise<TransitionResult> | undefined;
    let latest: Promise<TransitionResult> | undefined;
    act(() => {
      failed = ref.current?.transitionTo({ view: "detail", targetId: "ausente" }, { origin: "direct" });
      latest = ref.current?.transitionTo({ view: "detail", targetId: "b" }, { origin: "direct" });
    });
    await expect(failed).resolves.toMatchObject({ status: "failed" });
    await expect(latest).resolves.toMatchObject({ status: "completed" });
    expect(screen.getByRole("region", { name: "Objetivo B" })).toBeVisible();
    expect(resultObserver).toHaveBeenCalledOnce();
    expect(resultObserver).toHaveBeenCalledWith(expect.objectContaining({ status: "completed" }));
  });

  it("conserva los controles ante fallo de carga y recupera overview si desaparece el objetivo", async () => {
    const user = userEvent.setup();
    const error = vi.fn();
    const loadDriver = vi.fn(async () => {
      throw new Error("Motor no disponible");
    });
    const { rerender } = render(
      <FocusExpand label="Objetivos" items={items} contentKey="uno" onMotionError={error} loadDriver={loadDriver} />,
    );
    await waitFor(() => expect(error).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: /Objetivo A/ }));
    await waitFor(() => expect(screen.getByRole("region", { name: "Objetivo A" })).toBeVisible());
    rerender(
      <FocusExpand
        label="Objetivos"
        items={[items[1]]}
        contentKey="dos"
        onMotionError={error}
        loadDriver={loadDriver}
      />,
    );
    await waitFor(() => expect(screen.queryByRole("region", { name: "Objetivo A" })).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Objetivo B/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("el host expone fondos decorativos separados y cada instancia conserva su región", async () => {
    const fixture = driverFixture();
    render(
      <>
        <FocusExpand label="Primera" items={items} loadDriver={fixture.loadDriver} />
        <FocusExpand label="Segunda" items={items} loadDriver={false} />
      </>,
    );
    await driverReady(fixture);
    const first = screen.getByRole("region", { name: "Primera" });
    const second = screen.getByRole("region", { name: "Segunda" });
    expect(
      within(first)
        .getByRole("button", { name: /Objetivo A/ })
        .getAttribute("aria-controls"),
    ).not.toBe(
      within(second)
        .getByRole("button", { name: /Objetivo A/ })
        .getAttribute("aria-controls"),
    );
    const surface = fixture.host.resolveTarget("a");
    expect(surface?.isConnected).toBe(true);
    expect(surface?.textContent).toBe("");
    expect(surface?.contains(fixture.host.getReturnFocus("a"))).toBe(false);
    expect(fixture.host.getTargets()).toHaveLength(2);
    expect(first.querySelector('[data-motion-role="detail-surface"]')?.textContent).toBe("");
  });
});

describe("SceneEnter y StepReveal", () => {
  it("SSR parte de contenido legible y estable, sin consultar preferencias durante el render", () => {
    const media = vi.spyOn(window, "matchMedia");
    const html = renderToString(
      <>
        <SceneEnter origin="deck-forward">
          <p>Escena legible</p>
        </SceneEnter>
        <StepReveal stateKey="inicio">Comentario legible</StepReveal>
        <FocusExpand label="Objetivos" items={items} defaultValue="a" />
      </>,
    );
    expect(html).toContain("Escena legible");
    expect(html).toContain("Comentario legible");
    expect(html).toContain("Contenido A original");
    expect(html).not.toContain("opacity:0");
    expect(media).not.toHaveBeenCalled();
  });

  it("la entrada es explícita; volver no anima y operar durante la entrada la estabiliza", async () => {
    const fixture = driverFixture(false);
    const ref = createRef<SceneEnterHandle>();
    const { rerender } = render(
      <SceneEnter ref={ref} entryKey={0} origin="direct" loadDriver={fixture.loadDriver}>
        <button type="button">Operar</button>
      </SceneEnter>,
    );
    await driverReady(fixture);
    expect(fixture.driver.play).not.toHaveBeenCalled();
    rerender(
      <SceneEnter ref={ref} entryKey={1} origin="deck-back" loadDriver={fixture.loadDriver}>
        <button type="button">Operar</button>
      </SceneEnter>,
    );
    expect(fixture.driver.play).not.toHaveBeenCalled();
    act(() => ref.current?.enter("deck-forward"));
    await waitFor(() => expect(fixture.frames.at(-1)?.kind).toBe("enter"));
    const before = vi.mocked(fixture.driver.settle).mock.calls.length;
    fireEvent.pointerDown(screen.getByRole("button", { name: "Operar" }));
    expect(vi.mocked(fixture.driver.settle).mock.calls.length).toBeGreaterThan(before);
    expect(screen.getByRole("button", { name: "Operar" }).closest("[data-motion-phase]")).toHaveAttribute(
      "data-motion-phase",
      "idle",
    );
  });

  it("el comentario cancela el fundido anterior, reserva área y respeta reduce/none", () => {
    const previous = Object.getOwnPropertyDescriptor(Element.prototype, "animate");
    const cancel = vi.fn();
    const animate = vi.fn(() => ({ cancel }));
    Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate });
    try {
      const { rerender, unmount } = render(
        <StepReveal stateKey="uno" minBlockSize="7rem">
          Primero
        </StepReveal>,
      );
      expect(animate).not.toHaveBeenCalled();
      rerender(
        <StepReveal stateKey="dos" minBlockSize="7rem">
          Segundo
        </StepReveal>,
      );
      expect(animate).toHaveBeenLastCalledWith(
        [{ opacity: 0 }, { opacity: 1 }],
        expect.objectContaining({ duration: 160 }),
      );
      expect(screen.getByText("Segundo").parentElement?.style.minBlockSize).toBe("7rem");
      rerender(
        <StepReveal stateKey="tres" motionPolicy="reduce">
          Tercero
        </StepReveal>,
      );
      expect(cancel).toHaveBeenCalledOnce();
      expect(animate).toHaveBeenLastCalledWith(
        [{ opacity: 0 }, { opacity: 1 }],
        expect.objectContaining({ duration: 100 }),
      );
      rerender(
        <StepReveal stateKey="cuatro" motionPolicy="none">
          Cuarto
        </StepReveal>,
      );
      expect(cancel).toHaveBeenCalledTimes(2);
      expect(animate).toHaveBeenCalledTimes(2);
      expect(screen.getByText("Cuarto")).toBeVisible();
      unmount();
    } finally {
      if (previous) Object.defineProperty(Element.prototype, "animate", previous);
      else Reflect.deleteProperty(Element.prototype, "animate");
    }
  });
});
