const {
    task,
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');

const {
    htmlmin,
    sass,
    imagemin,
    autoprefixer,
    concat,
    uglify,
    plumber,
} = require('gulp-load-plugins')();

// Browser-Sync
const { init, reload } = require('browser-sync').create();

//Mis Helpers
const del = require('del');

//Minify HTML
const html = () =>
    src('./src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('./build'));

//Sass to CSS
const styles = () =>
    src('./src/sass/**/*.scss')
        .pipe(plumber())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(dest('./build/css/'));
        
//Minify Images
const images = () => 
src('./src/img/*')
    .pipe(plumber())
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('./build/img'));

//Combine and Minify Javascript Files
const scripts = () =>
    src('./src/js/*.js')
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(dest('./build/js'));

//Browser-Sync Server
const server = (done) => {
    init({
      server: {
        baseDir: './build',
      },
    });
    done();
  };
  
  const refresh = (done) => {
    reload();
    done();
  };

//Deletes and Rebuilds the Build File
const clean = () => del('./build');

const watcher = () => {
    watch('./src/*.html', series(html, refresh));
    watch('./src/sass/**/*.scss', series(styles, refresh));
    watch('./src/img/*', series(images, refresh));
    watch('./src/js/*.js', series(scripts, refresh));
}

task('build', series(clean, html, images, styles, scripts));

task('default', series('build', parallel(watcher,server)));