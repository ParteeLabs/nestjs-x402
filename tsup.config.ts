import { defineConfig } from 'tsup';

export default defineConfig((overrideOptions) => {
  const commonOptions = {
    entry: ['src/index.ts'],
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    cjsInterop: true,
    ...overrideOptions,
  };
  return [
    {
      ...commonOptions,
      format: ['esm'],
      outDir: 'dist/esm',
      dts: true, // Simplified declaration configuration
    },
    {
      ...commonOptions,
      format: ['cjs'],
      outDir: 'dist/cjs',
      dts: false, // Only generate declarations in the ESM build
    },
  ];
});
