<?php
header("Access-Control-Allow-Origin:*");

require_once "config.inc.php";

echo json_encode([
  'errcode' => 0,
  'datas' => site($_REQUEST)
], JSON_UNESCAPED_UNICODE);
