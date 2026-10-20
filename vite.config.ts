import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The app is served from https://<user>.github.io/betrihagvisar/ on GitHub Pages.
// Override with VITE_BASE=/ (or another path) when hosting elsewhere.
const base = process.env.VITE_BASE ?? "/betrihagvisar/";

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ["echarts/core", "echarts/charts", "echarts/components", "echarts/renderers"],
          react: ["react", "react-dom", "react-router-dom"],
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
        },
      },
    },
  },
});
