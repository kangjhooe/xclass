<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Core\Tenant;
use App\Services\TenantHealthMonitoringService;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class TenantHealthMonitoringController extends Controller
{
    protected TenantHealthMonitoringService $healthMonitoringService;

    public function __construct(TenantHealthMonitoringService $healthMonitoringService)
    {
        $this->healthMonitoringService = $healthMonitoringService;
    }

    /**
     * Show health monitoring for tenant
     */
    public function show(Tenant $tenant): View
    {
        $monitoring = $tenant->healthMonitoring;
        
        if (!$monitoring) {
            $monitoring = $this->healthMonitoringService->initializeMonitoring($tenant);
        } else {
            // Update health metrics
            $this->healthMonitoringService->updateHealthMetrics($tenant);
            $monitoring->refresh();
        }

        return view('admin.tenants.health-monitoring', compact('tenant', 'monitoring'));
    }

    /**
     * Refresh health metrics
     */
    public function refresh(Tenant $tenant): RedirectResponse
    {
        $this->healthMonitoringService->updateHealthMetrics($tenant);

        return redirect()->back()
            ->with('success', 'Health metrics berhasil diperbarui');
    }

    /**
     * Clear alerts
     */
    public function clearAlerts(Tenant $tenant): RedirectResponse
    {
        $monitoring = $tenant->healthMonitoring;
        
        if ($monitoring) {
            $monitoring->clearAlerts();
        }

        return redirect()->back()
            ->with('success', 'Alerts berhasil dihapus');
    }

    /**
     * Show all tenants health status
     */
    public function index(): View
    {
        $healthStatuses = $this->healthMonitoringService->getAllTenantsHealth();

        return view('admin.tenants.health-index', compact('healthStatuses'));
    }

    /**
     * Check all tenants health
     */
    public function checkAll(): RedirectResponse
    {
        $this->healthMonitoringService->checkAllTenants();

        return redirect()->back()
            ->with('success', 'Health check untuk semua tenant selesai');
    }
}

