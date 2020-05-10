<?php

const APP_WX = [
  "appid" => "wx1e9fc5f5d37bc375",
  "name" => "xls",
  "redirect_uri" => "https://xlsgdjj.com/bridge/wx-auth",
];
const APP_WX_PGY = [
  "appid" => "wx3a807a2f301479ae",
  "name" => "pgy-wx",
  "redirect_uri" => "https://jdyhy.com/bridge/wx-auth",
];
const APP_WX3 = [
  "appid" => "wxffc089a88065e759",
  "name" => "pgy-web",
  "redirect_uri" => "https://jdyhy.com/bridge/wx-auth",
];
const APP_WX_XCX = [
  "appid" => "",
  "name" => "msa-xcx",
  "redirect_uri" => "",
];

const CODES = [
  "app1-test" => [
    "hidePrice" => 1,
    "localStorage_KEY_UserToken" => "stock_master_usertoken",
    "app_wx" => APP_WX,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "apiRoot" => "https://api.jdyhy.com/ng-php/0.1/src/app1/",
    "codes" => [
      "ver" => "0.1",
      "VER_time" => "2020-03-01 16:00:00",
      "assetsPath" => "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/ng-php/assert/output/",
      "files" => [
        "lib-c97c3824a8.css",
        "lib-50cf2031cd.js",
        "app-a84ddf3e82.css",
        "app-f8f0022f0e.js"
      ]
    ]
  ],

  "app1-master" => [
    "hidePrice" => 1,
    "localStorage_KEY_UserToken" => "stock_master_usertoken",
    "app_wx" => APP_WX,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "apiRoot" => "https://api.jdyhy.com/ng-php/0.1/src/app1/",
    "codes" => [
      "ver" => "0.1",
      "VER_time" => "2020-03-01 16:00:00",
      "assetsPath" => "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/ng-php/assert/output/",
      "files" => [
        "lib-c97c3824a8.css",
        "lib-50cf2031cd.js",
        "app-a84ddf3e82.css",
        "app-f8f0022f0e.js"
      ]
    ]
  ],

  "app1-xcx" => [
    "hidePrice" => 1,
    "localStorage_KEY_UserToken" => "stock_master_usertoken",
    "app_wx" => APP_WX,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "apiRoot" => "https://api.jdyhy.com/ng-php/0.1/src/app1/",
    "codes" => [
      "ver" => "0.1",
      "VER_time" => "2020-03-01 16:00:00",
      "assetsPath" => "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/ng-php/assert/output/",
      "files" => [
        "lib-c97c3824a8.css",
        "lib-50cf2031cd.js",
        "app-a84ddf3e82.css",
        "app-f8f0022f0e.js"
      ]
    ]
  ],

  "app1-preview" => [
    "hidePrice" => 1,
    "localStorage_KEY_UserToken" => "stock_master_usertoken",
    "app_wx" => APP_WX,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "apiRoot" => "https://api.jdyhy.com/ng-php/preview/src/app1/",
    "codes" => [
      "ver" => "0.1",
      "VER_time" => "2020-03-01 16:00:00",
      "assetsPath" => "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/ng-php/assert/output/",
      "files" => [
        "lib-c97c3824a8.css",
        "lib-50cf2031cd.js",
        "app-a84ddf3e82.css",
        "app-f8f0022f0e.js"
      ]
    ]
  ],



  "app2-master" => [
    "hidePrice" => 1,
    "localStorage_KEY_UserToken" => "stock_master_usertoken",
    "app_wx" => APP_WX,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "apiRoot" => "https://api.jdyhy.com/ng-php/0.1/src/app1/",
    "codes" => [
      "ver" => "0.1",
      "VER_time" => "2020-03-01 16:00:00",
      "assetsPath" => "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/ng-php/assert/output/",
      "files" => [
        "lib-c97c3824a8.css",
        "lib-50cf2031cd.js",
        "app-5d2a1d64fb.css",
        "app-9ff2892549.js"
      ]
    ]
  ],

];

function site($query)
{
  $R = CODES[$query['app']];
  $R['timestamp'] = time();
  return $R;
}
