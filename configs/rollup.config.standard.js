import {
  babelSetup,
  banner,
} from '../configs/config'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

const uglifyOutput = {
  // compress: {
  //   pure_getters: true,
  //   unsafe: true,
  // },
  // toplevel: true,
  output: {
    comments: function (node, comment) { // eslint-disable-line func-names
      const text = comment.value
      const type = comment.type
      if (type === 'comment2') {
        // multiline comment
        return /@preserve|@license|@cc_on/i.test(text)
      }
    },
  },
}

export default {
  input: 'src/index.js',
  plugins: [
    babel(babelSetup),
    uglify(uglifyOutput),
  ],
  output: {
    banner,
    file: 'build/postmate.min.js',
    format: 'umd',
    name: 'Postmate',
    sourcemap: false,
  },
}
