import {
  babelSetup,
  banner,
  name,
  uglifyOutput,
  version
} from '../configs/config'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default {
  input: 'src/index.js',
  plugins: [
    babel(babelSetup),
    uglify(uglifyOutput)
  ],
  treeshake: false,
  output: {
    banner,
    file: 'build/postmate.es.js',
    format: 'es',
    name: 'Postmate',
    sourcemap: false
  }
}
