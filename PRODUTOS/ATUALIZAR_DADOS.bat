@echo off
setlocal
cd /d "%~dp0"
title Atualizar dados da Consulta de Produtos

echo ==================================================
echo   ATUALIZACAO DA BASE DE PRODUTOS
echo ==================================================
echo.
echo Pasta dos arquivos: %CD%
echo.

where py >nul 2>&1
if not errorlevel 1 goto usar_py
where python >nul 2>&1
if not errorlevel 1 goto usar_python

echo ERRO: Python nao foi encontrado neste computador.
echo Instale o Python 3 em https://www.python.org/downloads/windows/
echo Durante a instalacao, marque "Add Python to PATH".
goto falha

:usar_py
echo Verificando a biblioteca openpyxl...
py -3 -c "import openpyxl" >nul 2>&1
if errorlevel 1 (
  echo A biblioteca openpyxl nao esta instalada. Tentando instalar...
  py -3 -m pip install --user openpyxl
  if errorlevel 1 goto falha_dependencia
)
echo Convertendo Excel para JSON...
py -3 atualizar_dados_produtos.py
if errorlevel 1 goto falha
goto sucesso

:usar_python
echo Verificando a biblioteca openpyxl...
python -c "import openpyxl" >nul 2>&1
if errorlevel 1 (
  echo A biblioteca openpyxl nao esta instalada. Tentando instalar...
  python -m pip install --user openpyxl
  if errorlevel 1 goto falha_dependencia
)
echo Convertendo Excel para JSON...
python atualizar_dados_produtos.py
if errorlevel 1 goto falha
goto sucesso

:falha_dependencia
echo.
echo ERRO: nao foi possivel instalar openpyxl.
echo Verifique a conexao com a internet e a instalacao do Python/pip.
goto falha

:sucesso
echo.
echo SUCESSO: confira a data de modificacao de dados_produtos.json.
echo Para publicar, envie o JSON atualizado ao GitHub na pasta PRODUTOS.
echo.
pause
exit /b 0

:falha
echo.
echo A ATUALIZACAO NAO FOI CONCLUIDA. Leia a mensagem de erro acima.
echo Confira se base_produtos.xlsx esta nesta pasta e se o Excel foi fechado.
echo.
pause
exit /b 1
