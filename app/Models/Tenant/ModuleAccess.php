<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ModuleAccess extends Model
{
    use HasFactory, HasInstansi;

    protected $table = 'module_access';

    protected $fillable = [
        'instansi_id',
        'additional_duty_id',
        'module_code',
        'module_name',
        'permissions',
        'is_active',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the additional duty
     */
    public function additionalDuty()
    {
        return $this->belongsTo(AdditionalDuty::class);
    }

    /**
     * Check if has specific permission
     */
    public function hasPermission(string $permission): bool
    {
        $permissions = $this->permissions ?? [];
        return in_array($permission, $permissions) || in_array('*', $permissions);
    }

    /**
     * Scope for active accesses
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
