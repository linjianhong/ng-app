<?php
DJApi\Configs::set("API-ANME", '仓储系统开发版 0.0.1');

$http = $_SERVER['REQUEST_SCHEME'] == 'https'  ? 'https' : 'http';
define('PHP_SELF_PATH', "{$http}://{$_SERVER['HTTP_HOST']}" . dirname(dirname($_SERVER['PHP_SELF'])));

define('SERVER_API_ROOT', 'https://api.jdyhy.com/server/unit-1.0.0/');

DJApi\Configs::set("https", $http);

DJApi\Configs::set("main_db", [
  "medoo" => [
    "port"          => 3306,
    "database_name" => 'app1',
    "server"        => 'localhost',
    "username"      => 'root',
    "password"      => '---------',
    "database_type" => 'mysql',
    "charset"       => 'utf8'
  ],
  "tableName" => []
]);

DJApi\Configs::set("log_db", [
  "medoo" => [
    "port" => 3306,
    "database_name" => 'app1',
    "server"        => 'localhost',
    "username"      => 'root',
    "password"      => '---------',
    "database_type" => 'mysql',
    "charset" => 'utf8',
  ],
  "tableName" => [
    'tb_log_api' => 'stock_api_log',
  ],
]);


DJApi\Configs::set("WX_APPID_APPSEC", [
  '蒲公英'   => ["WX_APPID" => "wx3a807a2f301479ae", "WX_APPSEC" => '---------'],
  '测试'     => ["WX_APPID" => "wx85146f512f936bbb", "WX_APPSEC" => '---------'],
  '请高手'   => ["WX_APPID" => "wx93301b9f5ddf5c8f", "WX_APPSEC" => '---------'],
  'cmoss'    => ["WX_APPID" => "wx93301b9f5ddf5c8f", "WX_APPSEC" => '---------'],
  'qgs-web'  => ["WX_APPID" => "wx8fb342a27567fee7", "WX_APPSEC" => '---------'],
  'qgs-mp'   => ["WX_APPID" => "wx93301b9f5ddf5c8f", "WX_APPSEC" => '---------'],
  'laolin-mp' => ["WX_APPID" => "wx3dd28920a07c53de", "WX_APPSEC" => '---------'],
]);

DJApi\Configs::set("WX_APPID_APPSEC_DEFAULT", DJApi\Configs::get(["WX_APPID_APPSEC", '蒲公英']));


/** 阿里云短信配置 */
define("SMS_accessKeyId", "LTAIE1ipsDmGVxCL");
define("SMS_accessKeySecret", "---------");
define("SMS_accessKeySecret_2", "---------");


DJApi\Configs::set("OSS_access", [
  "msa" => [
    "accessKeyId"     => SMS_accessKeyId,
    "accessKeySecret" => SMS_accessKeySecret,
    "endpoint"        => "http://oss-cn-beijing.aliyuncs.com",
    "baseurl"         => "https://pgytc.oss-cn-beijing.aliyuncs.com",
    "bucket"          => "pgytc",
    "path"            => "msa/uploads",
  ],
  "pgytc" => [
    "accessKeyId"     => SMS_accessKeyId,
    "accessKeySecret" => SMS_accessKeySecret,
    "endpoint"        => "http://oss-cn-beijing.aliyuncs.com",
    "baseurl"         => "https://pgytc.oss-cn-beijing.aliyuncs.com",
    "bucket"          => "pgytc",
    "path"            => "local-debug",
  ],
  "xlsgdjj" => [
    "accessKeyId"     => "LTAIwSKmt5Bnr8NM",
    "accessKeySecret" => SMS_accessKeySecret_2,
    "endpoint"        => "http://oss-cn-beijing.aliyuncs.com",
    "baseurl"         => "https://xlsgdjj.oss-cn-beijing.aliyuncs.com",
    "bucket"          => "xlsgdjj",
    "path"            => "images/stock",
  ],
  "xlsgdjj-test" => [
    "accessKeyId"     => "LTAIwSKmt5Bnr8NM",
    "accessKeySecret" => SMS_accessKeySecret_2,
    "endpoint"        => "http://oss-cn-beijing.aliyuncs.com",
    "baseurl"         => "https://xlsgdjj.oss-cn-beijing.aliyuncs.com",
    "bucket"          => "xlsgdjj",
    "path"            => "images/stock-test",
  ]
]);
DJApi\Configs::set("OSS_access_default", DJApi\Configs::get(["OSS_access", "pgytc"]));



DJApi\Configs::set(["微信模板消息", 'app1-销售提醒'], [
  'template_id' => 'PsozrxHxgRL0nrxNv9jemVzEVhnxlwdFEzRhvu-5aX4',
  "first" => "#223388",
  'body'   => [
    ['keyword1', '#FF8800', '客户'],
    ['keyword2', '#FF8800', '销售总额'],
    ['keyword3', '#FF8800', '预计发货时间'],
  ],
  "remark" => "#223388"
]);

DJApi\Configs::set(["微信模板消息", 'app1-新销售订单提醒'], [
  'template_id' => 'YHOmSW-kmOuYwqSBszXwtJHwe1PNIz0fqTfkihUbPWg',
  "first" => "#223388",
  'body'   => [
    ['keyword1', '#FF8800', '商品信息'],
    ['keyword2', '#FF8800', '商品类型'],
    ['keyword3', '#FF8800', '商品数量'],
    ['keyword4', '#FF8800', '商品金额'],
    ['keyword5', '#FF8800', '购买时间'],
  ],
  "remark" => "#223388"
]);



DJApi\API::enable_debug(true);
// DJApi\API::debug([
//   DJApi\Configs::get(["API-ANME"]),
//   DJApi\Configs::get(["main_db", "medoo", "database_name"]),
//   DJApi\Configs::get(["main_db", "medoo", "server"]),
//   'allow_url_fopen' => ini_get('allow_url_fopen'),
// ]);
