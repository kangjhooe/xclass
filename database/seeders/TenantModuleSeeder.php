<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Core\Tenant;
use App\Models\Core\TenantModule;

class TenantModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'module_key' => 'data_pokok',
                'module_name' => 'Data Pokok',
                'permissions' => ['create', 'read', 'update', 'delete', 'export'],
            ],
            [
                'module_key' => 'ppdb',
                'module_name' => 'PPDB (Penerimaan Peserta Didik Baru)',
                'permissions' => ['create', 'read', 'update', 'delete', 'export'],
            ],
            [
                'module_key' => 'spp',
                'module_name' => 'SPP (Sumbangan Pembinaan Pendidikan)',
                'permissions' => ['create', 'read', 'update', 'delete', 'export'],
            ],
            [
                'module_key' => 'library',
                'module_name' => 'Perpustakaan',
                'permissions' => ['create', 'read', 'update', 'delete', 'loan', 'return'],
            ],
            [
                'module_key' => 'cafeteria',
                'module_name' => 'Kafetaria',
                'permissions' => ['create', 'read', 'update', 'delete', 'order'],
            ],
            [
                'module_key' => 'inventory',
                'module_name' => 'Inventori',
                'permissions' => ['create', 'read', 'update', 'delete', 'movement'],
            ],
            [
                'module_key' => 'exam',
                'module_name' => 'Ujian Online',
                'permissions' => ['create', 'read', 'update', 'delete', 'grade'],
            ],
            [
                'module_key' => 'elearning',
                'module_name' => 'E-Learning',
                'permissions' => ['create', 'read', 'update', 'delete', 'enroll', 'grade'],
            ],
            [
                'module_key' => 'extracurricular',
                'module_name' => 'Ekstrakurikuler',
                'permissions' => ['create', 'read', 'update', 'delete', 'participate'],
            ],
            [
                'module_key' => 'parent_portal',
                'module_name' => 'Portal Orang Tua',
                'permissions' => ['read', 'notify', 'message'],
            ],
            [
                'module_key' => 'counseling',
                'module_name' => 'Bimbingan Konseling',
                'permissions' => ['create', 'read', 'update', 'delete', 'schedule'],
            ],
            [
                'module_key' => 'discipline',
                'module_name' => 'Kedisiplinan',
                'permissions' => ['create', 'read', 'update', 'delete', 'action'],
            ],
            [
                'module_key' => 'graduation',
                'module_name' => 'Kelulusan',
                'permissions' => ['create', 'read', 'update', 'delete', 'certificate'],
            ],
            [
                'module_key' => 'events',
                'module_name' => 'Event',
                'permissions' => ['create', 'read', 'update', 'delete', 'schedule'],
            ],
            [
                'module_key' => 'health',
                'module_name' => 'Kesehatan',
                'permissions' => ['create', 'read', 'update', 'delete', 'record'],
            ],
            [
                'module_key' => 'transportation',
                'module_name' => 'Transportasi',
                'permissions' => ['create', 'read', 'update', 'delete', 'route'],
            ],
            [
                'module_key' => 'alumni',
                'module_name' => 'Alumni',
                'permissions' => ['create', 'read', 'update', 'delete', 'achievement'],
            ],
            [
                'module_key' => 'correspondence',
                'module_name' => 'Persuratan',
                'permissions' => ['create', 'read', 'update', 'delete', 'archive'],
            ],
            [
                'module_key' => 'academic',
                'module_name' => 'Akademik',
                'permissions' => ['create', 'read', 'update', 'delete', 'curriculum'],
            ],
            [
                'module_key' => 'finance',
                'module_name' => 'Keuangan',
                'permissions' => ['create', 'read', 'update', 'delete', 'budget'],
            ],
            [
                'module_key' => 'hr',
                'module_name' => 'SDM',
                'permissions' => ['create', 'read', 'update', 'delete', 'payroll'],
            ],
            [
                'module_key' => 'facility',
                'module_name' => 'Sarana Prasarana',
                'permissions' => ['create', 'read', 'update', 'delete', 'maintenance'],
            ],
            [
                'module_key' => 'report',
                'module_name' => 'Laporan',
                'permissions' => ['read', 'export', 'print'],
            ],
        ];

        // Get all active tenants
        $tenants = Tenant::where('is_active', true)->get();

        foreach ($tenants as $tenant) {
            foreach ($modules as $moduleData) {
                // Check if module already exists for this tenant
                $existingModule = TenantModule::where('tenant_id', $tenant->id)
                    ->where('module_key', $moduleData['module_key'])
                    ->first();

                if (!$existingModule) {
                    TenantModule::create([
                        'tenant_id' => $tenant->id,
                        'module_key' => $moduleData['module_key'],
                        'module_name' => $moduleData['module_name'],
                        'is_enabled' => true,
                        'permissions' => $moduleData['permissions'],
                        'settings' => [],
                    ]);
                }
            }
        }
    }
}
