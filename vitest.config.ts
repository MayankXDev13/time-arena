import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."),
    },
  },
  test: {
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 60000,
    retry: 2,
  },
});
