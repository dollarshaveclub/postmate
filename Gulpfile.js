
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const connect = require('connect');
const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const header = require('gulp-header');
const http = require('http');
const mochaPhantomJS = require('gulp-mocha-phantomjs');
const path = require('path');
const serveStatic = require('serve-static');

var parentServer; // eslint-disable-line no-var
var childServer; // eslint-disable-line no-var

const pkg = require('./package.json');
const banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @author <%= pkg.author %>',
  ' * @license <%= pkg.license %> */',
  ''].join('\n');

gulp.task('do-build', () =>
  gulp.src('./src/postmate.js')
    .pipe(babel())
    .pipe(uglify())
    .pipe(header(banner, { pkg }))
    .pipe(rename('postmate.min.js'))
    .pipe(gulp.dest('./build'))
);

gulp.task('update-readme', ['do-build'], () => {
  const readme = path.join(__dirname, 'README.md');
  const data = fs.readFileSync(readme, 'utf-8');
  const distSize = fs.statSync(path.join(__dirname, 'build', 'postmate.min.js')).size;
  const updated = data.replace(/<span class="size">(.*?)<\/span>/,
    `<span class="size">\`${(distSize / 1024).toFixed(1)}kb\`</span>`);
  fs.writeFileSync(readme, updated);
});

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

gulp.task('do-test', () => {
  const stream = mochaPhantomJS({
    phantomjs: {
      useColors: true,
    },
  });
  stream.write({ path: 'http://localhost:9001/test/runner.html' });
  stream.end();
  return stream;
});

gulp.task('test', ['parent-test-server', 'child-test-server', 'do-test'], () => {
  parentServer.close();
  childServer.close();
});

gulp.task('watch', () => gulp.watch('./src/postmate.js', ['build']));
gulp.task('build', ['do-build', 'update-readme']);
gulp.task('build-watch', ['build', 'watch']);
