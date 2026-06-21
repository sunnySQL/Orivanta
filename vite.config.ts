import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/cesium/Build/Cesium/Workers/**/*",
          dest: "cesiumStatic/Workers",
          rename: { stripBase: 5 }
        },
        {
          src: "node_modules/cesium/Build/Cesium/ThirdParty/**/*",
          dest: "cesiumStatic/ThirdParty",
          rename: { stripBase: 5 }
        },
        {
          src: "node_modules/cesium/Build/Cesium/Assets/**/*",
          dest: "cesiumStatic/Assets",
          rename: { stripBase: 5 }
        },
        {
          src: "node_modules/cesium/Build/Cesium/Widgets/**/*",
          dest: "cesiumStatic/Widgets",
          rename: { stripBase: 5 }
        },
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
  define: {
    CESIUM_BASE_URL: JSON.stringify("/cesiumStatic/")
  },
  build: {
    target: "es2022",
    sourcemap: false,
    chunkSizeWarningLimit: 2000
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "html"]
    }
  }
});
