import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pager, StatusTabs } from "./navigation";

describe("Pager", () => {
  it("desactiva las flechas en los extremos", () => {
    const { rerender } = render(<Pager page={1} total={3} />);
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeEnabled();
    rerender(<Pager page={3} total={3} />);
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
  });
});

describe("StatusTabs", () => {
  it("marca la activa, muestra el check solo si done y avisa el cambio", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <StatusTabs
        active="a"
        onChange={onChange}
        tabs={[
          { id: "a", label: "Nutrición", done: true },
          { id: "b", label: "Invasivos" },
        ]}
      />,
    );
    expect(screen.getByRole("tab", { name: /Nutrición/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("img", { name: "con indicaciones" })).toHaveLength(1);
    await user.click(screen.getByRole("tab", { name: "Invasivos" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
