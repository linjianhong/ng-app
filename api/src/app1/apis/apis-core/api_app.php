<?php

namespace RequestByApiShell;

const APP_WX = [
  "appid" => "wx1e9fc5f5d37bc375",
  "name" => "xls",
  "redirect_uri" => "https://xlsgdjj.com/bridge/wx-auth",
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
  "stock-local" => [
    "localStorage_KEY_UserToken" => "__stock_user_token__",
    "app_wx" => APP_WX,
    "app_wx3" => APP_WX3,
    "app_wx_xcx" => APP_WX_XCX,
    "codes" => [
      "ver" => "0.2.4",
      "VER_time" => "2020-03-01 16:00:00",
      "assetsPath" => "http://sites/xls/2019/www/dist/stock/output/",
      // 顺序： *.css, lib*.js, *.js
      "files" => [
        "lib-c97c3824a8.css",
        "lib-7d255fccbb.js",
        "app-67204ef41e.css",
        "app-ee8d6a51d2.js"
      ]
    ]
  ],
];


class class_app
{

  /**
   * 接口： app/site
   * 站点基本信息
   */
  public static function site($request)
  {
    $R = CODES['stock-local'];
    \DJApi\API::debug(['R' => $R, 'query' => $request->query]);
    $R['timestamp'] = time();
    return \DJApi\API::OK($R);
  }

  /**
   * 接口： app/xcx_code_to_token
   * 用微信小程序 code 绑定用户
   *
   * @request name: 公众号名称
   * @request code
   *
   * @return [无]
   */
  public static function xcx_code_to_token($request, $phoneLogin)
  {
    $code = $request->query['code'];
    $name = $request->query['name'];

    $json = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_xcx_code_to_token_uid", ['name' => $name, 'code' => $code]);
    \DJApi\API::debug(['wx_xcx_code_to_token_uid', 'SERVER_API_ROOT' => SERVER_API_ROOT, 'json' => $json]);
    return $json;
  }

  /**
   * 接口： app/wx_code_to_token_uid
   * 用code换取用户登录票据和uid
   *
   * @request name: 公众号名称
   * @request code
   *
   * @return uid
   * @return token
   * @return tokenid
   * @return timestamp
   */
  public static function wx_code_login($request)
  {
    $code = $request->query['code'];
    $name = $request->query['name'];

    $json = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_code_to_token_uid", ['name' => $name, 'code' => $code]);
    \DJApi\API::debug(['wx_code_to_token_uid', SERVER_API_ROOT, $json]);

    return $json;
  }

  /**
   * 接口： app/jsapi_sign
   * 前端请求jsapi签名
   *
   * @request name: 公众号名称
   * @request url
   *
   * @return config: 签名参数
   */
  public static function jsapi_sign($request)
  {
    $name = $request->query['name'];
    $url = $request->query['url'];

    $json = \DJApi\API::post(SERVER_API_ROOT, "user/wx/jsapi_sign", ['name' => $name, 'url' => $url]);
    \DJApi\API::debug(['jsapi_ticket', $json]);

    return $json;
  }

  /**
   * 接口： app/verify_token
   * 根据票据和签名，进行用户登录，获取uid
   * @request uid: 可选
   * @request tokenid
   * @request timestamp: 5分钟之内
   * @request sign: 签名 = md5($api.$call.$uid.$token.$timestamp) 或 md5($token.$timestamp)
   *
   * @return uid, 由于用户签名时，必须用到token, 所以，不再返回
   */
  public static function verify_token($request)
  {
    return \DJApi\API::post(SERVER_API_ROOT, "user/user/verify_token", $request->query);
  }


  /**
   * 接口： app/getWxInfo
   * 获取微信信息
   * @param uid: 用户id，可为数组或单个用户id
   * 返回：
   * @return 微信信息数组
   */
  public static function getWxInfo($request)
  {
    $uid = $request->query['uid'];
    \DJApi\API::debug(['参数 uid = ', $uid]);

    $wxInfoJson = \DJApi\API::post(SERVER_API_ROOT, "user/mix/wx_infos", ['uid' => $uid]);
    \DJApi\API::debug(['从独立服务器获取微信信息', $wxInfoJson]);
    if (!\DJApi\API::isOk($wxInfoJson)) {
      return $wxInfoJson;
    }
    $wxInfo = $wxInfoJson['datas']['list'];

    // 整理
    $list = [];
    foreach ($wxInfo as $k => $row) {
      $list[] = [
        'headimgurl' => $row['headimgurl'],
        'nickname' => $row['nickname'],
        'uid' => $row['uid'],
      ];
    }
    return \DJApi\API::OK(['list' => $list]);
  }
}
