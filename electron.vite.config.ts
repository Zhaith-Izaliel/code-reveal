import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import prismjs from "vite-plugin-prismjs";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
    },
  },
  renderer: {
    resolve: {
      alias: [
        {
          find: "@renderer",
          replacement: resolve(__dirname, "./src/renderer/src"),
        },
        { find: "@", replacement: resolve(__dirname, "./src") },
      ],
    },
    plugins: [vue(), tailwindcss(), prismjs({ languages: "all" })],
  },
});
