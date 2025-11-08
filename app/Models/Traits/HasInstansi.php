<?php

namespace App\Models\Traits;

use App\Models\Core\Tenant;

trait HasInstansi
{
    /**
     * Automatically scope queries by current tenant and set default instansi_id on create
     */
    public static function bootHasInstansi()
    {
        static::addGlobalScope('instansi', function ($builder) {
            $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
            if ($tenant) {
                $builder->where('instansi_id', $tenant->id);
            }
        });

        static::creating(function ($model) {
            if (empty($model->instansi_id)) {
                $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
                if ($tenant) {
                    $model->instansi_id = $tenant->id;
                }
            }
        });
    }

    /**
     * Get the tenant that owns the model
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'instansi_id');
    }

    /**
     * Scope a query to only include models for the given tenant
     */
    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('instansi_id', $tenantId);
    }

    /**
     * Scope a query to only include models for the current tenant
     */
    public function scopeForCurrentTenant($query)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        if ($tenant) {
            return $query->where('instansi_id', $tenant->id);
        }
        return $query;
    }
}
