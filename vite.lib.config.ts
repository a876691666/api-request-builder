import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
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
        }
      }
    }
  }
}); 