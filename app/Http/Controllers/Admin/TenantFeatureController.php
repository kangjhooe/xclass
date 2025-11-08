<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Core\Tenant;
use App\Helpers\AuditHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TenantFeatureController extends Controller
{
    /**
     * Display tenant features management
     */
    public function index()
    {
        $tenants = Tenant::withCount(['users' => function($query) {
                $query->whereIn('role', ['super_admin', 'school_admin']);
            }])
            ->orderBy('name')
            ->paginate(20);

        $availableFeatures = $this->getAvailableFeatures();

        return view('admin.tenant-features.index', compact('tenants', 'availableFeatures'));
    }

    /**
     * Show features for specific tenant
     */
    public function show(Tenant $tenant)
    {
        // Get tenant features from pivot table
        $tenantFeatures = DB::table('tenant_feature_pivot')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->pluck('feature_name')
            ->toArray();

        $availableFeatures = $this->getAvailableFeatures();

        return view('admin.tenant-features.show', compact('tenant', 'availableFeatures', 'tenantFeatures'));
    }

    /**
     * Update tenant features
     */
    public function update(Request $request, Tenant $tenant)
    {
        $request->validate([
            'features' => 'array',
            'features.*' => 'string|in:' . implode(',', array_keys($this->getAvailableFeatures()))
        ]);

        $selectedFeatures = $request->input('features', []);
        
        // Get current features
        $currentFeatures = DB::table('tenant_feature_pivot')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->pluck('feature_name')
            ->toArray();
        
        // Update features in pivot table
        DB::transaction(function() use ($tenant, $selectedFeatures) {
            // Deactivate all current features
            DB::table('tenant_feature_pivot')
                ->where('tenant_id', $tenant->id)
                ->update(['is_active' => false, 'deactivated_at' => now()]);
            
            // Insert new features
            foreach ($selectedFeatures as $feature) {
                DB::table('tenant_feature_pivot')->updateOrInsert(
                    ['tenant_id' => $tenant->id, 'feature_name' => $feature],
                    [
                        'is_active' => true,
                        'activated_at' => now(),
                        'deactivated_at' => null,
                        'updated_at' => now()
                    ]
                );
            }
        });

        // Log the change
        AuditHelper::info("Tenant features updated: {$tenant->name}", [
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
            'features' => $selectedFeatures,
            'previous_features' => $currentFeatures
        ]);

        return redirect()->route('admin.tenant-features.show', $tenant)
            ->with('success', 'Tenant features updated successfully.');
    }

    /**
     * Bulk update features for multiple tenants
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'tenant_ids' => 'required|array',
            'tenant_ids.*' => 'exists:tenants,id',
            'action' => 'required|in:enable,disable,set',
            'features' => 'required_if:action,set|array',
            'features.*' => 'string|in:' . implode(',', array_keys($this->getAvailableFeatures()))
        ]);

        $tenantIds = $request->input('tenant_ids');
        $action = $request->input('action');
        $features = $request->input('features', []);

        $tenants = Tenant::whereIn('id', $tenantIds)->get();

        foreach ($tenants as $tenant) {
            switch ($action) {
                case 'enable':
                    // Enable features
                    foreach ($features as $feature) {
                        DB::table('tenant_feature_pivot')->updateOrInsert(
                            ['tenant_id' => $tenant->id, 'feature_name' => $feature],
                            [
                                'is_active' => true,
                                'activated_at' => now(),
                                'deactivated_at' => null,
                                'updated_at' => now()
                            ]
                        );
                    }
                    break;
                case 'disable':
                    // Disable features
                    DB::table('tenant_feature_pivot')
                        ->where('tenant_id', $tenant->id)
                        ->whereIn('feature_name', $features)
                        ->update(['is_active' => false, 'deactivated_at' => now()]);
                    break;
                case 'set':
                    // Set features (replace all)
                    DB::table('tenant_feature_pivot')
                        ->where('tenant_id', $tenant->id)
                        ->update(['is_active' => false, 'deactivated_at' => now()]);
                    
                    foreach ($features as $feature) {
                        DB::table('tenant_feature_pivot')->updateOrInsert(
                            ['tenant_id' => $tenant->id, 'feature_name' => $feature],
                            [
                                'is_active' => true,
                                'activated_at' => now(),
                                'deactivated_at' => null,
                                'updated_at' => now()
                            ]
                        );
                    }
                    break;
            }

            // Log each change
            AuditHelper::info("Bulk feature update for tenant: {$tenant->name}", [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'action' => $action,
                'features' => $features
            ]);
        }

        return redirect()->route('admin.tenant-features.index')
            ->with('success', "Features updated for {$tenants->count()} tenants.");
    }

    /**
     * Get available features configuration
     */
    private function getAvailableFeatures()
    {
        // CATATAN: Features seharusnya hanya fitur premium/tambahan
        // Namun untuk backward compatibility, beberapa modul utama (exam) tetap ada di sini
        // Modul utama lainnya (ppdb, library, dll) dikelola di /admin/tenant-access
        return [
            // Modul utama (untuk backward compatibility)
            'exam' => [
                'name' => 'Exam Management',
                'description' => 'Create and manage exams, assessments, and evaluations',
                'icon' => 'fas fa-clipboard-list',
                'category' => 'Core'
            ],
            // Fitur premium/tambahan
            'online_payment' => [
                'name' => 'Pembayaran Online',
                'description' => 'Sistem pembayaran online untuk SPP dan biaya lainnya',
                'icon' => 'fas fa-credit-card',
                'category' => 'Finance'
            ],
            'bulk_export' => [
                'name' => 'Export Bulk Data',
                'description' => 'Export data dalam jumlah besar (siswa, nilai, dll)',
                'icon' => 'fas fa-file-export',
                'category' => 'Data'
            ],
            'advanced_reporting' => [
                'name' => 'Laporan Lanjutan',
                'description' => 'Laporan dan analitik yang lebih detail dan custom',
                'icon' => 'fas fa-chart-bar',
                'category' => 'Analytics'
            ],
            'api_access' => [
                'name' => 'Akses API',
                'description' => 'Akses ke API untuk integrasi dengan sistem eksternal',
                'icon' => 'fas fa-code',
                'category' => 'Integration'
            ],
            'custom_domain' => [
                'name' => 'Domain Kustom',
                'description' => 'Menggunakan domain sendiri (misal: sekolah.sch.id)',
                'icon' => 'fas fa-globe',
                'category' => 'Customization'
            ],
            'backup_automation' => [
                'name' => 'Backup Otomatis',
                'description' => 'Backup data otomatis secara berkala',
                'icon' => 'fas fa-database',
                'category' => 'Data'
            ],
            'multi_language' => [
                'name' => 'Multi Bahasa',
                'description' => 'Dukungan multi bahasa untuk interface',
                'icon' => 'fas fa-language',
                'category' => 'Customization'
            ],
            'advanced_analytics' => [
                'name' => 'Analitik Lanjutan',
                'description' => 'Dashboard analitik dengan visualisasi data yang lebih canggih',
                'icon' => 'fas fa-chart-pie',
                'category' => 'Analytics'
            ],
            'sso_integration' => [
                'name' => 'Integrasi SSO',
                'description' => 'Single Sign-On untuk integrasi dengan sistem lain',
                'icon' => 'fas fa-key',
                'category' => 'Integration'
            ],
            'mobile_app' => [
                'name' => 'Aplikasi Mobile',
                'description' => 'Akses melalui aplikasi mobile native',
                'icon' => 'fas fa-mobile-alt',
                'category' => 'Access'
            ]
        ];
    }
}
