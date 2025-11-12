import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    outDir: 'dist/esm',
    dts: true, // Simplified declaration configuration
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    cjsInterop: true,
  },
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    outDir: 'dist/cjs',
    outExtension: () => ({ js: '.js' }),
    dts: false, // Only generate declarations in the ESM build
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    cjsInterop: true,
  },
]);
