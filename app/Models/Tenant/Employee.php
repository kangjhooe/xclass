<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'instansi_id',
        'name',
        'employee_number',
        'email',
        'phone',
        'address',
        'position_id',
        'department_id',
        'hire_date',
        'salary',
        'status',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get the tenant (instansi) for this employee
     */
    public function instansi()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the position for this employee
     */
    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * Get the department for this employee
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get payrolls for this employee
     */
    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    /**
     * Get the user who created this employee
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the user who last updated this employee
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Scope for active employees
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for employees by department
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope for employees by position
     */
    public function scopeByPosition($query, $positionId)
    {
        return $query->where('position_id', $positionId);
    }
}
