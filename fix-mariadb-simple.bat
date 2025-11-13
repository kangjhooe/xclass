@echo off
echo ========================================
echo Fix MariaDB Permission - Simple Method
echo ========================================
echo.

echo Step 1: Stopping MySQL...
taskkill /F /IM mysqld.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Starting MySQL with skip-grant-tables...
cd /d C:\xampp\mysql\bin
start /B mysqld.exe --skip-grant-tables --datadir="C:\xampp\mysql\data"
timeout /t 5 /nobreak >nul

echo.
echo Step 3: Fixing permissions...
(
echo USE mysql;
echo UPDATE user SET host='%%' WHERE user='root' AND host='localhost';
echo CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '';
echo GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
echo CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY '';
echo GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;
echo FLUSH PRIVILEGES;
echo EXIT;
) | mysql.exe -u root

echo.
echo Step 4: Stopping MySQL...
taskkill /F /IM mysqld.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Fix completed!
echo ========================================
echo.
echo Please restart MySQL from XAMPP Control Panel
echo Then test with: node test-db-connection.js
echo.
pause

