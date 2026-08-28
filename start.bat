@echo off
title Smart Tutor
cd /d "%~dp0app"
echo ============================================
echo    المدرّس الذكي - Smart Tutor
echo ============================================
echo.
if not exist node_modules (
  echo جاري تثبيت المكتبات (قد يستغرق دقيقة)...
  call npm install
)
echo جاري تشغيل الخادم...
echo افتح المتصفح على: http://localhost:3000
echo.
node server.js
pause