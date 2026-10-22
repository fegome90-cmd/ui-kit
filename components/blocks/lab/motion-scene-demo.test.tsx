import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MOTION_PROJECTS } from "@/lib/demo/motion";
import type { MotionFrame } from "@/lib/motion/types";
import { MotionSceneDemo } from "./motion-scene-demo";

const frames = vi.hoisted(() => [] as MotionFrame[]);
vi.mock("@/lib/motion/load-driver", () => ({
  loadGsapDriver: async () => ({
    capture: () => undefined,
    play: (_snapshot: unknown, frame: MotionFrame, done: () => void) => {
      frames.push(frame);
      done();
    },
    settle: () => {},
    destroy: () => {},
  }),
}));

describe("MotionSceneDemo", () => {
  it("cambia el proyecto con detalle abierto sin reampliar ni sacar el foco del selector", async () => {
    frames.length = 0;
    const user = userEvent.setup();
    render(<MotionSceneDemo projects={MOTION_PROJECTS} />);
    await user.click(screen.getByRole("button", { name: /Facilitar el acceso/ }));
    await waitFor(() => expect(screen.getByRole("region", { name: "Facilitar el acceso" })).toBeVisible());
    expect(frames.at(-1)?.kind).toBe("open");
    const selector = screen.getByRole("combobox", { name: "Contenido del proyecto" });
    await user.selectOptions(selector, "huerto");
    await waitFor(() =>
      expect(screen.getByRole("region", { name: "Facilitar el acceso" })).toHaveTextContent(
        "Señalizar las zonas de cultivo",
      ),
    );
    expect(frames.at(-1)?.kind).toBe("content");
    expect(selector).toHaveFocus();
    expect(screen.getByRole("button", { name: /Facilitar el acceso/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/El contenido pertenece ahora al huerto/)).toBeVisible();
  });

  it("permite cambiar la política con el detalle abierto y repetir entrada desde el control explícito", async () => {
    frames.length = 0;
    const user = userEvent.setup();
    render(<MotionSceneDemo projects={MOTION_PROJECTS} />);
    await user.click(screen.getByRole("button", { name: /Sostener la participación/ }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Movimiento" }), "reduce");
    expect(screen.getByRole("region", { name: "Sostener la participación" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Volver" }));
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Sostener la participación" })).not.toBeInTheDocument(),
    );
    await user.selectOptions(screen.getByRole("combobox", { name: "Movimiento" }), "none");
    const before = frames.length;
    await user.click(screen.getByRole("button", { name: /Facilitar el acceso/ }));
    await waitFor(() => expect(screen.getByRole("region", { name: "Facilitar el acceso" })).toBeVisible());
    expect(frames).toHaveLength(before);
    await user.selectOptions(screen.getByRole("combobox", { name: "Movimiento" }), "system");
    await user.click(screen.getByRole("button", { name: "Repetir entrada" }));
    await waitFor(() => expect(frames.at(-1)?.kind).toBe("enter"));
    expect(screen.getByRole("button", { name: "Repetir entrada" })).toHaveFocus();
  });
});
