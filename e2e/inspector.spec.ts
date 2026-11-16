import { expect, test } from "@playwright/test";

test("inspector: selección, cotas, bloque oculto, regla por teclado e impresión", async ({ page }) => {
  await page.goto("/rea-grid-inspector/columns.html");
  await page.getByRole("button", { name: "Mostrar inspector" }).click();
  await page.getByLabel("Modo de interacción").selectOption("select");
  await page.locator(".a h2").click();
  await expect(page.getByLabel("Bloque seleccionado")).toHaveValue("1");
  const output = page.locator(".rea-gi-panel > output").first();
  await expect(output).toContainText("x 48 px");
  await expect(page.locator(".rea-gi-dimension")).toHaveCount(4);
  await page.getByLabel("Comparar con bloque").selectOption("2");
  await expect(output).toContainText("distancia 52 px");
  await page.locator(".b").evaluate((el) => {
    (el as HTMLElement).style.display = "none";
  });
  await expect(output).toContainText("Bloque comparado no visible");
  await expect(output).not.toContainText("distancia");
  await expect(page.locator(".rea-gi-dimension")).toHaveCount(4);
  await page.getByLabel("Modo de interacción").selectOption("ruler");
  for (const [name, value] of Object.entries({ x1: "0", y1: "0", x2: "200", y2: "100" })) {
    await page.getByLabel(name, { exact: true }).fill(value);
    await page.getByLabel(name, { exact: true }).press("Tab");
  }
  await expect(page.locator(".rea-gi-panel")).toContainText("223.6");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".rea-gi")).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await expect(page.locator(".rea-gi")).toBeVisible();
});

test("inspector: conserva referencia entre slides y distingue tamaños", async ({ page }) => {
  await page.goto("/rea-grid-inspector/comparison.html");
  await page.getByRole("button", { name: "Mostrar inspector" }).click();
  await page.getByLabel("Bloque seleccionado").selectOption("0");
  await page.getByRole("button", { name: "Guardar referencia" }).click();
  await page.locator('[data-slide="1"]').click();
  await expect(page.getByLabel("Modo de interacción")).toHaveValue("read");
  await page.getByLabel("Bloque seleccionado").selectOption("0");
  await expect(page.getByLabel("Comparación histórica")).toContainText("Δx 24; Δy 27; Δw 48; Δh 27 px");
  await page.locator('[data-slide="2"]').click();
  await page.getByLabel("Bloque seleccionado").selectOption("0");
  await expect(page.getByLabel("Comparación histórica")).toContainText("delta px no comparable");
});
