<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;
use App\Models\Tenant\AdditionalDuty;
use App\Models\Tenant\ModuleAccess;
use App\Models\Core\Tenant;

class AdditionalDutySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all active tenants
        $tenants = Tenant::where('is_active', true)->get();

        foreach ($tenants as $tenant) {
            // Define default additional duties
            $duties = [
                [
                    'code' => 'kepala_sekolah',
                    'name' => 'Kepala Sekolah/Madrasah',
                    'description' => 'Kepala Sekolah atau Kepala Madrasah memiliki akses penuh ke semua modul',
                    'order' => 1,
                    'modules' => [], // Kepala sekolah punya akses penuh melalui code khusus di middleware
                ],
                [
                    'code' => 'waka_kurikulum',
                    'name' => 'Waka Kurikulum',
                    'description' => 'Wakil Kepala Sekolah bidang Kurikulum',
                    'order' => 2,
                    'modules' => [
                        ['code' => 'subjects', 'name' => 'Mata Pelajaran', 'permissions' => ['*']],
                        ['code' => 'schedules', 'name' => 'Jadwal Pelajaran', 'permissions' => ['*']],
                        ['code' => 'grades', 'name' => 'Penilaian', 'permissions' => ['*']],
                        ['code' => 'academic', 'name' => 'Akademik', 'permissions' => ['*']],
                        ['code' => 'report', 'name' => 'Laporan', 'permissions' => ['read', 'export']],
                    ],
                ],
                [
                    'code' => 'guru_bk',
                    'name' => 'Guru BK (Bimbingan Konseling)',
                    'description' => 'Guru Bimbingan dan Konseling',
                    'order' => 3,
                    'modules' => [
                        ['code' => 'counseling', 'name' => 'Konseling', 'permissions' => ['*']],
                        ['code' => 'discipline', 'name' => 'Kedisiplinan', 'permissions' => ['*']],
                        ['code' => 'students', 'name' => 'Data Siswa', 'permissions' => ['read']],
                    ],
                ],
                [
                    'code' => 'waka_sarana',
                    'name' => 'Waka Sarana Prasarana',
                    'description' => 'Wakil Kepala Sekolah bidang Sarana dan Prasarana',
                    'order' => 4,
                    'modules' => [
                        ['code' => 'facility', 'name' => 'Sarana Prasarana', 'permissions' => ['*']],
                        ['code' => 'inventory', 'name' => 'Inventori', 'permissions' => ['*']],
                    ],
                ],
                [
                    'code' => 'tata_usaha',
                    'name' => 'Tata Usaha',
                    'description' => 'Staf Tata Usaha yang mengelola administrasi',
                    'order' => 5,
                    'modules' => [
                        ['code' => 'correspondence', 'name' => 'Persuratan', 'permissions' => ['*']],
                        ['code' => 'students', 'name' => 'Data Siswa', 'permissions' => ['read']],
                        ['code' => 'teachers', 'name' => 'Data Guru', 'permissions' => ['read']],
                    ],
                ],
                [
                    'code' => 'waka_kesiswaan',
                    'name' => 'Waka Kesiswaan',
                    'description' => 'Wakil Kepala Sekolah bidang Kesiswaan',
                    'order' => 6,
                    'modules' => [
                        ['code' => 'students', 'name' => 'Data Siswa', 'permissions' => ['*']],
                        ['code' => 'attendance', 'name' => 'Kehadiran', 'permissions' => ['*']],
                        ['code' => 'extracurricular', 'name' => 'Ekstrakurikuler', 'permissions' => ['*']],
                        ['code' => 'events', 'name' => 'Kegiatan', 'permissions' => ['*']],
                    ],
                ],
                [
                    'code' => 'bendahara',
                    'name' => 'Bendahara',
                    'description' => 'Bendahara sekolah yang mengelola keuangan',
                    'order' => 7,
                    'modules' => [
                        ['code' => 'finance', 'name' => 'Keuangan', 'permissions' => ['*']],
                        ['code' => 'spp', 'name' => 'SPP', 'permissions' => ['*']],
                        ['code' => 'report', 'name' => 'Laporan', 'permissions' => ['read', 'export']],
                    ],
                ],
                [
                    'code' => 'guru_piket',
                    'name' => 'Guru Piket',
                    'description' => 'Guru yang ditugaskan untuk piket',
                    'order' => 8,
                    'modules' => [
                        ['code' => 'attendance', 'name' => 'Kehadiran', 'permissions' => ['create', 'read', 'update']],
                    ],
                ],
            ];

            foreach ($duties as $dutyData) {
                $modules = $dutyData['modules'];
                unset($dutyData['modules']);

                // Create or update additional duty
                $duty = AdditionalDuty::updateOrCreate(
                    [
                        'instansi_id' => $tenant->id,
                        'code' => $dutyData['code'],
                    ],
                    $dutyData
                );

                // Create module accesses
                foreach ($modules as $module) {
                    ModuleAccess::updateOrCreate(
                        [
                            'instansi_id' => $tenant->id,
                            'additional_duty_id' => $duty->id,
                            'module_code' => $module['code'],
                        ],
                        [
                            'module_name' => $module['name'],
                            'permissions' => $module['permissions'],
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
