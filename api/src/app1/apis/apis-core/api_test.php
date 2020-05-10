<?php

namespace RequestByApiShell;

use MyClass\CDbBase;

class class_test
{
  /**
   * 统一入口，要求登录, 要求登录
   */
  public static function API($call, $request)
  {
    if (!method_exists(__CLASS__, $call)) {
      return \DJApi\API::error(\DJApi\API::E_FUNCTION_NOT_EXITS, '参数无效', [$call]);
    }
    $verify = \MyClass\CUser::verify($request->query);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }
    return self::$call($request->query, $verify['datas']);
  }

  /**
   * 接口： test/a
   * @return {r}
   */
  public static function a($query,  $verifyData)
  {
    return \DJApi\API::OK(['r' => 'this is a']);
  }


  /**
   * 接口： test/b
   * @return {r}
   */
  public static function b($query,  $verifyData)
  {
    return \DJApi\API::OK(['r' => '请求了页面b', '参数' => $query]);
  }

  /**
   * 接口： test/c
   * @return {r}
   */
  public static function c($query,  $verifyData)
  {
    return \DJApi\API::error(123, "没有正确返回的代码", ['r' => '请求了页面c', '参数' => $query]);
  }
}
