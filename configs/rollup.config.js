import {
  babelSetup,
  banner,
} from '../configs/config'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'
import pkg from '../package.json'

const ensureArray = maybeArr => Array.isArray(maybeArr) ? maybeArr : [maybeArr]

const uglifyOutput = {
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

const createConfig = ({ output, env } = {}) => {
  const umd = output.format === 'umd'

  if (umd && typeof env === 'undefined') {
    throw new Error('You need to specify `env` when using umd format.')
  }

  const min = umd && env === 'production'

  return {
    input: 'src/index.js',
    plugins: [
      babel(babelSetup),
      env && replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      min && uglify(uglifyOutput),
    ].filter(Boolean),
    output: ensureArray(output).map(format =>
      Object.assign(
        {},
        format,
        {
          banner,
          name: 'Postmate',
        },
      ),
    ),
  }
}

export default [
  createConfig({
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  }),
  createConfig({
    output: {
      file: 'build/postmate.min.js',
      format: 'umd',
    },
    env: 'production',
  }),
  createConfig({
    output: {
      file: 'build/postmate.dev.js',
      format: 'umd',
    },
    env: 'development',
  }),
]
