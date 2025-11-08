<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class Staff extends Model
{
    use HasFactory, HasNpsn, HasAuditLog, HasInstansi;

    protected $fillable = [
        'npsn',
        'name',
        'email',
        'phone',
        'address',
        'birth_date',
        'birth_place',
        'gender',
        'religion',
        'employee_number',
        'nip',
        'nik',
        'position',
        'department',
        'education_level',
        'employment_status',
        'hire_date',
        'salary',
        'is_active',
        'instansi_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant (instansi) for this staff
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the institution for this staff
     */
    public function institution()
    {
        return $this->belongsTo(Institution::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Scope for active staff
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for staff by position
     */
    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    /**
     * Scope for staff by department
     */
    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    /**
     * Get employment status label
     */
    public function getEmploymentStatusLabelAttribute()
    {
        $statuses = [
            'permanent' => 'Pegawai Tetap',
            'contract' => 'Kontrak',
            'honorary' => 'Honorer',
            'intern' => 'Magang',
            'resigned' => 'Keluar',
        ];

        return $statuses[$this->employment_status] ?? 'Tidak Diketahui';
    }

    /**
     * Get employment status color
     */
    public function getEmploymentStatusColorAttribute()
    {
        $colors = [
            'permanent' => 'success',
            'contract' => 'info',
            'honorary' => 'warning',
            'intern' => 'secondary',
            'resigned' => 'danger',
        ];

        return $colors[$this->employment_status] ?? 'secondary';
    }

    /**
     * Get the route key for the model (use NIK instead of ID)
     */
    public function getRouteKeyName()
    {
        return 'nik';
    }

    /**
     * Get the value of the model's route key (NIK, fallback to ID if NIK is null)
     */
    public function getRouteKey()
    {
        $key = $this->getRouteKeyName();
        $value = $this->getAttribute($key);
        
        // If NIK is null or empty, fallback to ID for backward compatibility
        if ($key === 'nik' && (is_null($value) || $value === '')) {
            return $this->getAttribute($this->getKeyName());
        }
        
        return $value;
    }

    /**
     * Retrieve the model for route model binding
     * Use NIK as route key and ensure tenant scope
     */
    public function resolveRouteBinding($value, $field = null)
    {
        // Use NIK as default field for route binding
        $field = $field ?: $this->getRouteKeyName();
        
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
        
        if (!$tenant) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel(static::class, [$value]);
        }
        
        // Use newModelQuery to avoid global scopes issues during route binding
        $query = static::newModelQuery();
        
        // Apply field filter
        $query->where($field, $value);
        
        // Apply tenant scope
        $query->where('instansi_id', $tenant->id);
        
        // Return model instance
        $model = $query->first();
        
        if (!$model) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel(static::class, [$value]);
        }
        
        return $model;
    }
}
