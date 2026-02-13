@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

:menu
cls
echo ===========================================
echo       GESTOR DE DESPLIEGUE QUASAR
echo ===========================================
echo  1. [Todo] Clean + Build + Limpiar Assets + Subir
echo  2. [Build] Quasar Clean + Quasar Build
echo  3. [Limpiar] Solo borrar Assets en Servidor
echo  4. [Subir] Solo subir carpeta dist/spa
echo  5. [Limpiar Dist] Limpiar carpeta dist local
echo  6. Salir
echo ===========================================
set /p opcion="Seleccione una opcion (1-6): "

if "%opcion%"=="1" goto todo
if "%opcion%"=="2" goto build
if "%opcion%"=="3" goto limpiar_assets
if "%opcion%"=="4" goto subir
if "%opcion%"=="5" goto limpiar_dist
if "%opcion%"=="6" exit
goto menu

:todo
echo.
echo 🔹 Iniciando proceso completo...
call npx quasar clean || goto error
call npx quasar build || goto error
py pyLimpiarCarpetaAssets.py || goto error
py pySubirDistAlServidor.py || goto error
goto fin

:build
echo.
echo 🔹 Ejecutando Quasar Clean y Build...
call npx quasar clean || goto error
call npx quasar build || goto error
goto fin

:limpiar_assets
echo.
echo 🔹 Limpiando carpeta assets en el servidor...
py pyLimpiarCarpetaAssets.py || goto error
goto fin

:limpiar_dist
echo.
echo 🔹 Limpiando carpeta dist local...
call npx quasar clean || goto error
echo ✅ Tarea completada con exito.
goto fin

:subir
echo.
echo 🔹 Subiendo archivos de dist/spa al servidor...
py pySubirDistAlServidor.py || goto error
goto fin

:fin
echo.
echo ✅ Tarea completada con exito.
pause
goto menu



:error
echo.
echo ❌ Algo fallo durante el proceso.
pause
goto menu