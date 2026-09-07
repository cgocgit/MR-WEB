\
@echo off
setlocal enabledelayedexpansion
set BASE_DIR=%~dp0
for /f "tokens=1,* delims==" %%A in ('findstr /b "distributionUrl=" "%BASE_DIR%.mvn\wrapper\maven-wrapper.properties"') do set DIST_URL=%%B
for %%A in (%DIST_URL:/= %) do set LAST=%%A
set MAVEN_VERSION=%LAST:apache-maven-=%
set MAVEN_VERSION=%MAVEN_VERSION:-bin.zip=%
if defined MAVEN_USER_HOME (set WRAPPER_BASE=%MAVEN_USER_HOME%) else (set WRAPPER_BASE=%USERPROFILE%\.m2)
set WRAPPER_HOME=%WRAPPER_BASE%\wrapper\dists\apache-maven-%MAVEN_VERSION%
set MVN=%WRAPPER_HOME%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd
if not exist "%MVN%" (
  if not exist "%WRAPPER_HOME%" mkdir "%WRAPPER_HOME%"
  set ZIP=%WRAPPER_HOME%\apache-maven-%MAVEN_VERSION%-bin.zip
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing '%DIST_URL%' -OutFile '%ZIP%'"
  if errorlevel 1 exit /b 1
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Force '%ZIP%' '%WRAPPER_HOME%'"
  if errorlevel 1 exit /b 1
  del /q "%ZIP%"
)
call "%MVN%" %*
endlocal
