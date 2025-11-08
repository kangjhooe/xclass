<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Core\Tenant;
use App\Models\SuperAdminTenantAccess;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use App\Helpers\AuditHelper;

class SuperAdminAccessController extends Controller
{
    /**
     * Display list of tenants for super admin to access
     */
    public function index()
    {
        Gate::authorize('bypass-tenant-scope');

        $user = Auth::user();
        
        // Get all tenants
        $tenants = Tenant::where('is_active', true)
            ->orderBy('name')
            ->get();

        // Get access status for each tenant
        $accesses = SuperAdminTenantAccess::where('user_id', $user->id)
            ->get()
            ->keyBy('tenant_id');

        // Get approved accesses for quick access
        $approvedAccesses = SuperAdminTenantAccess::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->with('tenant')
            ->get();

        return view('admin.super-admin-access.index', compact('tenants', 'accesses', 'approvedAccesses'));
    }

    /**
     * Request access to a tenant
     */
    public function requestAccess(Request $request, Tenant $tenant)
    {
        Gate::authorize('bypass-tenant-scope');

        $user = Auth::user();

        // Check if already has access request
        $existing = SuperAdminTenantAccess::where('user_id', $user->id)
            ->where('tenant_id', $tenant->id)
            ->first();

        if ($existing) {
            if ($existing->status === 'approved' && $existing->isActive()) {
                return redirect()->route('admin.super-admin-access.index')
                    ->with('info', 'Anda sudah memiliki akses ke tenant ini');
            }
            
            if ($existing->status === 'pending') {
                return redirect()->route('admin.super-admin-access.index')
                    ->with('info', 'Permintaan akses Anda masih menunggu persetujuan');
            }
        }

        $validated = $request->validate([
            'request_reason' => 'required|string|max:1000',
        ]);

        $access = SuperAdminTenantAccess::updateOrCreate(
            [
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ],
            [
                'status' => 'pending',
                'request_reason' => $validated['request_reason'],
                'expires_at' => null,
            ]
        );

        AuditHelper::info('Super admin requested tenant access', [
            'user_id' => $user->id,
            'tenant_id' => $tenant->id,
            'access_id' => $access->id,
        ]);

        return redirect()->route('admin.super-admin-access.index')
            ->with('success', 'Permintaan akses telah dikirim. Menunggu persetujuan dari admin tenant.');
    }

    /**
     * Show form to request access
     */
    public function showRequestForm(Tenant $tenant)
    {
        Gate::authorize('bypass-tenant-scope');

        $user = Auth::user();
        $existing = SuperAdminTenantAccess::where('user_id', $user->id)
            ->where('tenant_id', $tenant->id)
            ->first();

        return view('admin.super-admin-access.request', compact('tenant', 'existing'));
    }

    /**
     * Access tenant with approved permission
     */
    public function accessTenant(Tenant $tenant)
    {
        Gate::authorize('bypass-tenant-scope');

        $user = Auth::user();

        $access = SuperAdminTenantAccess::where('user_id', $user->id)
            ->where('tenant_id', $tenant->id)
            ->where('status', 'approved')
            ->first();

        if (!$access || !$access->isActive()) {
            return redirect()->route('admin.super-admin-access.index')
                ->with('error', 'Anda tidak memiliki akses ke tenant ini atau akses telah kedaluwarsa');
        }

        // Redirect to tenant dashboard
        // Set tenant context for the session
        session(['current_tenant_id' => $tenant->id]);
        session(['current_tenant_npsn' => $tenant->npsn]);
        
        // Redirect to tenant dashboard using tenant NPSN
        return redirect()->to('/' . $tenant->npsn . '/dashboard');
    }

    /**
     * Get my access requests
     */
    public function myRequests()
    {
        Gate::authorize('bypass-tenant-scope');

        $user = Auth::user();
        $requests = SuperAdminTenantAccess::where('user_id', $user->id)
            ->with(['tenant', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.super-admin-access.requests', compact('requests'));
    }
}