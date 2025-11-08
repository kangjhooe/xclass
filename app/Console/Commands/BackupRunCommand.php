<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

class BackupRunCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:run 
                            {--filename= : Nama file backup}
                            {--only-db : Hanya backup database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Membuat backup database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filename = $this->option('filename');
        $onlyDb = $this->option('only-db');

        if (!$filename) {
            $this->error('Parameter --filename diperlukan');
            return 1;
        }

        try {
            // Gunakan Storage facade untuk konsistensi dengan controller
            // Storage disk 'local' menggunakan root: storage/app/private
            // Tapi kita akan simpan di storage/app/backups untuk akses lebih mudah
            $backupPath = storage_path('app/backups');
            if (!is_dir($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            // Gunakan path absolut untuk mysqldump
            $filePath = $backupPath . DIRECTORY_SEPARATOR . $filename;

            // Dapatkan konfigurasi database
            $connection = Config::get('database.default');
            $config = Config::get("database.connections.{$connection}");

            // Buat backup berdasarkan tipe database
            if ($connection === 'mysql' || $connection === 'mariadb') {
                $this->backupMySQL($config, $filePath);
            } elseif ($connection === 'pgsql') {
                $this->backupPostgreSQL($config, $filePath);
            } elseif ($connection === 'sqlite') {
                $this->backupSQLite($config, $filePath);
            } else {
                $this->error("Tipe database {$connection} belum didukung");
                return 1;
            }

            // Verifikasi file sudah dibuat
            if (!file_exists($filePath) || filesize($filePath) === 0) {
                throw new \Exception("File backup tidak berhasil dibuat atau kosong");
            }

            $this->info("Backup berhasil dibuat: {$filename}");
            $this->info("Lokasi: {$filePath}");
            return 0;

        } catch (\Exception $e) {
            $this->error("Gagal membuat backup: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Backup MySQL/MariaDB database
     */
    protected function backupMySQL(array $config, string $filePath): void
    {
        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? '3306';
        $database = $config['database'];
        $username = $config['username'];
        $password = $config['password'] ?? '';

        // Deteksi path mysqldump (untuk XAMPP di Windows)
        $mysqldumpPath = $this->findMySQLDumpPath();

        // Normalize path untuk Windows
        $filePath = str_replace('/', DIRECTORY_SEPARATOR, $filePath);

        // Build command untuk Windows
        // Gunakan --result-file untuk Windows agar output redirect bekerja dengan benar
        // Escape path dengan benar untuk Windows
        $command = sprintf(
            '"%s" --host=%s --port=%s --user=%s --password=%s --result-file=%s %s',
            $mysqldumpPath,
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($password),
            escapeshellarg($filePath),
            escapeshellarg($database)
        );

        // Execute command dengan output capture
        $output = [];
        $returnCode = 0;
        exec($command . ' 2>&1', $output, $returnCode);

        // Debug: log command yang dijalankan (tanpa password)
        $debugCommand = str_replace('--password=' . escapeshellarg($password), '--password=***', $command);
        $this->line("Command: {$debugCommand}");

        if ($returnCode !== 0) {
            $errorMsg = implode("\n", $output);
            $this->error("Output: {$errorMsg}");
            throw new \Exception("mysqldump gagal dengan kode error: {$returnCode}. Pesan: {$errorMsg}");
        }

        // Tunggu sebentar untuk memastikan file sudah ditulis
        $attempts = 0;
        while (!file_exists($filePath) && $attempts < 10) {
            usleep(100000); // 100ms
            $attempts++;
        }

        if (!file_exists($filePath)) {
            throw new \Exception("File backup tidak ditemukan di: {$filePath}");
        }

        if (filesize($filePath) === 0) {
            throw new \Exception("File backup kosong: {$filePath}");
        }
    }

    /**
     * Backup PostgreSQL database
     */
    protected function backupPostgreSQL(array $config, string $filePath): void
    {
        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? '5432';
        $database = $config['database'];
        $username = $config['username'];
        $password = $config['password'];

        // Set password untuk pg_dump
        putenv("PGPASSWORD={$password}");

        $pgDumpPath = $this->findPostgreSQLDumpPath();

        $command = sprintf(
            '"%s" --host=%s --port=%s --username=%s --dbname=%s --file="%s" --no-password',
            $pgDumpPath,
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($database),
            $filePath
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception("pg_dump gagal dengan kode error: {$returnCode}");
        }
    }

    /**
     * Backup SQLite database
     */
    protected function backupSQLite(array $config, string $filePath): void
    {
        $database = $config['database'];

        if (!file_exists($database)) {
            throw new \Exception("File database SQLite tidak ditemukan: {$database}");
        }

        // Copy file database
        if (!copy($database, $filePath)) {
            throw new \Exception("Gagal menyalin file database SQLite");
        }
    }

    /**
     * Cari path mysqldump untuk XAMPP di Windows
     */
    protected function findMySQLDumpPath(): string
    {
        // Cek beberapa lokasi umum untuk XAMPP
        $possiblePaths = [
            'C:\\xampp\\mysql\\bin\\mysqldump.exe',
            'C:\\Program Files\\xampp\\mysql\\bin\\mysqldump.exe',
            'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe',
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        // Jika tidak ditemukan, coba cari di PATH
        $which = shell_exec('where mysqldump 2>nul');
        if ($which) {
            $paths = explode("\n", trim($which));
            return trim($paths[0]);
        }

        throw new \Exception("mysqldump tidak ditemukan. Pastikan MySQL/MariaDB sudah terinstall di XAMPP.");
    }

    /**
     * Cari path pg_dump untuk PostgreSQL
     */
    protected function findPostgreSQLDumpPath(): string
    {
        $possiblePaths = [
            'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
            'pg_dump', // Jika sudah di PATH
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path) || $this->commandExists($path)) {
                return $path;
            }
        }

        throw new \Exception("pg_dump tidak ditemukan. Pastikan PostgreSQL sudah terinstall.");
    }

    /**
     * Cek apakah command tersedia
     */
    protected function commandExists(string $command): bool
    {
        $where = shell_exec("where {$command} 2>nul");
        return !empty($where);
    }
}

