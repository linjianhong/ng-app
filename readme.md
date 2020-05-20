## 使用说明

----

### 依赖
1. angularJs 1.6.1
2. php 5.6
3. 本地 web 服务环境


### 下载
```git clone https://github.com/linjianhong/ng-app.git```


### 前端环境架设
1. 运行：构建.bat
1. 选择3，按回车
1. 若安装失败，运行 ``构建.bat`` 文件中相应命令


### 调试
1. 运行：构建.bat
1. 选择1，按回车，开始本地构建
1. 本地构建成功后，窗口自动关闭，并生成 ``www/src/index.html`` 等文件
1. 浏览器中预览效果


### 后端部署（PHP云服务器）


### 初次部署

#### Job-1: 前端构建
1. 运行：构建.bat
1. 选择2，按回车，开始构建发布内容
1. 本地构建成功后，窗口自动关闭，并生成 ``www/dist/app1`` 等文件夹

#### Job-2: API
1. 将 ``api`` 文件夹部署到 **web服务器** , 如: `https://api.domain.com/path1/` , 这是`apiRoot`参数!
1. 重命名 `https://api.domain.com/path1/configs/tpl.config.inc.app1.php` 为 `config.inc.app1.php`, 并配置此文件服务器参数



#### Job-3: 版本控制
1. 修改 ``html/vers-server/config.inc.php`` 文件 31 行为 ` "apiRoot" => "https://api.domain.com/path1/src/app1/",`
1. 修改 ``html/vers-server/config.inc.php`` 文件 37-40 行
1. 将 ``html/vers-server/`` 文件夹部署到 **web服务器**, 如: `https://ver.domain.com/ver/` ，此为版本控制入口


#### Job-4: 静态前端
1. 将文件夹 ``www/dist/app1/output`` 部署到 OSS, 如: `https://oss.domain.com/www/app1/output`
1. 若CSS中含字体文件，请自行部署，通常与 ``output``并行一个``fonts`` 文件夹,如: `https://oss.domain.com/www/app1/fonts`


#### Job-5: 前端入口
1. 将 ``html/*.html`` 部署到 **web服务器** , 如: `https://domain.com/html/`


#### Job-6: 测试
1. `https://domain.com/html/app1.html`
1. `https://domain.com/html/app1.preview.html`

### 版本更新
1. 前端, 构建.bat - 2
1. 后端, 更新API
1. 更新 `vers-server/config.inc.php` 中对应app的版本中 `files` 内容
1. 测试