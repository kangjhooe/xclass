# Script untuk menjalankan migration langsung
# Pastikan MySQL service sudah berjalan

$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$sqlFile = "database\sql\add_student_academic_tracking_simple.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration: Academic Tracking" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Baca file SQL
Write-Host "[INFO] Membaca file SQL..." -ForegroundColor Yellow
$sqlContent = Get-Content $sqlFile -Raw -Encoding UTF8

# Split by semicolon untuk mendapatkan statements
$statements = $sqlContent -split ';' | Where-Object { 
    $_.Trim() -ne '' -and 
    $_.Trim() -notmatch '^\s*--' -and 
    $_.Trim() -notmatch '^/\*' -and
    $_.Trim().Length -gt 5
}

Write-Host "[INFO] Menemukan $($statements.Count) statement SQL" -ForegroundColor Yellow
Write-Host "[INFO] Menjalankan migration..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$skipCount = 0
$errorCount = 0

foreach ($statement in $statements) {
    $cleanStatement = $statement.Trim()
    
    # Skip jika hanya comment atau kosong
    if ($cleanStatement -match '^\s*--' -or $cleanStatement -match '^/\*' -or $cleanStatement.Length -lt 5) {
        continue
    }
    
    # Tambahkan semicolon jika belum ada
    if (-not $cleanStatement.EndsWith(';')) {
        $cleanStatement += ';'
    }
    
    # Escape single quotes untuk PowerShell
    $cleanStatement = $cleanStatement -replace "'", "''"
    
    # Jalankan statement
    $query = "USE xclass; $cleanStatement"
    
    try {
        $result = & $mysqlPath -u root -e $query 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Host "[SUCCESS] Statement berhasil" -ForegroundColor Green
        } elseif ($result -match 'already exists' -or $result -match 'Duplicate') {
            $skipCount++
            Write-Host "[SKIP] Sudah ada: $($result.ToString().Substring(0, [Math]::Min(50, $result.Length)))" -ForegroundColor Yellow
        } else {
            $errorCount++
            $errorMsg = $result.ToString()
            if ($errorMsg.Length -gt 100) {
                $errorMsg = $errorMsg.Substring(0, 100) + "..."
            }
            Write-Host "[ERROR] $errorMsg" -ForegroundColor Red
        }
    } catch {
        $errorCount++
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hasil Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Berhasil: $successCount" -ForegroundColor Green
Write-Host "[SKIP] Dilewati: $skipCount" -ForegroundColor Yellow
Write-Host "[ERROR] Error: $errorCount" -ForegroundColor Red
Write-Host ""

# Verifikasi
Write-Host "[INFO] Memverifikasi migration..." -ForegroundColor Yellow
Write-Host ""

$verifyQuery = "USE xclass; SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'xclass' AND TABLE_NAME = 'students' AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year');"

try {
    $verifyResult = & $mysqlPath -u root -e $verifyQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Kolom yang berhasil ditambahkan:" -ForegroundColor Green
        Write-Host $verifyResult
        Write-Host ""
        
        $columnLines = $verifyResult -split "`n" | Where-Object { $_ -match "academic_level|current_grade|academic_year" }
        if ($columnLines.Count -ge 3) {
            Write-Host "[SUCCESS] Migration BERHASIL! Semua kolom sudah ditambahkan." -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Beberapa kolom mungkin belum ditambahkan." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[WARNING] Tidak bisa memverifikasi" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Error saat verifikasi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[SUCCESS] Migration selesai!" -ForegroundColor Green
Write-Host ""

