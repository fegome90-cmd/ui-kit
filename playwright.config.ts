import { defineConfig, devices } from "@playwright/test";

/* Smoke e2e contra el build de producción (next start).
   Requiere `npm run build` antes. En el Mac: `npx playwright install chromium` una vez. */
const PORT = 3211;

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/componentes`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
