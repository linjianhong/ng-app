<?php

namespace MyClass;

class CDbBase
{

  // 用到的表名
  static $table = [];

  static $db = [];
  public static function db($configName = 'main_db')
  {
    if (!self::$db[$configName]) {
      $db_config = \DJApi\Configs::get($configName);
      $dbParams = $db_config['medoo'];
      self::$db[$configName] = new \DJApi\DB($dbParams);
    }
    return self::$db[$configName];
  }
  public static function table($baseTableName = 'user', $configName = '')
  {
    $db_config = \DJApi\Configs::get($configName);
    $tableNames = $db_config['tableName'];
    if (!$tableNames) {
      $tableNames = self::$table;
    }

    $tableName = $tableNames[$baseTableName];
    if (!$tableName) {
      return $baseTableName;
    }

    return $tableName;
  }
  public static function isAbleBy_t1t2(&$row)
  {
    $now = date('Y-m-d H:i:s');
    return $row['t1'] && $row['t1'] < $now && (!$row['t2'] || $row['t2'] > $now);
  }
}
