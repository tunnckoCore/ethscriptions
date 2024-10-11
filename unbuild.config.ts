import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: false,
    cjsBridge: false,
  },
  entries: ['src/index.ts', 'src/utils.ts'],
  externals: ['cdn-cache-control'],
});
