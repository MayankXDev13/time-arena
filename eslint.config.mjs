import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Monorepo: new workspaces have their own pipelines; ignore build output.
    "apps/**/dist/**",
    "packages/**/dist/**",
    // Monorepo: legacy lint covers the legacy Next.js tree only.
    // apps/* and packages/* are governed by `turbo lint`.
    "apps/**",
    "packages/**",
  ]),
]);

export default eslintConfig;
