
const babel = require('rollup-plugin-babel');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const minify = require('uglify-js').minify;
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const uglify = require('rollup-plugin-uglify');

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
    .pipe(gulp.dest('./build'))
);

gulp.task('lint', () =>
  gulp.src(['**/*.js', '!node_modules/**', '!build/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);
