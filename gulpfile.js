//Initializing gulp.
var gulp = require('gulp');

//Loading plugins
var eslint = require('gulp-eslint');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var babel = require('gulp-babel');
var htmlhint = require("gulp-htmlhint");
var htmlmin = require('gulp-htmlmin');

//* Set Source Destination for Development Files.
var src = {
    cssPreprocessor: {folder: 'less/', updateOnChange: '*.less', mainFile: 'style.less'},
    css:  {folder: 'css/', updateOnChange: '*.css', mainFile: 'master.css'},
    html: {folder: 'html/', updateOnChange: '*.html', mainFile: 'index.html'},
    js: {folder: 'js/', updateOnChange: '*.js', mainFile: '/main.js'},
    fonts: {folder: 'fonts/', updateOnChange: '*', mainFile: ''},
    assets: {folder: 'assets/', updateOnChange: '*', mainFile: ''},
    prodBuild: {folder: 'dist/', updateOnChange: '', mainFile: ''}
};

var DEST = 'dist';

/*--------------------------------------------------------------------------
| Main Tasks
----------------------------------------------------------------------------*/

gulp.task('default', ['validate-html','less','eslint'], function(){
    browserSync.init({
       server:{
           baseDir: './'
       }
    });
    gulp.watch(src.cssPreprocessor.folder + src.cssPreprocessor.updateOnChange,['less']);
    gulp.watch(src.html.mainFile, ['validate-html']).on('change', reload);
    gulp.watch(src.html.folder + src.html.updateOnChange, ['validate-html']).on('change', reload);
    gulp.watch(src.js.folder + src.js.updateOnChange,['eslint']).on('change', reload);
});

gulp.task('build', ['compress-images', 'minify-css', 'babel','minify-index-html','minify-html-folder', 'copy-fonts'], function() {});

/*--------------------------------------------------------------------------
| Development Tasks
----------------------------------------------------------------------------*/

gulp.task('eslint', function(){
  return gulp.src(src.js.folder + src.js.updateOnChange)
  .pipe(plumber())
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('less', function(){
   return gulp.src(src.cssPreprocessor.folder + src.cssPreprocessor.mainFile)
   .pipe(plumber(function(error){
        console.log("Error happend!", error.message);
        this.emit('end');
    }))
   .pipe(less())
   .pipe(concat(src.css.mainFile))
   .pipe(gulp.dest(src.css.folder))
   .pipe(browserSync.stream());
});

gulp.task('validate-html', function(){
  return gulp.src([src.html.mainFile, src.html.folder + src.html.updateOnChange])
    .pipe(htmlhint())
    .pipe(htmlhint.reporter());
});

/*--------------------------------------------------------------------------
| Build Production/Release Tasks
----------------------------------------------------------------------------*/

gulp.task('compress-images', function(){
    return gulp.src(src.assets.folder + src.assets.updateOnChange)
    .pipe(imagemin({optimizationLevel: 7}))
    .pipe(gulp.dest(src.prodBuild.folder + src.assets.folder));
});

gulp.task('minify-css', function(){
    return gulp.src(src.css.folder + src.css.mainFile)
    .pipe(cleanCSS())
    .pipe(gulp.dest(src.prodBuild.folder + src.css.folder));
});

gulp.task('babel', function(){
    return gulp.src(src.js.folder + src.js.updateOnChange)
    .pipe(plumber())
    .pipe(concat(src.js.mainFile))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(src.prodBuild.folder + src.js.folder));
});

gulp.task('minify-index-html', function() {
  return gulp.src(src.html.mainFile)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(src.prodBuild.folder))
    ;
});

gulp.task('minify-html-folder', function() {
  return gulp.src(src.html.folder + src.html.updateOnChange)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(src.prodBuild.folder + src.html.folder))
    ;
});

gulp.task('copy-fonts', function() {
  return gulp.src(src.fonts.folder + src.fonts.updateOnChange)
    .pipe(gulp.dest(src.prodBuild.folder + src.fonts.folder));
});
