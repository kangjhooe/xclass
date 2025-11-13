# Script untuk verifikasi migration
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verifikasi Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] Memeriksa kolom di tabel students..." -ForegroundColor Yellow
Write-Host ""

# Query untuk cek kolom
$query = @"
USE xclass;
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'xclass'
AND TABLE_NAME = 'students'
AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year');
"@

$queryFile = [System.IO.Path]::GetTempFileName() + ".sql"
$query | Out-File -FilePath $queryFile -Encoding UTF8

try {
    # Coba via cmd dengan cara berbeda
    $result = cmd /c "type `"$queryFile`" | `"$mysqlPath`" -u root" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -match 'academic_level') {
        Write-Host "[SUCCESS] Hasil verifikasi:" -ForegroundColor Green
        Write-Host $result
        Write-Host ""
        
        if ($result -match 'academic_level' -and $result -match 'current_grade' -and $result -match 'academic_year') {
            Write-Host "[SUCCESS] Migration BERHASIL! Semua kolom sudah ditambahkan." -ForegroundColor Green
            Write-Host ""
            Write-Host "Kolom yang ditemukan:" -ForegroundColor Cyan
            if ($result -match 'academic_level') { Write-Host "  - academic_level" -ForegroundColor White }
            if ($result -match 'current_grade') { Write-Host "  - current_grade" -ForegroundColor White }
            if ($result -match 'academic_year') { Write-Host "  - academic_year" -ForegroundColor White }
        } else {
            Write-Host "[WARNING] Beberapa kolom belum ditemukan." -ForegroundColor Yellow
            Write-Host "[INFO] Silakan jalankan migration via phpMyAdmin" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[ERROR] Tidak bisa terhubung ke MySQL" -ForegroundColor Red
        Write-Host "[INFO] Silakan verifikasi secara manual via phpMyAdmin:" -ForegroundColor Yellow
        Write-Host "  1. Buka http://localhost/phpmyadmin" -ForegroundColor White
        Write-Host "  2. Pilih database xclass" -ForegroundColor White
        Write-Host "  3. Jalankan query: DESCRIBE students;" -ForegroundColor White
    }
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[INFO] Silakan verifikasi secara manual via phpMyAdmin" -ForegroundColor Yellow
} finally {
    if (Test-Path $queryFile) {
        Remove-Item $queryFile -Force
    }
}

Write-Host ""

