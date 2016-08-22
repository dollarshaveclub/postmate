
const babel = require('rollup-plugin-babel');
const connect = require('connect');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const header = require('gulp-header');
const http = require('http');
const minify = require('uglify-js').minify;
const mochaPhantomJS = require('gulp-mocha-phantomjs');
const rollup = require('rollup-stream');
const serveStatic = require('serve-static');
const source = require('vinyl-source-stream');
const uglify = require('rollup-plugin-uglify');

var parentServer
var childServer;

const pkg = require('./package.json');
const banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.task('build', () =>
  rollup({
    entry: './lib/postmate.js',
    format: 'umd',
    moduleName: 'Postmate',
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
      uglify({}, minify),
    ],
  })
    .pipe(source('postmate.min.js'))
    .pipe(header(banner, { pkg }))
    .pipe(gulp.dest('./build'))
);

gulp.task('lint', () =>
  gulp.src(['**/*.js', '!node_modules/**', '!build/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('parent-test-server', done => {
  parentServer = http.createServer(
      connect()
        .use(serveStatic('.'))
        .use(serveStatic('test/fixtures'))
    )
    .listen(9000, done);
});
gulp.task('child-test-server', done => {
  childServer = http.createServer(
      connect()
        .use(serveStatic('.'))
        .use(serveStatic('test/fixtures'))
    )
    .listen(9001, done);
});

gulp.task('test', ['parent-test-server', 'child-test-server'], () => {
  const stream = mochaPhantomJS();
  stream.write({ path: 'http://localhost:9001/test/runner.html' });
  stream.end();
  return stream;
});

gulp.task('watch', () => gulp.watch('./lib/postmate.js', ['build']));
gulp.task('build-watch', ['build', 'watch']);
