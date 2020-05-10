--
-- 系统数据库
--


-- 用户绑定
-- 识别依据：手机号
-- 基于微信获取uid
-- 允许游客登录
-- 绑定手机号，得到身份，否则当作游客
-- 浏览器登录：微信扫码
-- 微信：先获取uid，绑定手机号可改变用户
-- 用户管理：
--   1. 添加手机号，作为新用户
--   2. 作废手机号
--   3. 修改手机号
--   4. 修改用户权限
create table if not exists `app1_user_bind`
(
  `id`          int(11)  not null auto_increment COMMENT 'id',
  `mobile`      varchar(16) COMMENT '手机号，系统识别依据',
  `uid`         varchar(16) COMMENT '绑定的uid',
  `attr`        text  COMMENT  '其它数据',
  `t1`          varchar(32) DEFAULT '' COMMENT  '时间1, 生效时间',
  `t2`          varchar(32) DEFAULT '' COMMENT  '时间2, 失效时间',
  primary key (`id`),
  unique key `id` (`id`)
)default charset=utf8;




-- 保存 API 请求及返回记录
-- drop table if exists `tb_log_api`;
create table if not exists `tb_log_api`
(
  `id`          int(11)  not null auto_increment COMMENT 'id',
  `t`           varchar(32) COMMENT '请求时间',
  `ip`          varchar(32) COMMENT 'IP',
  `api`         varchar(32) COMMENT '',
  `call`        varchar(32) COMMENT '',
  `query`       text  COMMENT '请求数据',
  `result`      text  COMMENT '返回结果',
  primary key (`id`),
  unique key `id` (`id`)
)default charset=utf8;


-- 保存浏览器信息
-- drop table if exists `stock_api_log_browser`;
create table if not exists `stock_api_log_browser`
(
  `id`          int(11)  not null auto_increment COMMENT 'id',
  `t`           varchar(32) COMMENT '请求时间',
  `ip`          varchar(32) COMMENT 'IP',
  `tokenid`     varchar(32) COMMENT '',
  `browser`     varchar(256) COMMENT '',
  primary key (`id`),
  unique key `id` (`id`)
)default charset=utf8;


