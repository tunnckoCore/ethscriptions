import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/utils.ts'],
  splitting: false,
  clean: true,
  banner: { js: '// SPDX-License-Identifier: MPL-2.0' },
  cjsInterop: false,
  dts: true,
  format: 'esm',
});
