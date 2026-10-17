import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DEMO_REA_ENTRIES } from "@/lib/demo/rea";
import { ReaCatalog } from "./rea-catalog";

describe("ReaCatalog", () => {
  it("filtra por colección y por búsqueda, y el inspector sigue a la selección visible", async () => {
    const user = userEvent.setup();
    render(<ReaCatalog entries={DEMO_REA_ENTRIES} />);
    const list = screen.getByRole("list", { name: "Índice de muestras" });
    expect(within(list).getAllByRole("button")).toHaveLength(4);

    await user.click(screen.getByRole("button", { name: /^REA/ }));
    expect(within(list).getAllByRole("button")).toHaveLength(2);
    // SlideNavigator (FALP) quedó oculto: el inspector pasa a la primera visible.
    expect(screen.getByRole("region", { name: "Card Hover Lift: detalles" })).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Buscar en la biblioteca" }), "comparar");
    expect(within(list).getAllByRole("button")).toHaveLength(1);
  });

  it("si los filtros vacían el índice lo anuncia y no muestra inspector", async () => {
    const user = userEvent.setup();
    render(<ReaCatalog entries={DEMO_REA_ENTRIES} />);
    await user.type(screen.getByRole("searchbox", { name: "Buscar en la biblioteca" }), "inexistente");
    expect(screen.getByRole("status")).toHaveTextContent("Ningún componente adicional ha sido inventado.");
    expect(screen.queryByRole("region", { name: /detalles/ })).not.toBeInTheDocument();
  });
});
