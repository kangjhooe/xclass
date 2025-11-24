# Script PowerShell untuk menjalankan semua script Node "run-*.js" secara berurutan
# Jalankan dari root project (folder yang sama dengan file ini)

param(
    [string[]]$Only,            # Jalankan subset script berdasarkan nama file
    [switch]$IncludeSampleData, # Sertakan script sample data (default: tidak)
    [switch]$AutoYes            # Lewati konfirmasi interaktif
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Bulk Runner: Node Migration Scripts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pastikan node tersedia
$nodeVersion = & node -v 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Node.js tidak ditemukan di PATH." -ForegroundColor Red
    Write-Host "        Install Node.js 18+ lalu coba lagi." -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Node version: $nodeVersion" -ForegroundColor Green

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $projectRoot

try {
    # Ambil semua file run-*.js
    $scripts = Get-ChildItem -Path $projectRoot -Filter "run-*.js" | Sort-Object Name

    if (-not $IncludeSampleData) {
        $scripts = $scripts | Where-Object { $_.Name -notmatch "sample-data" }
    }

    if ($Only -and $Only.Count -gt 0) {
        $selected = @()
        foreach ($name in $Only) {
            $match = $scripts | Where-Object { $_.Name -ieq $name }
            if (-not $match) {
                Write-Host "[WARNING] Script '$name' tidak ditemukan/tersaring." -ForegroundColor Yellow
            } else {
                $selected += $match
            }
        }
        $scripts = $selected
    }

    if (-not $scripts -or $scripts.Count -eq 0) {
        Write-Host "[ERROR] Tidak ada script Node 'run-*.js' yang ditemukan setelah filter." -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "[INFO] Script yang akan dijalankan:" -ForegroundColor Cyan
    $index = 1
    foreach ($script in $scripts) {
        Write-Host ("  {0}. {1}" -f $index, $script.Name) -ForegroundColor White
        $index++
    }
    Write-Host ""

    if (-not $AutoYes) {
        $confirm = Read-Host "Lanjut menjalankan $($scripts.Count) script? (y/n)"
        if ($confirm -notin @('y', 'Y', 'yes', 'YES')) {
            Write-Host "[INFO] Dibatalkan oleh pengguna." -ForegroundColor Yellow
            exit 0
        }
    }

    $results = @()
    foreach ($script in $scripts) {
        Write-Host ""
        Write-Host "----------------------------------------" -ForegroundColor DarkGray
        Write-Host "[RUN] node $($script.Name)" -ForegroundColor Cyan
        Write-Host "----------------------------------------" -ForegroundColor DarkGray

        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        & node $script.FullName
        $exitCode = $LASTEXITCODE
        $stopwatch.Stop()

        $status = if ($exitCode -eq 0) { "SUCCESS" } else { "FAILED" }
        $color = if ($exitCode -eq 0) { "Green" } else { "Red" }
        Write-Host "[RESULT] $status ($($stopwatch.Elapsed.ToString()))" -ForegroundColor $color

        $results += [PSCustomObject]@{
            Script   = $script.Name
            Status   = $status
            Duration = $stopwatch.Elapsed.ToString()
            ExitCode = $exitCode
        }

        if ($exitCode -ne 0) {
            if (-not $AutoYes) {
                $continue = Read-Host "Script gagal. Lanjut ke script berikutnya? (y/n)"
                if ($continue -notin @('y', 'Y', 'yes', 'YES')) {
                    break
                }
            }
        }
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Ringkasan Eksekusi" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    $results | Format-Table -AutoSize
    Write-Host ""
    Write-Host "[INFO] Selesai. Periksa log masing-masing script di atas jika ada yang gagal." -ForegroundColor Green
}
finally {
    Pop-Location
}

