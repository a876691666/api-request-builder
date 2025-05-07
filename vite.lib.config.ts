import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import UnoCSS from 'unocss/vite'
import dts from 'vite-plugin-dts'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({
      mode: 'global',
      configFile: './uno.config.ts'
    }),
    dts({
      include: ['lib/**/*.ts', 'lib/**/*.vue'],
      outDir: 'dist',
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: './tsconfig.lib.json'
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'ApiRequestBuilder',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'ant-design-vue'],
      output: {
        globals: {
          vue: 'Vue',
          'ant-design-vue': 'antd'
        },
        assetFileNames: 'index.css'
      }
    },
    sourcemap: false,
    minify: true,
    cssCodeSplit: false
  }
}); 