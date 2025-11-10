# Script Cleanup Laravel Files
# PERINGATAN: Backup dulu sebelum menjalankan script ini!

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "SCRIPT CLEANUP LARAVEL FILES" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "PERINGATAN: Script ini akan menghapus file Laravel!" -ForegroundColor Red
Write-Host "Pastikan Anda sudah:" -ForegroundColor Yellow
Write-Host "1. Backup semua file penting" -ForegroundColor Yellow
Write-Host "2. Test semua fitur NestJS/Next.js sudah bekerja" -ForegroundColor Yellow
Write-Host "3. Semua data sudah di-migrate" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Apakah Anda yakin ingin melanjutkan? (ketik 'YES' untuk melanjutkan)"

if ($confirm -ne "YES") {
    Write-Host "Cleanup dibatalkan." -ForegroundColor Green
    exit
}

Write-Host ""
Write-Host "Memulai cleanup..." -ForegroundColor Cyan

# Backup timestamp
$backupDir = "laravel-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "Backup directory dibuat: $backupDir" -ForegroundColor Green

# Function untuk safe delete dengan backup
function Safe-Delete {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        Write-Host "Menghapus: $Description" -ForegroundColor Yellow
        try {
            # Backup dulu
            $backupPath = Join-Path $backupDir (Split-Path $Path -Leaf)
            Copy-Item -Path $Path -Destination $backupPath -Recurse -Force -ErrorAction SilentlyContinue
            
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✓ Berhasil dihapus" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  - Tidak ditemukan: $Path" -ForegroundColor Gray
    }
}

# Hapus routes Laravel
Write-Host ""
Write-Host "Menghapus Laravel Routes..." -ForegroundColor Cyan
Safe-Delete "routes" "Laravel Routes"

# Hapus controllers Laravel
Write-Host ""
Write-Host "Menghapus Laravel Controllers..." -ForegroundColor Cyan
Safe-Delete "app\Http\Controllers" "Laravel Controllers"

# Hapus models Laravel
Write-Host ""
Write-Host "Menghapus Laravel Models..." -ForegroundColor Cyan
Safe-Delete "app\Models" "Laravel Models"

# Hapus views Laravel
Write-Host ""
Write-Host "Menghapus Laravel Views..." -ForegroundColor Cyan
Safe-Delete "resources\views" "Laravel Views"

# Hapus Laravel modules
Write-Host ""
Write-Host "Menghapus Laravel Modules..." -ForegroundColor Cyan
Safe-Delete "Modules" "Laravel Modules"

# Hapus config Laravel
Write-Host ""
Write-Host "Menghapus Laravel Config..." -ForegroundColor Cyan
Safe-Delete "config" "Laravel Config"

# Hapus vendor Laravel
Write-Host ""
Write-Host "Menghapus Laravel Vendor..." -ForegroundColor Cyan
Safe-Delete "vendor" "Laravel Vendor"

# Hapus bootstrap Laravel
Write-Host ""
Write-Host "Menghapus Laravel Bootstrap..." -ForegroundColor Cyan
Safe-Delete "bootstrap" "Laravel Bootstrap"

# Hapus file-file Laravel
Write-Host ""
Write-Host "Menghapus Laravel Core Files..." -ForegroundColor Cyan
$laravelFiles = @(
    "artisan",
    "artisan.backup",
    "composer.json",
    "composer.lock",
    "composer.json.backup",
    "composer.lock.backup",
    "vite.config.js",
    "vite-module-loader.js",
    "phpunit.xml",
    "run_exam_setup.php"
)

foreach ($file in $laravelFiles) {
    if (Test-Path $file) {
        Write-Host "Menghapus: $file" -ForegroundColor Yellow
        try {
            Copy-Item -Path $file -Destination (Join-Path $backupDir $file) -Force -ErrorAction SilentlyContinue
            Remove-Item -Path $file -Force -ErrorAction Stop
            Write-Host "  ✓ Berhasil dihapus" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Error: $_" -ForegroundColor Red
        }
    }
}

# Hapus resources Laravel (jika tidak digunakan)
Write-Host ""
Write-Host "Menghapus Laravel Resources..." -ForegroundColor Cyan
if (Test-Path "resources\css") {
    Safe-Delete "resources\css" "Laravel CSS"
}
if (Test-Path "resources\js") {
    Safe-Delete "resources\js" "Laravel JS"
}

# Hapus app Laravel (jika tidak digunakan)
Write-Host ""
Write-Host "Menghapus Laravel App..." -ForegroundColor Cyan
$appFolders = @(
    "app\Console",
    "app\Core",
    "app\Exceptions",
    "app\Exports",
    "app\Helpers",
    "app\Imports",
    "app\Jobs",
    "app\Notifications",
    "app\Observers",
    "app\Policies",
    "app\Providers",
    "app\Repositories",
    "app\Services",
    "app\View"
)

foreach ($folder in $appFolders) {
    if (Test-Path $folder) {
        Safe-Delete $folder "Laravel $folder"
    }
}

# Hapus app/helpers.php
if (Test-Path "app\helpers.php") {
    Safe-Delete "app\helpers.php" "Laravel helpers.php"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "CLEANUP SELESAI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backup disimpan di: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "File yang TIDAK dihapus:" -ForegroundColor Yellow
Write-Host "- .env files" -ForegroundColor Gray
Write-Host "- Documentation (*.md)" -ForegroundColor Gray
Write-Host "- Git files" -ForegroundColor Gray
Write-Host "- Node modules (NestJS/Next.js)" -ForegroundColor Gray
Write-Host "- src/ (NestJS)" -ForegroundColor Gray
Write-Host "- frontend/ (Next.js)" -ForegroundColor Gray
Write-Host ""
Write-Host "Selanjutnya:" -ForegroundColor Yellow
Write-Host "1. Test semua fitur untuk memastikan tidak ada yang rusak" -ForegroundColor White
Write-Host "2. Update .gitignore untuk menghapus entry Laravel" -ForegroundColor White
Write-Host "3. Update README.md dengan instruksi baru" -ForegroundColor White
Write-Host ""

