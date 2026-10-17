import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    projects: [
      { extends: true, test: { name: "unit", environment: "node", include: ["lib/**/*.test.ts"] } },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["components/**/*.test.tsx"],
          setupFiles: ["./test/setup-dom.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts", "components/ui/**/*.{ts,tsx}", "components/blocks/**/*.tsx"],
      exclude: ["**/*.test.*", "lib/generated/**", "lib/demo/**"],
      reporter: ["text-summary", "html"],
    },
  },
});
