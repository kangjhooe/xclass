<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Core\Tenant;
use App\Models\Core\TenantModule;

class FixTenantAccess extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:fix-access {npsn}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix tenant access by enabling required modules';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $npsn = $this->argument('npsn');
        
        $this->info("=== Fix Tenant Access untuk NPSN {$npsn} ===");
        
        // Cari tenant dengan NPSN
        $tenant = Tenant::where('npsn', $npsn)->first();

        if (!$tenant) {
            $this->error("❌ Tenant dengan NPSN {$npsn} tidak ditemukan!");
            return 1;
        }

        $this->info("✅ Tenant ditemukan: {$tenant->name} (NPSN: {$tenant->npsn})");

        // Modul yang diperlukan
        $requiredModules = [
            'students' => 'Manajemen Siswa',
            'teachers' => 'Manajemen Guru',
            'classes' => 'Manajemen Kelas',
            'subjects' => 'Manajemen Mata Pelajaran',
            'schedules' => 'Manajemen Jadwal',
            'attendance' => 'Manajemen Kehadiran',
            'grades' => 'Manajemen Nilai',
        ];

        $this->info("\n=== Mengaktifkan Modul Core ===");

        foreach ($requiredModules as $moduleKey => $moduleName) {
            $existingModule = $tenant->modules()->where('module_key', $moduleKey)->first();
            
            if (!$existingModule) {
                $tenant->modules()->create([
                    'module_key' => $moduleKey,
                    'module_name' => $moduleName,
                    'is_enabled' => true,
                    'permissions' => ['*'],
                    'settings' => [],
                ]);
                $this->info("✅ Modul '{$moduleKey}' berhasil dibuat dan diaktifkan.");
            } elseif (!$existingModule->is_enabled) {
                $existingModule->update(['is_enabled' => true]);
                $this->info("✅ Modul '{$moduleKey}' berhasil diaktifkan.");
            } else {
                $this->line("ℹ️  Modul '{$moduleKey}' sudah aktif.");
            }
        }

        $this->info("\n=== Ringkasan ===");
        $this->info("Tenant: {$tenant->name} (NPSN: {$tenant->npsn})");
        $this->info("Modul yang aktif: " . $tenant->modules()->where('is_enabled', true)->count() . " modul");

        $this->info("\n✅ Selesai! Sekarang Anda dapat mengakses:");
        $this->info("   http://localhost/class/public/index.php/{$npsn}/students");

        return 0;
    }
}
