<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Core\Tenant;
use App\Services\TenantResourceLimitService;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class TenantResourceLimitController extends Controller
{
    protected TenantResourceLimitService $resourceLimitService;

    public function __construct(TenantResourceLimitService $resourceLimitService)
    {
        $this->resourceLimitService = $resourceLimitService;
    }

    /**
     * Show resource limits for tenant
     */
    public function show(Tenant $tenant): View
    {
        $limit = $tenant->resourceLimit;
        
        if (!$limit) {
            $limit = $this->resourceLimitService->initializeLimits($tenant);
        } else {
            // Update current usage
            $this->resourceLimitService->updateUsage($tenant);
            $limit->refresh();
        }

        return view('admin.tenants.resource-limits', compact('tenant', 'limit'));
    }

    /**
     * Update resource limits
     */
    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $request->validate([
            'max_storage_mb' => 'required|integer|min:0',
            'max_users' => 'required|integer|min:0',
            'max_students' => 'nullable|integer|min:0',
            'api_rate_limit_per_minute' => 'required|integer|min:1',
            'api_rate_limit_per_hour' => 'required|integer|min:1',
            'max_database_size_mb' => 'required|integer|min:0',
        ]);

        $limit = $tenant->resourceLimit;
        
        if (!$limit) {
            $limit = $this->resourceLimitService->initializeLimits($tenant);
        }

        $limit->update($request->only([
            'max_storage_mb',
            'max_users',
            'max_students',
            'api_rate_limit_per_minute',
            'api_rate_limit_per_hour',
            'max_database_size_mb',
        ]));

        return redirect()->back()
            ->with('success', 'Resource limits berhasil diperbarui');
    }

    /**
     * Refresh resource usage
     */
    public function refresh(Tenant $tenant): RedirectResponse
    {
        $this->resourceLimitService->updateUsage($tenant);

        return redirect()->back()
            ->with('success', 'Resource usage berhasil diperbarui');
    }
}

