<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;

class Tenant extends Model
{
    use HasFactory, HasNpsn;

    protected $fillable = [
        'npsn',
        'name',
        'type_tenant',
        'jenjang',
        'email',
        'phone',
        'address',
        'city',
        'province',
        'postal_code',
        'website',
        'custom_domain',
        'logo',
        'favicon',
        'is_active',
        'subscription_plan',
        'subscription_expires_at',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'subscription_expires_at' => 'datetime',
        'settings' => 'array',
    ];

    /**
     * Get users for this tenant
     */
    public function users()
    {
        return $this->hasMany(\App\Models\User::class, 'instansi_id');
    }

    /**
     * Get students for this tenant
     */
    public function students()
    {
        return $this->hasMany(\App\Models\Tenant\Student::class, 'instansi_id');
    }

    /**
     * Get teachers for this tenant
     */
    public function teachers()
    {
        return $this->hasMany(\App\Models\Tenant\Teacher::class, 'instansi_id');
    }

    /**
     * Get classes for this tenant
     */
    public function classes()
    {
        return $this->hasMany(\App\Models\Tenant\ClassRoom::class, 'instansi_id');
    }

    /**
     * Get subjects for this tenant
     */
    public function subjects()
    {
        return $this->hasMany(\App\Models\Tenant\Subject::class, 'instansi_id');
    }

    /**
     * Get features for this tenant
     */
    public function features()
    {
        return $this->hasMany(TenantFeaturePivot::class, 'tenant_id');
    }

    /**
     * Get modules for this tenant
     */
    public function modules()
    {
        return $this->hasMany(\App\Models\Core\TenantModule::class);
    }

    /**
     * Get subscription for this tenant
     */
    public function subscription()
    {
        return $this->hasOne(\App\Models\TenantSubscription::class);
    }

    /**
     * Check if tenant is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if subscription is valid
     */
    public function hasValidSubscription(): bool
    {
        if (!$this->subscription_expires_at) {
            return false;
        }

        return $this->subscription_expires_at->isFuture();
    }

    /**
     * Get tenant domain
     */
    public function getDomainAttribute(): string
    {
        return $this->npsn . '.' . config('tenant.domain.main');
    }

    /**
     * Get tenant admin URL
     */
    public function getAdminUrlAttribute(): string
    {
        return 'https://' . $this->domain;
    }

    /**
     * Check if tenant has access to specific feature
     */
    public function hasFeature(string $featureKey): bool
    {
        return \Illuminate\Support\Facades\DB::table('tenant_feature_pivot')
            ->where('tenant_id', $this->id)
            ->where('feature_name', $featureKey)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Check if tenant has access to specific module
     */
    public function hasModule(string $moduleKey): bool
    {
        return $this->modules()
            ->where('module_key', $moduleKey)
            ->active()
            ->exists();
    }

    /**
     * Check if tenant has specific permission for module
     */
    public function hasModulePermission(string $moduleKey, string $permission): bool
    {
        $module = $this->modules()
            ->where('module_key', $moduleKey)
            ->active()
            ->first();

        return $module ? $module->hasPermission($permission) : false;
    }

    /**
     * Get active features for this tenant
     */
    public function getActiveFeatures()
    {
        return $this->features()->where('is_active', true)->get();
    }

    /**
     * Get active modules for this tenant
     */
    public function getActiveModules()
    {
        return $this->modules()->active()->get();
    }

    /**
     * Get onboarding steps for this tenant
     */
    public function onboardingSteps()
    {
        return $this->hasMany(TenantOnboardingStep::class);
    }

    /**
     * Get resource limits for this tenant
     */
    public function resourceLimit()
    {
        return $this->hasOne(TenantResourceLimit::class);
    }

    /**
     * Get activity logs for this tenant
     */
    public function activityLogs()
    {
        return $this->hasMany(TenantActivityLog::class);
    }

    /**
     * Get health monitoring for this tenant
     */
    public function healthMonitoring()
    {
        return $this->hasOne(TenantHealthMonitoring::class);
    }

    /**
     * Get the route key for the model (use NPSN instead of ID)
     */
    public function getRouteKeyName()
    {
        return 'npsn';
    }

    /**
     * Retrieve the model for route model binding
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $field = $field ?: $this->getRouteKeyName();
        
        // Try to find by NPSN first
        $tenant = static::where($field, $value)->first();
        
        if ($tenant) {
            return $tenant;
        }
        
        // If not found and value is numeric, try ID as fallback (for backward compatibility)
        if (is_numeric($value) && $field === 'npsn') {
            $tenant = static::where('id', $value)->first();
            if ($tenant) {
                return $tenant;
            }
        }
        
        throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
            "Tenant dengan {$field} '{$value}' tidak ditemukan"
        );
    }
}
