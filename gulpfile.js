var postcss = require("gulp-postcss");
var gulp = require("gulp");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var sass = require("gulp-sass");
var clean = require("gulp-clean");
var webpackStream = require("webpack-stream");
var webpack2 = require("webpack");
var webpackConfig = require("./webpack.config.js");

gulp.task("pack", function () {
    return gulp.src("src/App.js")
        .pipe(webpackStream(webpackConfig, webpack2))
        .pipe(gulp.dest("./dist/js"));
});

gulp.task("sass", ["clean"], function () {
    var plugins = [
        autoprefixer({browsers: ["last 2 versions"]}),
        cssnano()
    ];
    return gulp.src("./scss/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss(plugins))
        .pipe(gulp.dest("./dist/css"));
});

gulp.task("copy", ["clean"], function () {
    var sourceFiles = ["./public/*"];
    return gulp.src(sourceFiles)
        .pipe(gulp.dest("./dist"));
});

gulp.task("clean", function () {
    return gulp.src("./dist", {read: false})
        .pipe(clean());
});

gulp.task("default", ["sass", "copy", "pack"]);


