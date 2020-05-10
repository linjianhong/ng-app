<?php

search_require('dj-api-shell/api-all.php', 6, '', true);
// 请在正式的 index.php 中调用
//search_require('config.inc.php');

/**
 * 仅使用 api-shell 进行调用
 */
function apiShellCall($namespace = 'RequestByApiShell') {
  $request = new DJApi\Request($_GET['api'], $_GET['call']);
  SaveBrowser($request);
  $result = $request->getJson($namespace);
  SaveLog($request, $result);
  DJApi\Response::response(DJApi\Request::debugJson($result));
}

/**
 * 保存请求及返回记录
 */
function SaveLog($request, $result) {
  /** 要忽略记录的请求 */
  $API_IGNORE = [
    'timer/minute',
    'signin/get_qrcode',
  ];
  if (in_array("$request->api/$request->call", $API_IGNORE)) {return;}

  $db = \MyClass\CDbBase::db('log_db');
  $query = [];
  foreach ($request->query as $k => $v) {
    if (!in_array($k, ['api', 'call', '__para1', '__para2', 'tokenid', 'timestamp', 'sign'])) {
      $query[$k] = $v;
    }
  }
  $id = $db->insert(\MyClass\CDbBase::table('tb_log_api'), [
    't' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'api' => $request->api,
    'call' => $request->call,
    'query' => \DJApi\API::cn_json($query),
    'result' => \DJApi\API::cn_json($result),
  ]);
  // \DJApi\API::debug(['保存请求及返回记录 id' => $id, 'db' => $db->getShow()]);
}

/**
 * 保存浏览器信息
 */
function SaveBrowser($request) {
  $db = \MyClass\CDbBase::db('log_db');
  if ($request->api != 'app' || $request->call != 'verify_token') {
    return;
  }
  $ip = $_SERVER['REMOTE_ADDR'];
  $tokenid = $request->query['tokenid'];
  $saved = $db->has(\MyClass\CDbBase::table('tb_log_browser'), ['AND' => ['ip' => $ip, 'tokenid' => $tokenid]]);
  if (!$saved) {
    $id = $db->insert(\MyClass\CDbBase::table('tb_log_browser'), [
      't' => date('Y-m-d H:i:s'),
      'ip' => $ip,
      'tokenid' => $tokenid,
      'browser' => $_SERVER['HTTP_USER_AGENT'],
    ]);
    \DJApi\API::debug(['保存浏览器信息 id' => $id, 'db' => $db->getShow()]);
  }
}

/**
 * 从当前文件夹的某个上级文件夹开始查找配置文件，并使用配置
 *
 * @param onlyonce:
 *     true : 找到一个最近的，即完成。
 *     false: 找到所有的匹配，从远处先使用，最近的将最优先。
 */
function search_require($fileName, $deep = 5, $path = '', $onlyonce = false) {
  if (!$path) {
    $path = dirname($_SERVER['PHP_SELF']);
  }
  $foundHere = file_exists("{$_SERVER['DOCUMENT_ROOT']}$path/$fileName");
  // 如果找到了，而且只要求一次，那么就仅使用这一个了
  if ($foundHere && $onlyonce) {
    require_once "{$_SERVER['DOCUMENT_ROOT']}$path/$fileName";
    return;
  }
  // 到上一级目录去找，有找到的先引用，然后再引用本级目录的(若有)，以保存越近的配置越优先
  if ($deep > 0 && strlen($path) > 1) {
    search_require($fileName, $deep - 1, dirname($path), $onlyonce);
  }
  if ($foundHere) {
    require_once "{$_SERVER['DOCUMENT_ROOT']}$path/$fileName";
  }
}