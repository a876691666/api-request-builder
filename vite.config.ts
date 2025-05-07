import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: "test",
  build: {
    outDir: "../dist-static",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "test/index.html"),
      },
    },
  },
});
