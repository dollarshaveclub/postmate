import {
  babelSetup,
  banner,
} from '../configs/config'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  plugins: [
    babel(babelSetup),
  ],
  output: {
    banner,
    file: 'build/postmate.es.js',
    format: 'es',
    name: 'Postmate',
    sourcemap: false,
  },
}
