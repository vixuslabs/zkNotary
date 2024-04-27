import { defineConfig } from 'tsup';

export default defineConfig((opts) => ({
  entry: ['./src/**/*'],
  dts: true,
  format: ['esm'],
  clean: !opts.watch,
  outDir: 'build/src',
}));
