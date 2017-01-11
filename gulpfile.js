const gulp = require('gulp');
const fsbx = require('fuse-box');
const browserSync = require('browser-sync').create();

const DIST = 'www';
const SRC = 'src';

const ionicConfigUtils = require('@ionic/app-scripts/dist/util/config');
const ionic2SassConfig = require('@ionic/app-scripts/config/sass.config');
const ionic2CopyConfig = require('@ionic/app-scripts/config/copy.config');

const replace = {
  '{{ROOT}}': process.cwd(),
  '{{WWW}}': DIST,
  '{{SRC}}': SRC,
  '{{BUILD}}': `${DIST}/build`
};

const replacePath = (any) => {
  let isReplaced = false;
  Object.keys(replace).forEach((key) => {
    if (any.indexOf(key) !== -1) {
      any = any.replace(key, replace[key]);
      isReplaced = true;
    }
  });
  return any;
}

const getSassConfig = () => {
  ionic2SassConfig.sourceMap = true;
  ionic2SassConfig.outputFilename = 'main.css';
  ionic2SassConfig.directoryMaps = { 'www': SRC };
  ionic2SassConfig.variableSassFiles = [`${SRC}/theme/variables.scss`];
  return ionic2SassConfig;
}

console.log(ionic2CopyConfig);

const fuseBox = fsbx.FuseBox.init({
    homeDir: 'src/',
    sourceMap: {
        bundleReference: 'app.js.map',
        outFile: `./${DIST}/build/app.js.map`,
    },
    outFile: `./${DIST}/build/app.js`,
    plugins: [
        [
          fsbx.SassPlugin(getSassConfig()),
          fsbx.CSSPlugin()
        ],
        //fsbx.TypeScriptHelpers,
        fsbx.JSONPlugin(),
        fsbx.HTMLPlugin({ useDefault: false })
    ]
});

gulp.task('fusebox', () => {
    return fuseBox.bundle('>main.ts');
});

gulp.task('copyIonic', () => {
  Object.keys(ionic2CopyConfig).forEach((key) => {
    const task = ionic2CopyConfig[key];

    if ('src' in task && task.src.length) {
      const destination = replacePath(task.dest);
      task.src.forEach((srcFile) => {
        const source = replacePath(srcFile);
        console.log(`${source} => ${destination}`);
        gulp.src(source).pipe(gulp.dest(destination));
      });
    }
  });
  return true;
});

gulp.task('index', () => {
    return gulp.src('src/**/*.html').pipe(gulp.dest(DIST));
});

gulp.task('fonts', () => {
  ionic2CopyConfig.copyFonts.src.forEach((srcFile) => {
    const source = replacePath(srcFile);
    console.log(`${source} => ${SRC}/assets/fonts`);
    gulp.src(source).pipe(gulp.dest(`${SRC}/assets/fonts`));
  });
});

gulp.task('assets', () => {
  return gulp.src('assets/**/*').pipe(gulp.dest(DIST));
});

gulp.task('watch', () => {
    gulp.watch('src/**/*.**', ['fusebox', 'index', 'assets']);
});

gulp.task('default', ['fonts', 'fusebox', 'index', 'assets', 'copyIonic'], () => {
    browserSync.init({
        server: { baseDir: DIST, directory: false },
        startPath: '/'
    });
    gulp.watch(`${DIST}/**/*`).on('change', browserSync.reload);
});
