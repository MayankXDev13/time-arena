import { devtools } from "@tanstack/devtools-vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Connect, type Plugin } from "vite";

function locateDevtoolsUiAssets(fromDir: string): string {
  // 1. Classic hoisted layouts (npm/pnpm workspaces): walk upward.
  let dir = fromDir;
  while (true) {
    const cand = path.join(dir, "node_modules/@tanstack/devtools-ui/dist/assets");
    if (existsSync(cand)) return cand;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // 2. Bun's isolated store: node_modules/.bun/@tanstack+devtools-ui@*/…
  try {
    const store = path.resolve(fromDir, "../../node_modules/.bun");
    for (const entry of readdirSync(store)) {
      if (!entry.startsWith("@tanstack+devtools-ui@")) continue;
      const cand = path.join(
        store,
        entry,
        "node_modules/@tanstack/devtools-ui/dist/assets",
      );
      if (existsSync(cand)) return cand;
    }
  } catch {
    // No store present: middleware stays registered but never matches.
  }
  return "";
}

/**
 * Dev-only: @tanstack/devtools-ui references its font binaries with URLs
 * that resolve in its dist build but 404 under Vite dev (esbuild
 * pre-bundling flattens them to /assets/*). Serve the real package files
 * so the devtools shell renders with its fonts instead of OTS console
 * errors. Never ships: dev-only middleware + prod strips devtools anyway.
 */
function devtoolsUiFonts(): Plugin {
  // Resolved by scanning for the (transitively installed) package, so this
  // keeps working regardless of where the manager links the workspace tree.
  const assetsDir = locateDevtoolsUiAssets(import.meta.dirname);
  const mime: Record<string, string> = {
    ttf: "font/ttf",
    woff2: "font/woff2",
  };
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const pathname = (req.url ?? "").split("?")[0];
    const match = pathname.match(/^\/assets\/([^/]+\.(ttf|woff2))$/);
    if (!match || !assetsDir) return next();
    const file = path.join(assetsDir, match[1]);
    if (!file.startsWith(assetsDir) || !existsSync(file)) return next();
    res.setHeader("Content-Type", mime[match[2]] ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.end(readFileSync(file));
  };
  return {
    name: "devtools-ui-fonts",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [
    // Must stay first: source injection, console piping, server event bus,
    // and production stripping all depend on pre-framework transforms.
    devtools(),
    devtoolsUiFonts(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  preview: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
