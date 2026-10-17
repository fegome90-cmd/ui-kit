import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { COMPONENTS } from "@/lib/component-registry";
import { PREVIEWS, Preview, THUMBS, Thumb } from "./previews";

describe("vistas previas del banco", () => {
  // Sin esto, un componente registrado sin vista previa deja una tarjeta vacía sin que nada falle.
  it("cada entrada del registro tiene vista previa y miniatura, y no sobra ninguna", () => {
    const slugs = COMPONENTS.map((c) => c.slug).sort();
    expect(Object.keys(PREVIEWS).sort()).toEqual(slugs);
    expect(Object.keys(THUMBS).sort()).toEqual(slugs);
  });

  it.each(COMPONENTS.map((c) => c.slug))("%s se renderiza sin errores", (slug) => {
    const { container, unmount } = render(
      <>
        <Preview slug={slug} />
        <Thumb slug={slug} />
      </>,
    );
    expect(container.textContent).not.toContain("Sin vista previa.");
    unmount();
  });

  it("REMI se renderiza bajo .remi y Kraa bajo .kraa-theme", () => {
    const { container } = render(
      <>
        <Preview slug="blue-button" />
        <Preview slug="kraa-button" />
      </>,
    );
    expect(container.querySelector(".remi [data-slot=blue-button]")).not.toBeNull();
    expect(container.querySelector(".kraa-theme [data-slot=kraa-button]")).not.toBeNull();
  });
});
