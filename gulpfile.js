/*copy src into cache*/
var gulp    = require('gulp');
var ts      = require('gulp-typescript');
var ngc     = require('gulp-ngc');
var webpack = require('webpack');
var merge2  = require('merge2');
var sass    = require('gulp-sass');
var tar    = require('gulp-tar');
var gzip    = require('gulp-gzip');

var tsProject = ts.createProject('tsconfig.json', {"include": ["build/**/*.ts"]});


gulp.task('setup', function() {
  return merge2(
    gulp.src('./src/**/*',{base:'src'}),
    gulp.src('./src/out/**/*',{base:'src'}).pipe(gulp.dest("./dist")),
    gulp.src('./package.json').pipe(gulp.dest("./dist")),
    gulp.src('./package-lock.json').pipe(gulp.dest("./dist"))
  )
  .pipe(gulp.dest('./build'));
});


gulp.task('copyFonts', function() {
  return gulp.src('./fonts/**/*',{cwd:'./node_modules/roboto-fontface/'}).pipe(gulp.dest("./dist/out/fonts"))
});

gulp.task('compile:sass', function() {
  return gulp.src('./src/**/*.scss',{base:'src'})
    .pipe(sass())
    .pipe(gulp.dest('./build'));
})


gulp.task('compile:angular',['setup','compile:sass'], function() {
    return ngc("tsconfig-aot.json");
});


gulp.task('compile:typescript', ['compile:angular'], function() {
    var tsResult = tsProject.src()
    .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('dist'));
});


gulp.task('compile:webpack', ['compile:angular'], function(callback) {
    webpack( require('./webpack.config.js'), (err, stats) => {
      if (err || stats.hasErrors()) {
        console.log(err);
        const info = stats.toJson();

        if (stats.hasErrors()) {
          info.errors.forEach(error => console.error(error));
        }

        if (stats.hasWarnings()) {
          info.warnings.forEach(warning => console.warn(warning));
        }
      }

      callback();
    });
});

gulp.task('compress',['compile','setup','copyFonts'],function(){
    return gulp.src('./dist/**/*')
        .pipe(tar('dist.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('./'))
})


gulp.task('compile',['compile:angular','compile:webpack',"compile:typescript"]);
gulp.task('build', ['setup', 'compile', 'copyFonts', 'compress']);
