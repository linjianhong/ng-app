<?php
date_default_timezone_set('PRC');

error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);
ini_set("display_errors", 1);
ini_set("error_log", "php_errors.log");

require_once 'apis/index.api-shell.php';

// 开启调试信息, 可以config中关闭
DJApi\API::enable_debug(true);
// 加载配置
search_require('configs/config.inc.app1.php');
//输出
apiShellCall('RequestByApiShell');
