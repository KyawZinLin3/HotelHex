@echo off
setlocal
cd /d "%~dp0"
echo Starting HotelHex containers...
docker compose up --build -d
if errorlevel 1 (
  echo Failed to start Docker services.
  exit /b 1
)
echo Web: http://localhost:3000
echo API: http://localhost:4000/api
echo Health: http://localhost:4000/api/health
docker compose ps
