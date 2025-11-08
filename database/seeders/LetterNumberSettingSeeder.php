<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LetterNumberSetting;
use App\Models\Core\Tenant;

class LetterNumberSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tenants
        $tenants = Tenant::all();
        
        foreach ($tenants as $tenant) {
            // Check if setting already exists
            $existingSetting = LetterNumberSetting::where('instansi_id', $tenant->id)->first();
            
            if (!$existingSetting) {
                LetterNumberSetting::create([
                    'instansi_id' => $tenant->id,
                    'jenis_surat' => 'umum',
                    'format_nomor' => '{{NOMOR}}/{{INSTITUSI}}/{{BULAN_ROMAWI}}/{{TAHUN}}',
                    'nomor_terakhir' => 0,
                    'reset_tahunan' => true,
                    'kode_lembaga' => strtoupper(substr($tenant->name, 0, 3)) . '001',
                    'deskripsi' => 'Pengaturan nomor surat otomatis untuk ' . $tenant->name,
                    'created_by' => 1,
                ]);
            }
        }
    }
}
