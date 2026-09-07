@echo off
setlocal

set "BASE_DIR=%~dp0"
set "PROP_FILE=%BASE_DIR%.mvn\wrapper\maven-wrapper.properties"

if not exist "%PROP_FILE%" (
    echo ERROR: No existe %PROP_FILE%
    exit /b 1
)

for /f "tokens=1,* delims==" %%A in ('findstr /b "distributionUrl=" "%PROP_FILE%"') do (
    set "DIST_URL=%%B"
)

if not defined DIST_URL (
    echo ERROR: No se encontro distributionUrl en %PROP_FILE%
    exit /b 1
)

for %%A in (%DIST_URL:/= %) do set "DIST_FILE=%%A"

set "MAVEN_VERSION=%DIST_FILE:apache-maven-=%"
set "MAVEN_VERSION=%MAVEN_VERSION:-bin.zip=%"

if defined MAVEN_USER_HOME (
    set "WRAPPER_BASE=%MAVEN_USER_HOME%"
) else (
    set "WRAPPER_BASE=%USERPROFILE%\.m2"
)

set "WRAPPER_HOME=%WRAPPER_BASE%\wrapper\dists\apache-maven-%MAVEN_VERSION%"
set "MAVEN_HOME=%WRAPPER_HOME%\apache-maven-%MAVEN_VERSION%"
set "MVN=%MAVEN_HOME%\bin\mvn.cmd"
set "ZIP=%WRAPPER_HOME%\apache-maven-%MAVEN_VERSION%-bin.zip"

if exist "%MVN%" goto RUN_MAVEN

if not exist "%WRAPPER_HOME%" (
    mkdir "%WRAPPER_HOME%"
    if errorlevel 1 exit /b 1
)

echo Descargando Apache Maven %MAVEN_VERSION%...

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing '%DIST_URL%' -OutFile '%ZIP%'"

if errorlevel 1 (
    echo ERROR: No fue posible descargar Maven.
    exit /b 1
)

echo Descomprimiendo Apache Maven %MAVEN_VERSION%...

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop'; Expand-Archive -Force '%ZIP%' '%WRAPPER_HOME%'"

if errorlevel 1 (
    echo ERROR: No fue posible descomprimir Maven.
    exit /b 1
)

if exist "%ZIP%" del /q "%ZIP%"

if not exist "%MVN%" (
    echo ERROR: Maven no fue encontrado despues de la descompresion:
    echo %MVN%
    exit /b 1
)

:RUN_MAVEN
call "%MVN%" %*
set "EXIT_CODE=%ERRORLEVEL%"

endlocal & exit /b %EXIT_CODE%