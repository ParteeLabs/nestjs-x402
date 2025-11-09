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
    external: ['x402', '@nestjs/common', '@nestjs/core', '@nestjs/swagger'],
    noExternal: ['reflect-metadata'],
  },
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    outDir: 'dist/cjs',
    dts: false, // Only generate declarations in the ESM build
    sourcemap: true,
    clean: false, // Avoid cleaning to preserve ESM output
    skipNodeModulesBundle: true,
    external: ['x402', '@nestjs/common', '@nestjs/core', '@nestjs/swagger'],
    noExternal: ['reflect-metadata'],
  },
]);
