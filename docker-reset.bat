@echo off
setlocal
cd /d "%~dp0"
echo This removes the local PostgreSQL volume and all local database data.
choice /M "Continue"
if errorlevel 2 exit /b 0
docker compose down -v
docker compose up --build -d
