<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class AdditionalDuty extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'code',
        'name',
        'description',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get teachers with this additional duty
     */
    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_additional_duties')
                    ->withPivot('assigned_date', 'end_date', 'is_active', 'notes')
                    ->withTimestamps();
    }

    /**
     * Get active teachers with this duty
     */
    public function activeTeachers()
    {
        return $this->teachers()->wherePivot('is_active', true);
    }

    /**
     * Get module accesses for this duty
     */
    public function moduleAccesses()
    {
        return $this->hasMany(ModuleAccess::class, 'additional_duty_id')->where('module_access.is_active', true);
    }

    /**
     * Get active module accesses
     */
    public function activeModuleAccesses()
    {
        return $this->hasMany(ModuleAccess::class, 'additional_duty_id')
                    ->where('is_active', true);
    }

    /**
     * Check if this duty has access to a module
     */
    public function hasModuleAccess(string $moduleCode): bool
    {
        return $this->activeModuleAccesses()
            ->where('module_code', $moduleCode)
            ->exists();
    }

    /**
     * Get permissions for a module
     */
    public function getModulePermissions(string $moduleCode): array
    {
        $moduleAccess = $this->activeModuleAccesses()
            ->where('module_code', $moduleCode)
            ->first();

        return $moduleAccess ? ($moduleAccess->permissions ?? []) : [];
    }

    /**
     * Scope for active duties
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered by order field
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    /**
     * Retrieve the model for route model binding
     * Override to ensure tenant scope is applied correctly
     */
    public function resolveRouteBinding($value, $field = null)
    {
        // Get field name - default to primary key
        if ($field === null) {
            $field = $this->getRouteKeyName();
        }
        
        // Get tenant service
        $tenantService = app(\App\Core\Services\TenantService::class);
        $tenant = $tenantService->getCurrentTenant();
        
        // If tenant not found in service, try to get from route
        if (!$tenant) {
            try {
                $request = app('request');
                if ($request) {
                    $tenantParam = $request->route('tenant');
                    if ($tenantParam) {
                        $tenant = $tenantService->getTenantByNpsn($tenantParam);
                        if ($tenant) {
                            $tenantService->setCurrentTenant($tenant);
                        }
                    }
                }
            } catch (\Exception $e) {
                // Ignore errors during tenant resolution
            }
        }
        
        // Build query - use newModelQuery to avoid global scopes issues
        $query = $this->newModelQuery();
        
        // Apply field filter
        $query->where($field, $value);
        
        // Apply tenant scope
        if ($tenant) {
            $query->where('instansi_id', $tenant->id);
        }
        
        // Return model instance
        $model = $query->first();
        
        if (!$model) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel(get_class($this), [$value]);
        }
        
        return $model;
    }
}
