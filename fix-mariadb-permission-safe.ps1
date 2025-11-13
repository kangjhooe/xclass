# Fix MariaDB Permission Error - Safe Method
# This script will fix MariaDB permission by temporarily bypassing authentication

Write-Host "🔧 Fixing MariaDB Permission Error..." -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
$mysqlProcess = Get-Process -Name mysqld -ErrorAction SilentlyContinue
if (-not $mysqlProcess) {
    Write-Host "❌ MySQL/MariaDB is not running!" -ForegroundColor Red
    Write-Host "💡 Please start MySQL from XAMPP Control Panel first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL service is running" -ForegroundColor Green
Write-Host ""

# Step 1: Stop MySQL service
Write-Host "1️⃣ Stopping MySQL service..." -ForegroundColor Cyan
$mysqlPath = "C:\xampp\mysql\bin\mysqld.exe"
$stopScript = "C:\xampp\mysql_stop.bat"

# Create stop script
@"
@echo off
taskkill /F /IM mysqld.exe
"@ | Out-File -FilePath $stopScript -Encoding ASCII

Start-Process -FilePath $stopScript -Wait -NoNewWindow
Start-Sleep -Seconds 2

Write-Host "✅ MySQL stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Start MySQL with --skip-grant-tables
Write-Host "2️⃣ Starting MySQL with skip-grant-tables..." -ForegroundColor Cyan
$dataDir = "C:\xampp\mysql\data"
$skipGrantScript = "C:\xampp\mysql_start_skip_grant.bat"

@"
@echo off
cd /d C:\xampp\mysql\bin
start /B mysqld.exe --skip-grant-tables --datadir="$dataDir"
"@ | Out-File -FilePath $skipGrantScript -Encoding ASCII

Start-Process -FilePath $skipGrantScript -NoNewWindow
Start-Sleep -Seconds 5

Write-Host "✅ MySQL started with skip-grant-tables" -ForegroundColor Green
Write-Host ""

# Step 3: Connect and fix permissions
Write-Host "3️⃣ Fixing permissions..." -ForegroundColor Cyan

$fixScript = @"
USE mysql;
UPDATE user SET host='%' WHERE user='root' AND host='localhost';
UPDATE user SET host='127.0.0.1' WHERE user='root' AND host='127.0.0.1';
FLUSH PRIVILEGES;

-- Create root@localhost if not exists
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;

-- Create root@127.0.0.1 if not exists
CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;

FLUSH PRIVILEGES;
EXIT;
"@

$fixScript | Out-File -FilePath "C:\xampp\fix_permission.sql" -Encoding ASCII

# Try to connect and execute
$mysqlExe = "C:\xampp\mysql\bin\mysql.exe"
$result = & $mysqlExe -u root < "C:\xampp\fix_permission.sql" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Permissions fixed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Some commands may have failed, but continuing..." -ForegroundColor Yellow
    Write-Host "Output: $result" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Stop MySQL again
Write-Host "4️⃣ Stopping MySQL..." -ForegroundColor Cyan
Start-Process -FilePath $stopScript -Wait -NoNewWindow
Start-Sleep -Seconds 2

# Step 5: Start MySQL normally via XAMPP
Write-Host "5️⃣ Please restart MySQL from XAMPP Control Panel" -ForegroundColor Yellow
Write-Host "   - Open XAMPP Control Panel" -ForegroundColor Gray
Write-Host "   - Click 'Start' on MySQL service" -ForegroundColor Gray
Write-Host ""

# Cleanup
Remove-Item -Path $stopScript -ErrorAction SilentlyContinue
Remove-Item -Path $skipGrantScript -ErrorAction SilentlyContinue
Remove-Item -Path "C:\xampp\fix_permission.sql" -ErrorAction SilentlyContinue

Write-Host "✅✅✅ Fix process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart MySQL from XAMPP Control Panel" -ForegroundColor White
Write-Host "   2. Test connection: node test-db-connection.js" -ForegroundColor White
Write-Host "   3. Try phpMyAdmin: http://localhost/phpmyadmin" -ForegroundColor White
Write-Host ""

