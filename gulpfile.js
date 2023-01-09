import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import webp from 'gulp-webp';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';
import browser from 'browser-sync';

// Styles

export const styles = () => {
    return gulp.src('src/less/style.less', {srcmaps: true})
        .pipe(plumber())
        .pipe(less())
        .pipe(postcss([
            autoprefixer(),
            csso()
        ]))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('docs/css', {srcmaps: '.'}))
        .pipe(browser.stream());
}


// HTML
const html = () => {
    return gulp.src('src/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('docs'));
}

// Scripts
const scripts = () => {
    return gulp.src('src/js/script.js')
        .pipe(terser())
        .pipe(rename('script.min.js'))
        .pipe(gulp.dest('docs/js'))
        .pipe(browser.stream());
}

// Images
const optimizeImages = () => {
    return gulp.src('src/img//*.{png,jpg}')
        .pipe(squoosh())
        .pipe(gulp.dest('docs/img'))
}

const copyImages = () => {
    return gulp.src('src/img//*.{png,jpg}')
        .pipe(gulp.dest('docs/img'))
}

// WebP

const createWebp = () => {
    return gulp.src('src/img//*.{png,jpg}')
        .pipe(webp({quality: 90}))
        .pipe(gulp.dest('docs/img'))
}

// SVG
const svg = () =>
    gulp.src(['src/img/*.svg', '!src/img/icons/*.svg'])
        .pipe(svgo())
        .pipe(gulp.dest('docs/img'));

const sprite = () => {
    return gulp.src('src/img/icons/*.svg')
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest('docs/img'));
}

// Copy
const copy = (done) => {
    gulp.src([
        'src/fonts/*.{woff2,woff}',
        'src/*.ico',
    ], {
        base: 'src'
    })
        .pipe(gulp.dest('dosc'))
    done();
}


// Clean

const clean = () => {
    return del('docs');
};

// Server

const server = (done) => {
    browser.init({
        server: {
            baseDir: 'docs'
        },
        cors: true,
        notify: false,
        ui: false,
    });
    done();
}

// Reload

const reload = (done) => {
    browser.reload();
    done();
}

// Watcher

const watcher = () => {
    gulp.watch('src/less/**/*.less', gulp.series(styles));
    gulp.watch('src/js/script.js', gulp.series(scripts));
    gulp.watch('src/*.html', gulp.series(html, reload));
}

// Build
export const build = gulp.series(
    clean,
    copy,
    optimizeImages,
    gulp.parallel(
        styles,
        html,
        scripts,
        svg,
        sprite,
        createWebp
    ),
);

// Default


export default gulp.series(
    clean,
    copy,
    copyImages,
    gulp.parallel(
        styles,
        html,
        scripts,
        svg,
        sprite,
        createWebp
    ),
    gulp.series(
        server,
        watcher
    ));
