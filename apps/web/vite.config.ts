import { devtools } from "@tanstack/devtools-vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // Must stay first: source injection, console piping, server event bus,
    // and production stripping all depend on pre-framework transforms.
    devtools(),
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
