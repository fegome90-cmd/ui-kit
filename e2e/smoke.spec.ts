import { expect, type Page, test } from "@playwright/test";
import { COMPONENTS } from "../lib/component-registry";

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test("la raíz redirige al banco", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/componentes$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("UI Kit");
});

test("Banco: cada componente del registro carga su vista previa sin errores", async ({ page }) => {
  const errors = trackErrors(page);
  for (const c of COMPONENTS) {
    await page.goto(`/componentes/${c.slug}`);
    // Algunas vistas previas (titular animado, lienzo Kraa) traen su propio h1.
    await expect(page.locator(".cb-article > h1")).toHaveText(c.name);
    await expect(page.locator(".cb-preview")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
