/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve, dirname } from 'path';
import { defineConfig } from 'vite';
// import dts from 'vite-plugin-dts';

const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    target: 'es2020', // default is 'modules' which is a vite special value
    sourcemap: 'hidden',
    lib: {
      entry: resolve(__dirname, 'src/typeahead-standalone.ts'),
      name: 'typeahead',
      fileName: (format) => `typeahead-standalone.${format}${format === 'umd' ? '.js' : '.mjs'}`,
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name == 'style.css') return 'basic.css';
          return assetInfo.name;
        },
      },
    },
  },
  test: {
    include: ['**/*.spec.js'],
    globals: true,
  },
  server: {
    open: '/demo/index.umd.html',
  },
  // This emits a types.d.ts within the dist/ folder
  // plugins: [dts({ rollupTypes: true })],
});
