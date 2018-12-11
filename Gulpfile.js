const connect = require('connect')
const gulp = require('gulp')
const http = require('http')
const mochaPhantomJS = require('gulp-mocha-phantomjs')
const path = require('path')
const serveStatic = require('serve-static')

let parentServer
let childServer

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

gulp.task('finish-test', (done) => {
  parentServer.close()
  childServer.close()
  done()
})

gulp.task('test', gulp.series('parent-test-server', 'child-test-server', 'do-test', 'finish-test'))
