@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@echo off

set MAVEN_PROJECTBASEDIR=%~dp0
set MVNW_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set MVNW_CMD="%JAVA_HOME%\bin\java.exe"
if not exist %MVNW_CMD% set MVNW_CMD=java

%MVNW_CMD% -jar %MVNW_JAR% %*
