/* eslint import/no-extraneous-dependencies: 0 */
const babel = require('rollup-plugin-babel')
const rollup = require('rollup')
const connect = require('connect')
const eslint = require('gulp-eslint')
const fs = require('fs')
const gulp = require('gulp')
const http = require('http')
const mochaPhantomJS = require('gulp-mocha-phantomjs')
const path = require('path')
const serveStatic = require('serve-static')
const uglify = require('rollup-plugin-uglify')

var parentServer // eslint-disable-line no-var
var childServer // eslint-disable-line no-var

const pkg = require('./package.json')

const banner = `/**
  * ${pkg.name} - ${pkg.description}
  * @version ${pkg.version}
  * @link ${pkg.homepage}
  * @author ${pkg.author}
  * @license ${pkg.license} */
`
const uglifySetup = {
  output: {
    comments(node, comment) {
      const text = comment.value
      const type = comment.type
      if (type === 'comment2') return /@preserve|@license|@cc_on/i.test(text)
      return false
    }
  }
}

gulp.task('do-build', () => rollup
    .rollup({
      input: './src/postmate.js',
      plugins: [
        babel({
          exclude: 'node_modules/**'
        }),
        uglify(uglifySetup)
      ],
      treeshake: false
    })
    .then(bundle => bundle.write({
      file: 'build/postmate.min.js',
      format: 'umd',
      name: 'Postmate',
      banner,
      sourcemap: false
    })))

gulp.task('update-readme', () => {
  const readme = path.join(__dirname, 'README.md')
  const data = fs.readFileSync(readme, 'utf-8')
  const distSize = fs.statSync(path.join(__dirname, 'build', 'postmate.min.js')).size
  const updated = data.replace(
    /<span class="size">(.*?)<\/span>/,
    `<span class="size">\`${(distSize / 1024).toFixed(1)}kb\`</span>`
  )
  fs.writeFileSync(readme, updated)
})

gulp.task('lint', () =>
  gulp
    .src(['**/*.js', '!node_modules/**', '!build/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
)

gulp.task('parent-test-server', (done) => {
  parentServer = http
    .createServer(
      connect()
        .use(serveStatic('.'))
        .use(serveStatic('test/acceptance/fixtures'))
    )
    .listen(9000, done)
})

gulp.task('child-test-server', (done) => {
  childServer = http
    .createServer(
      connect()
        .use(serveStatic('.'))
        .use(serveStatic('test/acceptance/fixtures'))
    )
    .listen(9001, done)
})

gulp.task('do-test', () => {
  const stream = mochaPhantomJS({
    phantomjs: {
      useColors: true
    }
  })
  stream.write({ path: 'http://localhost:9001/test/acceptance/runner.html' })
  stream.end()
  return stream
})

gulp.task('test', ['parent-test-server', 'child-test-server', 'do-test'], () => {
  parentServer.close()
  childServer.close()
})

gulp.task('watch', () => gulp.watch('./src/postmate.js', ['build']))
gulp.task('build', ['do-build', 'update-readme'])
gulp.task('build-watch', ['build', 'watch'])
