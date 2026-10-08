import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 60000,
    // Neon over the network flakes like the legacy suite; same mitigation.
    retry: 2,
    // Compiled output must never be collected as test input.
    exclude: [...configDefaults.exclude, "dist/**"],
  },
});
