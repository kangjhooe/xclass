<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Core\Tenant;
use App\Models\Core\TenantFeature;
use App\Models\Core\TenantModule;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;

class TenantAccessController extends Controller
{
    /**
     * Display bulk update page
     */
    public function bulk(): View
    {
        $tenants = Tenant::with(['features', 'modules'])->get();
        
        return view('admin.tenant-access.bulk', compact('tenants'));
    }

    /**
     * Display tenant access management page
     */
    public function index(Request $request): View
    {
        $query = Tenant::with(['features', 'modules']);

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('npsn', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $status = $request->get('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $tenants = $query->paginate(15);

        return view('admin.tenant-access.index', compact('tenants'));
    }

    /**
     * Show tenant access details
     */
    public function show(Tenant $tenant): View
    {
        $tenant->load(['features', 'modules']);
        
        // Daftar semua fitur yang tersedia
        $availableFeatures = $this->getAvailableFeatures();
        
        // Daftar semua modul yang tersedia
        $availableModules = $this->getAvailableModules();

        return view('admin.tenant-access.show', compact('tenant', 'availableFeatures', 'availableModules'));
    }

    /**
     * Update tenant feature access
     */
    public function updateFeature(Request $request, Tenant $tenant): RedirectResponse
    {
        $request->validate([
            'feature_key' => 'required|string',
            'feature_name' => 'required|string',
            'is_enabled' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        // Check if feature exists in pivot table
        $exists = DB::table('tenant_feature_pivot')
            ->where('tenant_id', $tenant->id)
            ->where('feature_name', $request->feature_key)
            ->exists();

        $isEnabled = $request->input('is_enabled', true);
        
        $data = [
            'feature_name' => $request->feature_key,
            'is_active' => $isEnabled,
            'updated_at' => now(),
        ];

        // Add settings if provided (stored as JSON)
        if ($request->filled('settings')) {
            $data['settings'] = json_encode($request->input('settings'));
        }

        // Set activated/deactivated timestamps
        if ($isEnabled) {
            $data['activated_at'] = now();
            $data['deactivated_at'] = null;
        } else {
            $data['deactivated_at'] = now();
        }

        if ($exists) {
            DB::table('tenant_feature_pivot')
                ->where('tenant_id', $tenant->id)
                ->where('feature_name', $request->feature_key)
                ->update($data);
        } else {
            $data['tenant_id'] = $tenant->id;
            $data['created_at'] = now();
            if (!$isEnabled) {
                $data['activated_at'] = null;
            }
            DB::table('tenant_feature_pivot')->insert($data);
        }

        return redirect()->back()->with('success', 'Akses fitur berhasil diperbarui');
    }

    /**
     * Update tenant module access
     */
    public function updateModule(Request $request, Tenant $tenant): RedirectResponse
    {
        $request->validate([
            'module_key' => 'required|string',
            'module_name' => 'required|string',
            'is_enabled' => 'boolean',
            'permissions' => 'nullable|array',
            'expires_at' => 'nullable|date',
            'settings' => 'nullable|array',
        ]);

        $module = $tenant->modules()->where('module_key', $request->module_key)->first();

        if ($module) {
            $module->update($request->only([
                'module_name', 'is_enabled', 'permissions', 'expires_at', 'settings'
            ]));
        } else {
            $tenant->modules()->create($request->all());
        }

        return redirect()->back()->with('success', 'Akses modul berhasil diperbarui');
    }

    /**
     * Remove tenant feature access
     */
    public function removeFeature(Tenant $tenant, string $featureKey): RedirectResponse
    {
        DB::table('tenant_feature_pivot')
            ->where('tenant_id', $tenant->id)
            ->where('feature_name', $featureKey)
            ->delete();

        return redirect()->back()->with('success', 'Akses fitur berhasil dihapus');
    }

    /**
     * Remove tenant module access
     */
    public function removeModule(Tenant $tenant, string $moduleKey): RedirectResponse
    {
        $tenant->modules()->where('module_key', $moduleKey)->delete();

        return redirect()->back()->with('success', 'Akses modul berhasil dihapus');
    }

    /**
     * Bulk update tenant access
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'tenant_ids' => 'required|array',
            'tenant_ids.*' => 'exists:tenants,id',
            'action' => 'required|in:enable_features,disable_features,enable_modules,disable_modules',
            'keys' => 'required|array',
            'keys.*' => 'string',
        ]);

        $tenantIds = $request->tenant_ids;
        $action = $request->action;
        $keys = $request->keys;

        foreach ($tenantIds as $tenantId) {
            $tenant = Tenant::find($tenantId);
            
            if ($action === 'enable_features') {
                foreach ($keys as $key) {
                    $this->enableFeature($tenant, $key);
                }
            } elseif ($action === 'disable_features') {
                foreach ($keys as $key) {
                    $this->disableFeature($tenant, $key);
                }
            } elseif ($action === 'enable_modules') {
                foreach ($keys as $key) {
                    $this->enableModule($tenant, $key);
                }
            } elseif ($action === 'disable_modules') {
                foreach ($keys as $key) {
                    $this->disableModule($tenant, $key);
                }
            }
        }

        return redirect()->back()->with('success', 'Akses berhasil diperbarui untuk ' . count($tenantIds) . ' tenant');
    }

    /**
     * Get available features
     */
    private function getAvailableFeatures(): array
    {
        return [
            'online_payment' => 'Pembayaran Online',
            'bulk_export' => 'Export Bulk Data',
            'advanced_reporting' => 'Laporan Lanjutan',
            'api_access' => 'Akses API',
            'custom_domain' => 'Domain Kustom',
            'backup_automation' => 'Backup Otomatis',
            'multi_language' => 'Multi Bahasa',
            'advanced_analytics' => 'Analitik Lanjutan',
            'sso_integration' => 'Integrasi SSO',
            'mobile_app' => 'Aplikasi Mobile',
        ];
    }

    /**
     * Get available modules
     */
    private function getAvailableModules(): array
    {
        return [
            'ppdb' => 'PPDB/SPMB',
            'spp' => 'SPP (Sumbangan Pembinaan Pendidikan)',
            'library' => 'Perpustakaan',
            'inventory' => 'Inventori/Aset',
            'exam' => 'Ujian Online',
            'elearning' => 'E-Learning',
            'extracurricular' => 'Ekstrakurikuler',
            'parent_portal' => 'Portal Orang Tua',
            'counseling' => 'Bimbingan Konseling',
            'discipline' => 'Kedisiplinan',
            'graduation' => 'Pengumuman Kelulusan',
            'events' => 'Event/Agenda',
            'health' => 'Kesehatan',
            'transportation' => 'Transportasi',
            'cafeteria' => 'Kafetaria',
            'alumni' => 'Alumni',
            'correspondence' => 'Persuratan',
            'academic' => 'Akademik (Kurikulum & Silabus)',
            'finance' => 'Keuangan',
            'hr' => 'SDM (Sumber Daya Manusia)',
            'facility' => 'Fasilitas',
            'report' => 'Laporan',
        ];
    }

    /**
     * Enable feature for tenant
     */
    private function enableFeature(Tenant $tenant, string $featureKey): void
    {
        $exists = DB::table('tenant_feature_pivot')
            ->where('tenant_id', $tenant->id)
            ->where('feature_name', $featureKey)
            ->exists();

        if (!$exists) {
            DB::table('tenant_feature_pivot')->insert([
                'tenant_id' => $tenant->id,
                'feature_name' => $featureKey,
                'is_active' => true,
                'activated_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('tenant_feature_pivot')
                ->where('tenant_id', $tenant->id)
                ->where('feature_name', $featureKey)
                ->update(['is_active' => true, 'activated_at' => now()]);
        }
    }

    /**
     * Disable feature for tenant
     */
    private function disableFeature(Tenant $tenant, string $featureKey): void
    {
        DB::table('tenant_feature_pivot')
            ->where('tenant_id', $tenant->id)
            ->where('feature_name', $featureKey)
            ->update(['is_active' => false, 'deactivated_at' => now()]);
    }

    /**
     * Enable module for tenant
     */
    private function enableModule(Tenant $tenant, string $moduleKey): void
    {
        $module = $tenant->modules()->where('module_key', $moduleKey)->first();
        
        if (!$module) {
            $tenant->modules()->create([
                'module_key' => $moduleKey,
                'module_name' => $this->getAvailableModules()[$moduleKey] ?? $moduleKey,
                'is_enabled' => true,
                'permissions' => ['*'], // Default: semua permission
            ]);
        } else {
            $module->update(['is_enabled' => true]);
        }
    }

    /**
     * Disable module for tenant
     */
    private function disableModule(Tenant $tenant, string $moduleKey): void
    {
        $tenant->modules()->where('module_key', $moduleKey)->update(['is_enabled' => false]);
    }
}
