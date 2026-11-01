@echo off
chcp 936 >nul
setlocal
title 拾级 CET-6 - 局域网共享
cd /d "%~dp0"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=5173"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [错误] 没有找到 Node.js。
  echo 请先安装 Node.js 18 或更高版本，然后重新双击本文件。
  echo 下载地址：https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "serve.js" (
  echo.
  echo [错误] 当前目录缺少 serve.js。
  echo 请确认本文件和 cet6-studio 文件夹在同一个目录。
  echo.
  pause
  exit /b 1
)

echo ==========================================
echo   拾级 CET-6 · 局域网共享
echo ==========================================
echo.
echo 正在启动，请稍候……
echo 启动成功后，把窗口里的“局域网地址”发给朋友。
echo 朋友需要和你在同一个 Wi-Fi 下。
echo 首次运行如弹出 Windows 防火墙提示，
echo 请勾选“专用网络”并点击“允许访问”。
echo.
echo 停止服务：按 Ctrl+C，或直接关闭本窗口。
echo 如果 5173 端口被占用，可关闭之前的服务器后重试，
echo 或在本文件上右键“以其他方式运行”并传入端口参数。
echo.

node serve.js %PORT% --lan
set "CODE=%errorlevel%"

echo.
if not "%CODE%"=="0" (
  echo [提示] 服务异常退出，错误码：%CODE%
  echo 如果提示端口被占用，请关闭之前启动的服务器窗口后再试。
) else (
  echo 服务已停止。
)
echo.
pause
endlocal
