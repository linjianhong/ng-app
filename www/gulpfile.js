
var srcPath = 'src';

var configsArray = [
  {
    "name": "APP-1",
    "sub_app_name": "app1",
    "srcPath": srcPath,
    "distPath": "dist/app1",
    "tmpPath": "dist/app1/tmp",
    "jsonPath": "dist/app1/json",
    "outputPath": "dist/app1/output",
    "templatePaths": [srcPath + "/app1/**/*.template.html"],
    "baseHtmlName": "base.html",
    "debugHtmlName": "index.html",
    "distHtmlName": "index.dist.html",
    "templateJsName": "template-app.js",
    "injects": [
      [
        srcPath + "/my-lib/**/*.css",
        srcPath + "/share/**/*.css",
        srcPath + "/app1/main/**/*.css",
      ],
      [
        srcPath + "/app1/**/*.css",
        "!" + srcPath + "/app1/main/**/*.css",
      ],
      [
        srcPath + "/app1/**/*.config.js",
      ],
      [
        srcPath + "/my-lib/**/*.module.js",
        srcPath + "/share/**/*.module.js",
        srcPath + "/app1/**/*.module.js",
      ],
      [
        srcPath + "/my-lib/**/*.js",
        srcPath + "/share/**/*.js",
        srcPath + "/app1/**/*.js",
        "!" + srcPath + "/my-lib/**/*.module.js",
        "!" + srcPath + "/share/**/*.module.js",
        "!" + srcPath + "/app1/**/main.js",
        "!" + srcPath + "/app1/**/*.config.js",
        "!" + srcPath + "/app1/**/*.module.js",
      ],
      [
        srcPath + "/app1/**/main.js"
      ]
    ],
  },
  {
    "name": "APP-2",
    "sub_app_name": "app2",
    "srcPath": srcPath,
    "distPath": "dist/app2",
    "tmpPath": "dist/app2/tmp",
    "jsonPath": "dist/app2/json",
    "outputPath": "dist/app2/output",
    "templatePaths": [srcPath + "/app2/**/*.template.html"],
    "baseHtmlName": "base-app2.html",
    "debugHtmlName": "index-app2.html",
    "distHtmlName": "index-app2.dist.html",
    "templateJsName": "template-app2.js",
    "injects": [
      [
        srcPath + "/my-lib/**/*.css",
        srcPath + "/share/**/*.css",
        srcPath + "/app2/main/**/*.css",
      ],
      [
        srcPath + "/app2/**/*.css",
        "!" + srcPath + "/app2/main/**/*.css",
      ],
      [
        srcPath + "/app2/**/*.config.js",
      ],
      [
        srcPath + "/my-lib/**/*.module.js",
        srcPath + "/share/**/*.module.js",
        srcPath + "/app2/**/*.module.js",
      ],
      [
        srcPath + "/my-lib/**/*.js",
        srcPath + "/share/**/*.js",
        srcPath + "/app2/**/*.js",
        "!" + srcPath + "/my-lib/**/*.module.js",
        "!" + srcPath + "/share/**/*.module.js",
        "!" + srcPath + "/app2/**/main.js",
        "!" + srcPath + "/app2/**/*.config.js",
        "!" + srcPath + "/app2/**/*.module.js",
      ],
      [
        srcPath + "/app2/**/main.js"
      ]
    ],

  }
];



var gulp = require('gulp'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),

  /**
   * ES6 支持
   * 需安装：
     npm install --save-dev gulp-babel
     npm install --save-dev babel-preset-es2015
     npm install --save-dev babel-core
   *
   */
  babel = require("gulp-babel"),


  concat = require('gulp-concat'),
  filter = require('gulp-filter'),
  flatten = require('gulp-flatten'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  del = require('del'),

  uglify = require('gulp-uglify'),
  cleanCSS = require('gulp-clean-css'),
  htmlmin = require('gulp-htmlmin'),
  templateCache = require('gulp-angular-templatecache'),

  wiredep = require('wiredep').stream,

  inject = require('gulp-inject'),
  rev = require('gulp-rev'),
  revReplace = require('gulp-rev-replace'),
  streamSeries = require('stream-series'),
  filelist = require('gulp-filelist'),

  //order = require('gulp-order'),
  debug = require('gulp-debug');



var fs = require('fs');
var path = require('path');
var args = require('minimist')(process.argv.slice(2));



function nop() { }

function build(configs, on_end) {
  var streams = [];
  configs.injects.forEach(function (v, k) {
    streams[k] = gulp.src(v, { read: false });
  });
  /* 调试用主页 */
  gulp.src(configs.srcPath + '/' + configs.baseHtmlName)
    .pipe(inject(streamSeries(streams), { relative: true }))
    .pipe(rename(configs.debugHtmlName))
    .pipe(wiredep({
      optional: 'configuration',
      goes: 'here'
    }))
    .pipe(gulp.dest(configs.srcPath));

  /* 发布页面的临时文件，用于 bower 注入 */
  streams.splice(streams.length - 1, 0, gulp.src(configs.tmpPath + '/' + configs.templateJsName, { read: false }));
  return gulp.src(configs.srcPath + '/' + configs.baseHtmlName)
    .pipe(inject(streamSeries(streams), { relative: true }))
    .pipe(rename(configs.distHtmlName))
    .pipe(wiredep({
      optional: 'configuration',
      goes: 'here'
    }))
    .pipe(gulp.dest(configs.srcPath))
    .on("end", on_end || nop);
}



function html_useref(configs, on_end) {
  var old_files = [];
  try {
    fs.readdirSync(configs.outputPath)
      .filter(function (filename) {
        old_files.push(filename);
      });
    //console.log('已有旧的输出文件', configs.outputPath);
  }
  catch (err) {
    console.log('是第一次构建吧');
  };
  var old_files_not = old_files.filter(fn => fn != 'index.html').map(fn => '!**/' + fn);
  old_files_not.unshift('**');
  var withoutOldFilter = filter(old_files_not, { restore: true });


  var jsonFilter = filter(["**/*.js", "**/*.css"], { restore: true });

  return gulp.src(configs.srcPath + '/' + configs.distHtmlName)
    .pipe(useref())
    .pipe(gulpif('*.css', cleanCSS()))
    //.pipe(gulpif('*.html', htmlmin({collapseWhitespace: true,removeComments: true})))

    /* ES6支持 */
    .pipe(gulpif(/app.*\.js/, babel({ presets: ['es2015'] })))
    .on('error', function (err) {
      console.log('babel 转换错误：', err);
      this.end();
    })

    .pipe(gulpif('*.js', uglify({ compress: { drop_console: false } })))
    .pipe(rev())
    .pipe(revReplace())
    .pipe(gulpif('*.html', rename('index.html')))
    //.pipe(debug({ title: 'html: ' }))

    .pipe(withoutOldFilter)
    //.pipe(debug({ title: '新输出: ' }))
    .pipe(gulp.dest(configs.outputPath))

    .pipe(withoutOldFilter.restore)
    .pipe(flatten())
    //.pipe(debug({ title: '有效的输出文件: ' }))
    .pipe(filelist('new_files.json', { relative: true }))
    .pipe(gulp.dest(configs.jsonPath))

    .pipe(withoutOldFilter.restore)
    .pipe(jsonFilter)
    //.pipe(debug({ title: '用于 loader: ' }))
    .pipe(filelist('all.json', { relative: true }))
    .pipe(gulp.dest(configs.jsonPath))

    .on("end", on_end || nop);
}

function log_clean_result(configs) {
  readJson(configs.jsonPath + "/all.json", json => {
    var all_files = [];
    try {
      fs.readdirSync(configs.outputPath)
        .map(function (filename) {
          if (/.*\.(js|css)/.test(filename)) all_files.push(filename);
        });
    }
    catch (err) {
      console.log('怎么可能没有文件！');
    };
    var toDelete = all_files.filter(fn => !json.find(fnNew => fnNew == fn));
    if (toDelete.length) console.log(configs.name + ", 清除旧输出:", toDelete);
    else console.log(configs.name + ", 清除旧输出（未改变）:", toDelete);
    toDelete.map(fn => {
      del([configs.outputPath + '/' + fn], { force: true });
    });


    log_dist();
    /** 最终输出结果 */
    function log_dist() {
      readJson(configs.jsonPath + "/new_files.json", data => {
        var new_files = data || [];
        // 排序一下，好看些
        new_files = new_files.sort((a, b) => {
          if (a == 'index.html') return -1;
          if (b == 'index.html') return 1;
          return a > b ? -1 : 1;
        })

        var names = [];
        for (var name in configs.loaderList) {
          names.push(`${configs.sub_app_name}.${name}`);
        }
        console.log("\n " + configs.outputPath + '/');
        for (var i = 0; i < new_files.length; i++) {
          if (new_files.length - i > 1)
            console.log("   ├─  " + new_files[i]);
          else
            console.log("   └─  " + new_files[i]);
        }
        //console.log("   ├─  " + new_files.join("\n   ├─  "));
      });
    }
  });
}

function readJson(fn, callback) {
  var file1 = path.resolve(fn);
  fs.exists(file1, function (exists) {
    if (exists) {
      var json = require('./' + fn);
      callback(json);
    } else {
      callback(false);
    }
  });
}
function gulp_clean(configsArray) {
  function clean_sub_app(i) {
    var configs = configsArray[i];
    if (!configs) {
      console.log("clean 全部 done.\n\n");
      configsArray.map(configs => {
        log_clean_result(configs);
      })
      return;
    }
    console.log(configs.name + ",clean begin...");
    build(configs, () => {
      html_useref(configs, () => {
        //build_my_loader(configs, () => {
        console.log(configs.name + ",clean done.");
        clean_sub_app(i + 1)
        //});
      });
    });
  }
  clean_sub_app(0);
}


/**
 * 本地构建任务
 * 注入依赖到新的html，用于本地调试
 */
gulp.task("build", function () {
  function build_sub_app(i) {
    var configs = configsArray[i];
    if (!configs) {
      console.log("build, 全部 done.");
      return;
    }
    console.log(configs.name + ", build begin...");
    build(configs, () => {
      console.log(configs.name + ", build done.");
      build_sub_app(i + 1)
    });
  }
  build_sub_app(0);
});

/**
 * 压缩打包
 * 1. 注入依赖到新的html，用于本地调试
 * 2. 构建 loader.js 若干
 * 3. 压缩打包，生成到 output 文件夹
 * 4. 清除旧的打包文件
 */
gulp.task("clean", function () { gulp_clean(configsArray); });
gulp.task("clean-app1", function () { gulp_clean([configsArray[0]]); });
gulp.task("clean-app2", function () { gulp_clean([configsArray[1]]); });

/**
 * 默认任务
 */
gulp.task('default', ['build']);

