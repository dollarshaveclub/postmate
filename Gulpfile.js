
const babel = require('rollup-plugin-babel');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const header = require('gulp-header');
const minify = require('uglify-js').minify;
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const uglify = require('rollup-plugin-uglify');

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

gulp.task('watch', () => gulp.watch('./lib/postmate.js', ['build']));
gulp.task('build-watch', ['build', 'watch']);
