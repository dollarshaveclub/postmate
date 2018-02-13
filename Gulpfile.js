const connect = require('connect')
const gulp = require('gulp')
const http = require('http')
const mochaPhantomJS = require('gulp-mocha-phantomjs')
const path = require('path')
const serveStatic = require('serve-static')

let parentServer 
let childServer 

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
