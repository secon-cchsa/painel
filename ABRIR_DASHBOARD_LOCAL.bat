@echo off
setlocal
cd /d "%~dp0"
title Abrir Dashboard Local
where py >nul 2>&1
if not errorlevel 1 goto usar_py
where python >nul 2>&1
if not errorlevel 1 goto usar_python
echo ERRO: Python 3 nao foi encontrado.
echo Instale em https://www.python.org/downloads/windows/ e marque Add Python to PATH.
echo.
pause
exit /b 1
:usar_py
py -3 abrir_dashboard_local.py
goto fim
:usar_python
python abrir_dashboard_local.py
:fim
echo.
echo O servidor foi encerrado.
pause
