import { nodeResolve } from '@rollup/plugin-node-resolve';

// eslint-disable-next-line no-undef
const dev = process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/panel.js',
    output: {
      dir: '../custom_components/kubernetes/frontend/www/',
      format: 'es',
      sourcemap: dev ? true : false,
    },
    plugins: [
      nodeResolve(),
    ],
    watch: {
      exclude: 'node_modules/**',
    },
  },
];