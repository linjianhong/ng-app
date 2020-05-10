@echo off
@echo.
@echo.
@echo.
@echo.         请选择要执行的操作
@echo.
@echo           [1] 本地构建      gulp build
@echo           [2] 构建发布内容  gulp clean
@echo           [3] 安装环境      npm install
@echo           [x] 退出
@echo.
@echo         输入: 1, 2 或 3 后按回车
@echo.
@echo         直接按回车，退出
@echo.
@echo off
set /p n=选择:

if %n%==1 goto build
if %n%==2 goto clean
if %n%==3 goto npm_install
goto end


:build
@echo.
@echo 选择了: build
@echo.
cd www
gulp build
goto end

:clean
@echo.
@echo 选择了: clean
@echo.
cd www
gulp clean
goto end

:npm_install
@echo.
@echo 选择了: 安装环境 (npm install)
@echo.
cd www
npm install gulp@3.9.1 -g
npm install gulp@3.9.1 --save-dev
npm install -g bower
npm install
bower install
@echo. 
@echo. 
@echo 安装失败时，手动安装上述批处理命令
goto end


:end