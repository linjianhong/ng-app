@echo off
@echo.
@echo.
@echo.
@echo.         ��ѡ��Ҫִ�еĲ���
@echo.
@echo           [1] ���ع���      gulp build
@echo           [2] ������������  gulp clean
@echo           [3] ��װ����      npm install
@echo           [x] �˳�
@echo.
@echo         ����: 1, 2 �� 3 �󰴻س�
@echo.
@echo         ֱ�Ӱ��س����˳�
@echo.
@echo off
set /p n=ѡ��:

if %n%==1 goto build
if %n%==2 goto clean
if %n%==3 goto npm_install
goto end


:build
@echo.
@echo ѡ����: build
@echo.
cd www
gulp build
goto end

:clean
@echo.
@echo ѡ����: clean
@echo.
cd www
gulp clean
goto end

:npm_install
@echo.
@echo ѡ����: ��װ���� (npm install)
@echo.
cd www
npm install gulp@3.9.1 -g
npm install gulp@3.9.1 --save-dev
npm install -g bower
npm install
bower install
@echo. 
@echo. 
@echo ��װʧ��ʱ���ֶ���װ��������������
goto end


:end