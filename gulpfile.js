
var merge = require('merge-stream');
var runSequence = require('run-sequence');
var DIST = 'dist';

var path = require('path');

var del = require('del');

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var dist = function(subpath) {
    return !subpath ? DIST : path.join(DIST, subpath);
};

gulp.task('clean', function() {
    return del(['.tmp', dist()]);
});

gulp.task('copy', function() {
    var app = gulp.src([
        'app/**/*',
        '!app/test',
        '!app/elements',
        '!app/bower_components',
        '!app/cache-config.json',
        '!**/.DS_Store'
    ], {
        dot: true
    }).pipe(gulp.dest(dist()));

    // Copy over only the bower_components we need
    // These are things which cannot be vulcanized
    var bower = gulp.src([
        'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill,polymer}/**/*'
    ]).pipe(gulp.dest(dist('bower_components')));

    return merge(app, bower)
        .pipe($.size({
            title: 'copy'
        }));
});

var browserSync = require('browser-sync').create();

// Static server
gulp.task('serve', function() {
    var historyApiFallback = require('connect-history-api-fallback')
    browserSync.init({
        server: {
            baseDir: "./app",
            middleware: [ historyApiFallback() ]
        }
    });
});

gulp.task('vulcanize', function() {
    return gulp.src('app/elements/elements.html')
        .pipe($.vulcanize({
            stripComments: true,
            inlineCss: true,
            inlineScripts: true,
            stripExcludes: [
                'roboto.html', // Web fonts are loaded in the main page.
                'polymer.html'
                //'shared-app-styles.html'
            ],
        }))
        //.pipe(crisper( { onlySplit: true })) //crisper doenst work properly with service worker async, elements gets loaded first before polymer
        .pipe(gulp.dest(dist('elements')))
        .pipe($.size({title: 'vulcanize'}));
});


gulp.task('default', function(cb) {
    runSequence('clean','copy','vulcanize',cb);
});



