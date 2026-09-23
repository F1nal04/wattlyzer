import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import path from "node:path";
import packageJson from "./package.json";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    {
      // Deployed sessions poll /version.json to notice a newer release.
      name: "wattlyzer-version-json",
      generateBundle() {
        if (this.environment.name !== "client") return;
        this.emitFile({
          type: "asset",
          fileName: "version.json",
          source: JSON.stringify({ version: packageJson.version }),
        });
      },
    },
    tanstackStart(),
    netlify(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
