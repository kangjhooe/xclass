<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SuperAdminTenantAccess;
use App\Core\Services\TenantService;
use Illuminate\Support\Facades\Auth;
use App\Helpers\AuditHelper;

class SuperAdminAccessController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Display list of access requests from super admins
     */
    public function index()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        // Only school_admin can manage access requests
        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini');
        }

        $requests = SuperAdminTenantAccess::where('tenant_id', $tenant->id)
            ->with(['user', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'pending' => SuperAdminTenantAccess::where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->count(),
            'approved' => SuperAdminTenantAccess::where('tenant_id', $tenant->id)
                ->where('status', 'approved')
                ->where(function($q) {
                    $q->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
                })
                ->count(),
        ];

        return view('tenant.super-admin-access.index', compact('requests', 'stats'));
    }

    /**
     * Show access request details
     */
    public function show(SuperAdminTenantAccess $access)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini');
        }

        if ($access->tenant_id !== $tenant->id) {
            abort(404, 'Akses tidak ditemukan');
        }

        $access->load(['user', 'approver', 'tenant']);

        return view('tenant.super-admin-access.show', compact('access'));
    }

    /**
     * Approve access request
     */
    public function approve(Request $request, SuperAdminTenantAccess $access)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk melakukan aksi ini');
        }

        if ($access->tenant_id !== $tenant->id) {
            abort(404, 'Akses tidak ditemukan');
        }

        if ($access->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Permintaan ini sudah diproses sebelumnya');
        }

        $validated = $request->validate([
            'response_message' => 'nullable|string|max:1000',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $access->update([
            'status' => 'approved',
            'response_message' => $validated['response_message'] ?? null,
            'approved_by' => $user->id,
            'approved_at' => now(),
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        AuditHelper::info('Super admin access approved', [
            'access_id' => $access->id,
            'tenant_id' => $tenant->id,
            'approved_by' => $user->id,
        ]);

        return redirect()->route('tenant.super-admin-access.index')
            ->with('success', 'Akses super admin telah disetujui');
    }

    /**
     * Reject access request
     */
    public function reject(Request $request, SuperAdminTenantAccess $access)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk melakukan aksi ini');
        }

        if ($access->tenant_id !== $tenant->id) {
            abort(404, 'Akses tidak ditemukan');
        }

        if ($access->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Permintaan ini sudah diproses sebelumnya');
        }

        $validated = $request->validate([
            'response_message' => 'required|string|max:1000',
        ]);

        $access->update([
            'status' => 'rejected',
            'response_message' => $validated['response_message'],
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        AuditHelper::info('Super admin access rejected', [
            'access_id' => $access->id,
            'tenant_id' => $tenant->id,
            'rejected_by' => $user->id,
        ]);

        return redirect()->route('tenant.super-admin-access.index')
            ->with('success', 'Permintaan akses telah ditolak');
    }

    /**
     * Revoke access
     */
    public function revoke(SuperAdminTenantAccess $access)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = Auth::user();

        if ($user->role !== 'school_admin' || $user->instansi_id !== $tenant->id) {
            abort(403, 'Anda tidak memiliki izin untuk melakukan aksi ini');
        }

        if ($access->tenant_id !== $tenant->id) {
            abort(404, 'Akses tidak ditemukan');
        }

        if ($access->status !== 'approved') {
            return redirect()->back()
                ->with('error', 'Hanya akses yang sudah disetujui yang dapat dicabut');
        }

        $access->update([
            'status' => 'revoked',
        ]);

        AuditHelper::info('Super admin access revoked', [
            'access_id' => $access->id,
            'tenant_id' => $tenant->id,
            'revoked_by' => $user->id,
        ]);

        return redirect()->route('tenant.super-admin-access.index')
            ->with('success', 'Akses super admin telah dicabut');
    }
}