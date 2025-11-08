<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Helpers\TenantAccessHelper;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ExampleAccessController extends Controller
{
    /**
     * Display PPDB index with access control
     */
    public function ppdbIndex(): View
    {
        // Cek akses modul PPDB
        if (!TenantAccessHelper::hasModule('ppdb')) {
            abort(403, 'Akses ke modul PPDB tidak diizinkan untuk tenant Anda');
        }

        // Cek permission read
        if (!TenantAccessHelper::hasPermission('ppdb', 'read')) {
            abort(403, 'Tidak memiliki permission untuk melihat data PPDB');
        }

        // Get module settings
        $maxApplications = TenantAccessHelper::getModuleSetting('ppdb', 'max_applications', 1000);
        $autoApproval = TenantAccessHelper::getModuleSetting('ppdb', 'auto_approval', false);

        // Your PPDB logic here
        $ppdbData = []; // Replace with actual data

        return view('tenant.ppdb.index', compact('ppdbData', 'maxApplications', 'autoApproval'));
    }

    /**
     * Create PPDB with access control
     */
    public function ppdbCreate(): View
    {
        // Cek akses modul PPDB
        if (!TenantAccessHelper::hasModule('ppdb')) {
            abort(403, 'Akses ke modul PPDB tidak diizinkan untuk tenant Anda');
        }

        // Cek permission create
        if (!TenantAccessHelper::hasPermission('ppdb', 'create')) {
            abort(403, 'Tidak memiliki permission untuk membuat data PPDB');
        }

        return view('tenant.ppdb.create');
    }

    /**
     * Store PPDB with access control
     */
    public function ppdbStore(Request $request): RedirectResponse
    {
        // Cek akses modul PPDB
        if (!TenantAccessHelper::hasModule('ppdb')) {
            abort(403, 'Akses ke modul PPDB tidak diizinkan untuk tenant Anda');
        }

        // Cek permission create
        if (!TenantAccessHelper::hasPermission('ppdb', 'create')) {
            abort(403, 'Tidak memiliki permission untuk membuat data PPDB');
        }

        // Get module settings for validation
        $maxApplications = TenantAccessHelper::getModuleSetting('ppdb', 'max_applications', 1000);
        
        // Check if tenant has reached max applications
        $currentCount = 0; // Replace with actual count
        if ($currentCount >= $maxApplications) {
            return redirect()->back()
                ->withErrors(['error' => "Maksimal {$maxApplications} pendaftaran telah tercapai"]);
        }

        // Your PPDB store logic here
        // ...

        return redirect()->route('tenant.ppdb.index')
            ->with('success', 'Pendaftaran PPDB berhasil dibuat');
    }

    /**
     * Export PPDB with access control
     */
    public function ppdbExport(Request $request)
    {
        // Cek akses modul PPDB
        if (!TenantAccessHelper::hasModule('ppdb')) {
            abort(403, 'Akses ke modul PPDB tidak diizinkan untuk tenant Anda');
        }

        // Cek permission export
        if (!TenantAccessHelper::hasPermission('ppdb', 'export')) {
            abort(403, 'Tidak memiliki permission untuk export data PPDB');
        }

        // Cek fitur bulk export
        if (!TenantAccessHelper::hasFeature('bulk_export')) {
            abort(403, 'Fitur export bulk tidak tersedia untuk tenant Anda');
        }

        // Get feature settings
        $maxRecords = TenantAccessHelper::getFeatureSetting('bulk_export', 'max_records', 10000);
        $allowedFormats = TenantAccessHelper::getFeatureSetting('bulk_export', 'allowed_formats', ['xlsx', 'csv']);

        $format = $request->get('format', 'xlsx');
        if (!in_array($format, $allowedFormats)) {
            abort(400, "Format {$format} tidak diizinkan. Format yang diizinkan: " . implode(', ', $allowedFormats));
        }

        // Your export logic here
        // ...

        return response()->download($exportedFile);
    }

    /**
     * SPP Payment with online payment feature check
     */
    public function sppPayment(Request $request)
    {
        // Cek akses modul SPP
        if (!TenantAccessHelper::hasModule('spp')) {
            abort(403, 'Akses ke modul SPP tidak diizinkan untuk tenant Anda');
        }

        // Cek fitur pembayaran online
        if (!TenantAccessHelper::hasFeature('online_payment')) {
            return redirect()->back()
                ->withErrors(['error' => 'Fitur pembayaran online tidak tersedia. Silakan hubungi administrator.']);
        }

        // Get payment settings
        $paymentMethods = TenantAccessHelper::getFeatureSetting('online_payment', 'payment_methods', ['bank_transfer']);
        $feePercentage = TenantAccessHelper::getFeatureSetting('online_payment', 'fee_percentage', 2.5);

        // Your payment logic here
        // ...

        return view('tenant.spp.payment', compact('paymentMethods', 'feePercentage'));
    }

    /**
     * API Access with feature check
     */
    public function apiAccess(Request $request)
    {
        // Cek fitur API access
        if (!TenantAccessHelper::hasFeature('api_access')) {
            abort(403, 'Akses API tidak tersedia untuk tenant Anda');
        }

        // Get API settings
        $rateLimit = TenantAccessHelper::getFeatureSetting('api_access', 'rate_limit', 1000);
        $allowedEndpoints = TenantAccessHelper::getFeatureSetting('api_access', 'allowed_endpoints', ['*']);

        // Your API logic here
        // ...

        return response()->json([
            'rate_limit' => $rateLimit,
            'allowed_endpoints' => $allowedEndpoints,
            // ... other API data
        ]);
    }

    /**
     * Get tenant access summary for API
     */
    public function accessSummary()
    {
        $summary = TenantAccessHelper::getAccessSummary();
        
        return response()->json($summary);
    }

    /**
     * Check specific access
     */
    public function checkAccess(Request $request)
    {
        $type = $request->get('type'); // 'feature' or 'module'
        $key = $request->get('key');
        $permission = $request->get('permission'); // Optional for module permission

        if ($type === 'feature') {
            $hasAccess = TenantAccessHelper::hasFeature($key);
        } elseif ($type === 'module') {
            if ($permission) {
                $hasAccess = TenantAccessHelper::hasPermission($key, $permission);
            } else {
                $hasAccess = TenantAccessHelper::hasModule($key);
            }
        } else {
            return response()->json(['error' => 'Invalid type'], 400);
        }

        return response()->json([
            'type' => $type,
            'key' => $key,
            'permission' => $permission,
            'has_access' => $hasAccess,
        ]);
    }
}
