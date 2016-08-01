
var babel   = require('rollup-plugin-babel');
var gulp    = require('gulp');
var minify  = require('uglify-js').minify;
var rollup  = require('rollup-stream');
var source  = require('vinyl-source-stream');
var uglify  = require('rollup-plugin-uglify');

gulp.task('build', () => rollup({
    entry: './lib/postmate.js',
    format: 'umd',
    moduleName: 'Postmate',
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
      uglify({}, minify)
    ]
  })
  .pipe(source('postmate.min.js'))
  .pipe(gulp.dest('./dist'))
);
