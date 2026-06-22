import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "data/catalog.json",
          dest: "data",
          rename: { stripBase: 1 }
        },
        {
          src: "data/layers/**/*",
          dest: "data/layers",
          rename: { stripBase: 2 }
        }
      ]
    })
  ],
  build: {
    target: "es2022",
    sourcemap: false,
    chunkSizeWarningLimit: 2000
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "html"]
    }
  }
});
