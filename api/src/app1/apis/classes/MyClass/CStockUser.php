<?php

namespace MyClass;

use DJApi;

class CStockUser
{
  static $module = '仙龙山一物一码';
  static $POWER_DEFINE = [
    ['name' => '基本权限', 'list' => ['查询', '任务', '签到', '添加二维码', '二维码列表', '打印二维码',]],
    ['name' => '快速功能', 'list' => ['生产状态', '油漆统计表', '油漆验收报表', '销售单', '销售',]],
    ['name' => '系统权限', 'list' => ['用户管理', '备份数据']],
    //['name' => '新建流程', 'list' => ['生产流程', '销售流程', '购买产品流程', '退货流程', '铺货流程']],
    ['name' => '报表权限', 'list' => ['清单', '统计']],
    //['name' => '字典权限', 'list' => ['产品套件字典', '用户字典', '客户字典', '产品字典', '木工字典'']],
  ];

  // 生成用户配置
  public static function get_power_define($verifyData)
  {
    $powerGroups =  self::$POWER_DEFINE;
    $qrcodeDefine = \FLOW\CQrcodeDefine::webConfig($verifyData);
    $flow_names = [];
    $powerGroups[] = ['name' => '新建流程', 'list' => &$flow_names];
    $powerGroups[] = ['name' => '流程列表', 'list' => &$flow_names];
    foreach ($qrcodeDefine['config'] as $defineItem) {
      if ($defineItem['mode'] == '流程') $flow_names[] = $defineItem['type'];
      $flow_powers = ['name' => $defineItem['type'], 'list' => []];
      foreach ($defineItem['actions'] as $actions) {
        if ($actions['definePower'] || ($defineItem['mode'] == '流程' && $actions['definePower'] !== false)) {
          $flow_powers['list'][] = $actions['name'];
        }
      }
      if (count($flow_powers['list']) > 0) $powerGroups[] = $flow_powers;
    }
    $dick_names = [];
    $powerGroups[] = ['name' => '字典权限', 'list' => &$dick_names];
    foreach ($qrcodeDefine['字典配置'] as $dickItem) {
      $dick_names[] = $dickItem['name'];
    }
    return $powerGroups;
  }


  /**
   * 判断用户权限
   */
  public static function get_power_attr($uid)
  {
    $db = CDbBase::db();
    $mobile = $db->get(CDbBase::table('stock_user_bind'), 'mobile', ['uid' => $uid]);
    if (!$mobile) return [];
    $attr = $db->get(CDbBase::table('stock_user'), 'attr', ['mobile' => $mobile]);
    $attr = json_decode($attr, true);
    return $attr;
  }


  /**
   * 判断用户权限
   */
  public static function get_my_power($verifyData)
  {
    $uid = $verifyData['uid'];
    $attr = self::get_power_attr($uid);
    if ($attr['superadmin']) {
      $def = self::get_power_define($verifyData);
      foreach ($def as $row) {
        $power[$row['name']] = $row['list'];
      }
      return $power;
    }
    return $attr['power'];
  }


  /**
   * 判断用户权限
   */
  public static function hasPower($uid, $powerGroup, $powerName)
  {
    $attr = self::get_power_attr($uid);
    return $attr['superadmin'] || in_array($powerName, $attr['power'][$powerGroup]);
  }
  public static function uidHasPower($uid, $powerGroup, $powerName)
  {
    $db = CDbBase::db();
    $mobile = $db->get(CDbBase::table('stock_user_bind'), 'mobile', ['uid' => $uid]);
    if (!$mobile) return [];
    $attr = $db->get(CDbBase::table('stock_user'), 'attr', ['mobile' => $mobile]);
    $attr = json_decode($attr, true);
    return $attr['superadmin'] || in_array($powerName, $attr['power'][$powerGroup]);
  }

  /**
   * 用户自行绑定手机号
   *
   * @param uid
   * @param query[mobile] 手机号
   * @param query[code] 验证码
   *
   * @return JSON
   */
  public static function bind_mobile($uid, $query)
  {
    $mobile = $query['mobile'];
    $code = $query['code'];
    // 验证码是否有效
    $params = [
      'module' => \MyClass\CStockUser::$module,
      'phone' => $mobile,
      'code' => $code,
    ];
    $verify = \DJApi\API::post(SERVER_API_ROOT, "user/sms/verify_code", $params);
    \DJApi\API::debug(['params' => $params, 'verify' => $verify]);
    if (!\DJApi\API::isOk($verify)) {
      return $verify;
    }

    // 绑定手机号
    $db = CDbBase::db();
    $and = ['uid' => $uid];
    $user_row = $db->get(CDbBase::table('stock_user_bind'), ['id', 'mobile'], ['AND' => $and]);
    \DJApi\API::debug([__FILE__ . ': line ' . __LINE__ . ', DB' => $db->getShow(), 'user_row' => $user_row]);
    if ($user_row['mobile'] == $mobile) {
      return \DJApi\API::OK("原已绑定");
    }
    // 清除其它用户绑定
    $db->update(CDbBase::table('stock_user_bind'), ['mobile' => ''], ['mobile' => $mobile]);
    if (!$user_row) {
      $db->insert(CDbBase::table('stock_user_bind'), ['mobile' => $mobile, 'uid' => $uid, 't1' => date('Y-m-d H:i:s')]);
    } else {
      $db->update(CDbBase::table('stock_user_bind'), ['mobile' => $mobile], ['AND' => $and]);
    }

    // 返回正确
    return \DJApi\API::OK();
  }


  /**
   * 获取仓储系统的用户数据
   * @param uid 登录的用户id
   * @return stock_user_row
   */
  public static function stock_userinfo($uid)
  {
    $db = CDbBase::db();
    $mobile = $db->get(CDbBase::table('stock_user_bind'), 'mobile', ['uid' => $uid]);
    \DJApi\API::debug([__FILE__ . ': line ' . __LINE__ . ', DB123' => $db->getShow(), 'mobile' => $mobile]);
    if (!$mobile) return [];
    $user_row = $db->get(CDbBase::table('stock_user'), ['stock_uid', 'mobile', 'attr'], ['mobile' => $mobile]);
    if (!$user_row) return ['mobile' => $mobile];
    $user_row['attr'] = json_decode($user_row['attr'], true);
    if (!$user_row['attr']) $user_row['attr'] = [];
    return $user_row;
  }


  /**
   * 获取仓储系统的用户数据
   * @param uid 登录的用户id
   * @return stock_user_row
   */
  public static function base_userinfo($uid)
  {
    $db = CDbBase::db();
    if (is_array($uid)) {
      $user_rows = $db->select(CDbBase::table('stock_user_bind'), ['uid', 'attr', 'mobile'], ['uid' => $uid]);
      foreach ($user_rows as &$user_row) {
        $user_row['attr'] = json_decode($user_row['attr'], true);
      }
      return $user_rows;
    }
    $user_row = $db->get(CDbBase::table('stock_user_bind'), ['attr', 'mobile'], ['uid' => $uid]);
    $user_row['attr'] = json_decode($user_row['attr'], true);
    return $user_row;
  }


  /**
   * 获取所有用户列表
   * 解析 attr
   */
  public static function list_user()
  {
    $db = CDbBase::db();
    $db_rows = $db->select(CDbBase::table('stock_user'), '*');
    foreach ($db_rows as $k => &$row) {
      $row['attr'] = json_decode($row['attr'], true);
    }
    return $db_rows;
  }

  /**
   * 获取所有员工列表
   * 解析 attr
   */
  public static function list_worker()
  {
    $db = CDbBase::db();
    $user_rows = $db->select(CDbBase::table('stock_user_bind'), ['uid', 'attr', 'mobile']);
    foreach ($user_rows as $k => &$row) {
      $row['attr'] = json_decode($row['attr'], true);
    }
    return $user_rows;
  }


  /**
   * 获取一个用户
   * 解析 attr
   */
  public static function get_user($stock_uid)
  {
    $db = CDbBase::db();
    $user = $db->get(CDbBase::table('stock_user'), '*', ['stock_uid' => $stock_uid]);
    $user['attr'] = json_decode($user['attr'], true);
    return $user;
  }


  /**
   * 添加一个用户
   */
  public static function create_user($value)
  {
    $db = CDbBase::db();
    $now = date('Y-m-d H:i:s');
    $insert_id = $db->insert(CDbBase::table('stock_user'), ['attr' => \DJApi\API::cn_json(['value' => $value]), 't1' => $now]);
    return $insert_id;
  }


  /**
   * 更新用户绑定的手机号
   */
  public static function update_mobile($stock_uid, $value)
  {
    $mobile = $value['mobile'];
    $展厅 = $value['展厅'];
    $db = CDbBase::db();
    $attr = $db->get(CDbBase::table('stock_user'),  'attr', ['stock_uid' => $stock_uid]);
    $attr = json_decode($attr, true);
    if (!is_array($attr)) $attr = [];
    $attr['展厅'] = $展厅;
    $n = $db->update(CDbBase::table('stock_user'), ['mobile' => $mobile, 'attr' => \DJApi\API::cn_json($attr)], ['stock_uid' => $stock_uid]);
    \DJApi\API::debug(['DB' => $db->getShow(), 'value' => $value]);
    return $n;
  }


  /**
   * 更新一个用户的权限
   */
  public static function update_power($stock_uid, $value)
  {
    $db = CDbBase::db();
    $attr = $db->get(CDbBase::table('stock_user'),  'attr', ['stock_uid' => $stock_uid]);
    $attr = json_decode($attr, true);
    if (!is_array($attr)) $attr = [];
    $attr['power'] = $value;
    $n = $db->update(CDbBase::table('stock_user'), ['attr' => \DJApi\API::cn_json($attr)], ['stock_uid' => $stock_uid]);
    return $n;
  }


  /**
   * 更新一个用户
   */
  public static function update_user($stock_uid, $value)
  {
    $db = CDbBase::db();
    $attr = $db->get(CDbBase::table('stock_user'),  'attr', ['stock_uid' => $stock_uid]);
    $attr = json_decode($attr, true);
    if (!is_array($attr)) $attr = [];
    $attr['value'] = $value;
    $n = $db->update(CDbBase::table('stock_user'), ['attr' => \DJApi\API::cn_json($attr)], ['stock_uid' => $stock_uid]);
    return $n;
  }


  /**
   * 启用一个用户
   */
  public static function enable_user($stock_uid)
  {
    $db = CDbBase::db();
    $user = $db->get(CDbBase::table('stock_user'),  ['t1', 't2'], ['stock_uid' => $stock_uid]);
    if (CDbBase::isAbleBy_t1t2($user)) return false;
    $now = date('Y-m-d H:i:s');
    $n = $db->update(CDbBase::table('stock_user'), ['t1' => $now, 't2' => ''], ['stock_uid' => $stock_uid]);
    return $n;
  }


  /**
   * 禁用一个用户
   */
  public static function disable_user($stock_uid)
  {
    $db = CDbBase::db();
    $user = $db->get(CDbBase::table('stock_user'),  ['t1', 't2'], ['stock_uid' => $stock_uid]);
    if (!CDbBase::isAbleBy_t1t2($user)) return false;
    $n = $db->update(CDbBase::table('stock_user'), ['t2' => '1999-01-01'], ['stock_uid' => $stock_uid]);
    return $n;
  }




  /**
   * 表达式计算 - 准备参数 stock_users
   */
  static $stock_users;
  static $workers;
  public static function read_all_users()
  {
    if (!is_array(\MyClass\CStockUser::$stock_users)) {
      $db = CDbBase::db();
      $db_stock_users = $db->select(CDbBase::table('stock_user'), '*');
      $db_workers = $db->select(CDbBase::table('stock_user_bind'), '*');

      $workers = [];
      foreach ($db_workers as $k => &$row) {
        $attr = json_decode($row['attr'], true);
        $mobile = $row['mobile'];
        $worker = [
          'uid' => $row['uid'],
          'mobile' => $mobile,
          't1' => $row['t1'],
          't2' => $row['t2'],
          'name' => $attr['name'],
          'group' => $attr['group'],
          'dinner' => $attr['dinner'],
          'price' => $attr['price'],
          'stay' => $attr['stay'],
          'salary' => $attr['salary'],
          '工资分类' => $attr['工资分类'],
        ];
        if ($mobile) $workers[$row['mobile']] = $worker;
        else $workers[count($workers)] = $worker;
      }

      $stock_users = [];
      foreach ($db_stock_users as $row) {
        $attr = json_decode($row['attr'], true);
        $stock_user = [
          'stock_uid' => $row['stock_uid'],
          'mobile' => $row['mobile'],
          't1' => $row['t1'],
          't2' => $row['t2'],
          'superadmin' => $attr['superadmin'],
          'power' => $attr['power'],
          'value' => $attr['value'],
          'uid' => $workers[$row['mobile']]['uid'],
        ];
        $stock_users[] = $stock_user;
      }
      // \DJApi\API::debug(['读取用户', "db_stock_users" => $db_stock_users, 'db_workers' => $db_workers, 'stock_users' => $stock_users, 'workers' => $workers]);
      self::$stock_users = $stock_users;
      self::$workers = array_values($workers);
    }
  }
  public static function get_stock_users()
  {
    if (!is_array(self::$stock_users)) self::read_all_users();
    return self::$stock_users;
  }
  public static function get_workers()
  {
    // \DJApi\API::debug(['原 workers' => self::$workers, 'stock_users' => self::$stock_users]);
    if (!is_array(self::$workers)) self::read_all_users();
    // \DJApi\API::debug(['原2 workers' => self::$workers, 'stock_users' => self::$stock_users]);
    return self::$workers;
  }

  /**
   * 表达式计算 - 获取 uids
   */
  public static function calcu_uids($express)
  {
    $stock_users = self::get_stock_users();
    $workers = self::get_workers();

    $param = [
      'stock_users' => $stock_users,
      'workers' => $workers,
      'now' => date("Y-m-d H:i:s"),
    ];

    // \DJApi\API::debug(['express' => $express,'stock_users' => $stock_users, 'workers' => $workers]);

    $compiled = \FLOW\CParser::parse($express);
    $uids = $compiled->parse($param);
    if (!is_array(($uids))) $uids = [];
    return $uids;
  }
}
