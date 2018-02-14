import {
  author,
  description,
  homepage,
  license,
  name,
  version,
} from '../package.json'

const babelSetup = {
  babelrc: false,
  presets: [['@babel/preset-env', { modules: false }]],
  plugins: ['@babel/plugin-proposal-class-properties'],
  exclude: 'node_modules/**',
}

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

const banner = `/**
  ${name} - ${description}
  @version v${version}
  @link ${homepage}
  @author ${author}
  @license ${license}
**/`

export {
  babelSetup,
  banner,
  name,
  uglifyOutput,
  version,
}
