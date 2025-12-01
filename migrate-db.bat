@echo off
REM Script para migrar base de datos KPI en Windows

echo.
echo =========================================
echo   Migracion de Base de Datos KPI
echo =========================================
echo.

setlocal enabledelayedexpansion

REM Variables
set SERVER=%1
if "%SERVER%"=="" set SERVER=(local)
set DB=kpi_softprod
set SCHEMA_FILE=.\sql\schema.sql
set SEED_FILE=.\sql\seed.sql

REM Validar archivos
if not exist "%SCHEMA_FILE%" (
    echo [ERROR] No se encontro %SCHEMA_FILE%
    exit /b 1
)

if not exist "%SEED_FILE%" (
    echo [ERROR] No se encontro %SEED_FILE%
    exit /b 1
)

echo [INFO] Servidor: %SERVER%
echo [INFO] Base de datos: %DB%
echo.

REM Ejecutar schema
echo [1/2] Ejecutando schema.sql...
sqlcmd -S "%SERVER%" -i "%SCHEMA_FILE%"
if errorlevel 1 (
    echo [ERROR] Falló schema.sql
    exit /b 1
)
echo [OK] Schema actualizado
echo.

REM Ejecutar seed
echo [2/2] Ejecutando seed.sql...
sqlcmd -S "%SERVER%" -d "%DB%" -i "%SEED_FILE%"
if errorlevel 1 (
    echo [ERROR] Falló seed.sql
    exit /b 1
)
echo [OK] Datos insertados
echo.

echo =========================================
echo   Migracion completada exitosamente!
echo =========================================
echo.

pause
