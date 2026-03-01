/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from 'path';
import { defineConfig } from 'vite';
// import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    target: 'es2020', // default is 'modules' which is a vite special value
    sourcemap: 'hidden',
    lib: {
      entry: resolve(import.meta.dirname, 'src/typeahead-standalone.ts'),
      name: 'typeahead',
      fileName: (format) => `typeahead-standalone.${format}${format === 'umd' ? '.js' : '.mjs'}`,
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? assetInfo.names?.[0] ?? '';
          if (name.endsWith('.css')) return 'basic.css';
          return name;
        },
      },
    },
  },
  test: {
    include: ['**/*.spec.ts'],
    globals: true,
  },
  server: {
    open: '/demo/index.umd.html',
  },
  // This emits a types.d.ts within the dist/ folder
  // plugins: [dts({ rollupTypes: true })],
});
