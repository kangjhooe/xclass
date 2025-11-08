<?php

namespace App\Core\Services;

use App\Models\Core\Tenant;
use Illuminate\Support\Facades\Cache;

class TenantService
{
    protected $currentTenant;

    /**
     * Set current tenant
     */
    public function setCurrentTenant(Tenant $tenant): void
    {
        $this->currentTenant = $tenant;
        
        // Cache tenant untuk performa
        Cache::put('current_tenant', $tenant, config('tenant.cache.ttl'));
    }

    /**
     * Get current tenant
     */
    public function getCurrentTenant(): ?Tenant
    {
        if ($this->currentTenant) {
            return $this->currentTenant;
        }

        // Coba ambil dari cache
        $this->currentTenant = Cache::get('current_tenant');
        
        return $this->currentTenant;
    }

    /**
     * Get tenant by NPSN
     */
    public function getTenantByNpsn(string $npsn): ?Tenant
    {
        return Cache::remember(
            "tenant_{$npsn}",
            config('tenant.cache.ttl'),
            fn() => Tenant::where('npsn', $npsn)
                ->where('is_active', true)
                ->first()
        );
    }

    /**
     * Check if current user belongs to current tenant
     */
    public function userBelongsToTenant($user): bool
    {
        $tenant = $this->getCurrentTenant();
        
        if (!$tenant || !$user) {
            return false;
        }

        return $user->instansi_id === $tenant->id;
    }

    /**
     * Get tenant database prefix
     */
    public function getTenantPrefix(): string
    {
        $tenant = $this->getCurrentTenant();
        
        if (!$tenant) {
            return '';
        }

        return 'tenant_' . $tenant->npsn . '_';
    }

    /**
     * Clear tenant cache
     */
    public function clearTenantCache(): void
    {
        Cache::forget('current_tenant');
        
        if ($this->currentTenant) {
            Cache::forget("tenant_{$this->currentTenant->npsn}");
        }
    }
}
