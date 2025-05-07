import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import UnoCSS from 'unocss/vite'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    vue(),
    UnoCSS(),
  ],
  root: "test",
  build: {
    outDir: "../docs",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "test/index.html"),
      },
    },
  },
}); 