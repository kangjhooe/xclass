# Script PowerShell untuk menjalankan Migration Academic Tracking
# Pastikan MySQL/XAMPP service sudah berjalan sebelum menjalankan script ini

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration: Academic Tracking" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Path ke MySQL
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$sqlFile = "database\sql\add_student_academic_tracking_simple.sql"

# Cek apakah MySQL ada
if (-not (Test-Path $mysqlPath)) {
    Write-Host "[ERROR] MySQL tidak ditemukan di: $mysqlPath" -ForegroundColor Red
    Write-Host "[INFO] Pastikan XAMPP sudah terinstall" -ForegroundColor Yellow
    exit 1
}

# Cek apakah file SQL ada
if (-not (Test-Path $sqlFile)) {
    Write-Host "[ERROR] File migration tidak ditemukan: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] File migration: $sqlFile" -ForegroundColor Green
Write-Host ""

# Cek apakah MySQL service berjalan
Write-Host "[INFO] Mengecek koneksi MySQL..." -ForegroundColor Yellow
$testResult = & $mysqlPath -u root -e "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Tidak bisa terhubung ke MySQL server!" -ForegroundColor Red
    Write-Host ""
    Write-Host "[INFO] LANGKAH UNTUK MENGATASI:" -ForegroundColor Yellow
    Write-Host "   1. Buka XAMPP Control Panel" -ForegroundColor White
    Write-Host "   2. Klik 'Start' pada MySQL service" -ForegroundColor White
    Write-Host "   3. Tunggu sampai status MySQL menjadi 'Running'" -ForegroundColor White
    Write-Host "   4. Jalankan script ini lagi" -ForegroundColor White
    Write-Host ""
    Write-Host "[INFO] ATAU jalankan migration secara manual:" -ForegroundColor Yellow
    Write-Host "   1. Buka phpMyAdmin: http://localhost/phpmyadmin" -ForegroundColor White
    Write-Host "   2. Pilih database 'xclass'" -ForegroundColor White
    Write-Host "   3. Klik tab 'SQL'" -ForegroundColor White
    Write-Host "   4. Copy-paste isi file: $sqlFile" -ForegroundColor White
    Write-Host "   5. Klik 'Go'" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "[SUCCESS] MySQL service berjalan!" -ForegroundColor Green
Write-Host ""

# Baca isi file SQL dan jalankan
Write-Host "[INFO] Membaca file SQL..." -ForegroundColor Yellow
$sqlContent = Get-Content $sqlFile -Raw -Encoding UTF8

Write-Host "[INFO] Menjalankan migration..." -ForegroundColor Yellow
Write-Host ""

# Jalankan SQL file langsung
$result = & $mysqlPath -u root xclass -e $sqlContent 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Migration berhasil dijalankan!" -ForegroundColor Green
} else {
    # Cek apakah error karena column/index sudah ada (itu normal)
    if ($result -match 'already exists' -or $result -match 'Duplicate') {
        Write-Host "[WARNING] Beberapa kolom/index sudah ada (ini normal jika migration sudah pernah dijalankan)" -ForegroundColor Yellow
        Write-Host "[INFO] Migration tetap berjalan..." -ForegroundColor Yellow
    } else {
        Write-Host "[ERROR] Ada error saat migration:" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
}

Write-Host ""

# Verifikasi
Write-Host "[INFO] Memverifikasi migration..." -ForegroundColor Yellow
Write-Host ""

$verifyQuery = "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'xclass' AND TABLE_NAME = 'students' AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year');"

$verifyResult = & $mysqlPath -u root xclass -e $verifyQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Kolom yang berhasil ditambahkan:" -ForegroundColor Green
    Write-Host $verifyResult
    Write-Host ""
    
    $lines = $verifyResult -split "`n" | Where-Object { $_ -match "academic_level|current_grade|academic_year" }
    $columnCount = $lines.Count
    
    if ($columnCount -ge 3) {
        Write-Host "[SUCCESS] Migration BERHASIL! Semua kolom sudah ditambahkan." -ForegroundColor Green
        Write-Host ""
        Write-Host "Kolom yang ditambahkan:" -ForegroundColor Cyan
        foreach ($line in $lines) {
            if ($line.Trim() -ne '') {
                Write-Host "  - $line" -ForegroundColor White
            }
        }
    } else {
        Write-Host "[WARNING] Beberapa kolom mungkin belum ditambahkan. Jumlah kolom ditemukan: $columnCount" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARNING] Tidak bisa memverifikasi (tapi migration mungkin sudah berhasil)" -ForegroundColor Yellow
    Write-Host "Coba jalankan query ini secara manual:" -ForegroundColor Yellow
    Write-Host $verifyQuery -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Migration selesai!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
