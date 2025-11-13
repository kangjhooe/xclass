# Script untuk menjalankan migration
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$sqlFile = "database\sql\add_student_academic_tracking_simple.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration: Academic Tracking" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Baca file SQL
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "[INFO] Menjalankan migration..." -ForegroundColor Yellow
Write-Host ""

# Simpan ke file temporary
$tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlContent | Out-File -FilePath $tempFile -Encoding UTF8

try {
    # Jalankan via cmd untuk support redirect
    $cmd = "cmd /c `"$mysqlPath`" -u root xclass < `"$tempFile`""
    $result = Invoke-Expression $cmd 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Migration berhasil dijalankan!" -ForegroundColor Green
    } else {
        # Cek apakah error karena sudah ada (itu normal)
        if ($result -match 'already exists' -or $result -match 'Duplicate') {
            Write-Host "[WARNING] Beberapa kolom/index sudah ada (ini normal)" -ForegroundColor Yellow
            Write-Host "[INFO] Migration tetap berjalan..." -ForegroundColor Yellow
        } else {
            Write-Host "[ERROR] Ada error:" -ForegroundColor Red
            Write-Host $result
        }
    }
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Hapus file temporary
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}

Write-Host ""

# Verifikasi
Write-Host "[INFO] Memverifikasi migration..." -ForegroundColor Yellow
Write-Host ""

$verifyQuery = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'xclass' AND TABLE_NAME = 'students' AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year');"

$verifyFile = [System.IO.Path]::GetTempFileName() + ".sql"
"USE xclass;`n$verifyQuery" | Out-File -FilePath $verifyFile -Encoding UTF8

try {
    $verifyResult = cmd /c "`"$mysqlPath`" -u root < `"$verifyFile`""
    
    Write-Host "[SUCCESS] Kolom yang berhasil ditambahkan:" -ForegroundColor Green
    Write-Host $verifyResult
    Write-Host ""
    
    if ($verifyResult -match 'academic_level' -and $verifyResult -match 'current_grade' -and $verifyResult -match 'academic_year') {
        Write-Host "[SUCCESS] Migration BERHASIL! Semua kolom sudah ditambahkan." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Beberapa kolom mungkin belum ditambahkan." -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Tidak bisa memverifikasi" -ForegroundColor Yellow
} finally {
    if (Test-Path $verifyFile) {
        Remove-Item $verifyFile -Force
    }
}

Write-Host ""
Write-Host "[SUCCESS] Selesai!" -ForegroundColor Green
Write-Host ""

