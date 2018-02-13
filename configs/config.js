import {
  author,
  description,
  homepage,
  license,
  name,
  version
} from '../package.json'

const babelSetup = {
  babelrc: false,
  presets: [['es2015', { modules: false }]],
  plugins: ["transform-class-properties"],
  exclude: 'node_modules/**'
}

const uglifyOutput = {
  output: {
    comments: function (node, comment) {
      const text = comment.value
      const type = comment.type
      if (type === 'comment2') {
        // multiline comment
        return /@preserve|@license|@cc_on/i.test(text)
      }
    }
  }
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
  version
}
