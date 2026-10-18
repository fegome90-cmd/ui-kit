import { expect, test } from "@playwright/test";
import { COMPONENTS } from "../lib/component-registry";

test("Explorar: buscar y filtrar dejan los filtros en la URL", async ({ page }) => {
  await page.goto("/componentes/explorar");
  await page.getByRole("searchbox", { name: "Buscar componentes" }).fill("slider");
  await expect(page).toHaveURL(/\?q=slider$/);
  const familia = page.getByRole("group", { name: "Familia" });
  await familia.getByRole("button", { name: /^Kraa/ }).click();
  await expect(page).toHaveURL(/\?q=slider&familia=Kraa$/);
  await expect(page.getByRole("status")).toHaveText(`1 componente de ${COMPONENTS.length}`);
  await expect(page.locator("main .cb-card")).toHaveCount(1);
});

test("Explorar: una URL con filtros los restaura y sin resultados lo dice", async ({ page }) => {
  await page.goto("/componentes/explorar?grupo=datos&familia=REMI");
  await expect(page.getByRole("group", { name: "Grupo" }).getByRole("button", { name: /^Datos/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("Ningún componente cumple estos filtros")).toBeVisible();
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page).toHaveURL(/\/componentes\/explorar$/);
  await expect(page.locator("main .cb-card")).toHaveCount(COMPONENTS.length);
});

test("⌘K lleva a un componente desde cualquier página", async ({ page }) => {
  await page.goto("/componentes");
  await page.getByRole("button", { name: /Buscar/ }).click();
  await page.getByRole("textbox", { name: "Buscar comandos" }).fill("rueda");
  await page.getByRole("button", { name: /Rueda de categorías/ }).click();
  await expect(page).toHaveURL(/\/componentes\/lab-category-wheel$/);
});
