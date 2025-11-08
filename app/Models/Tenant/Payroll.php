<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payroll extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'instansi_id',
        'employee_id',
        'employee_type',
        'payroll_date',
        'basic_salary',
        'total_allowances',
        'total_deductions',
        'net_salary',
        'status',
        'notes',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'payroll_date' => 'date',
        'basic_salary' => 'decimal:2',
        'total_allowances' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_PAID = 'paid';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant (instansi) for this payroll
     */
    public function instansi()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the employee for this payroll
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }

    /**
     * Get teacher for this payroll (if employee_type is teacher)
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'employee_id')->where('instansi_id', $this->instansi_id);
    }

    /**
     * Get staff for this payroll (if employee_type is staff)
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class, 'employee_id')->where('instansi_id', $this->instansi_id);
    }

    /**
     * Get the employee/teacher/staff polymorphic relationship
     */
    public function employeeRecord()
    {
        switch ($this->employee_type) {
            case 'teacher':
                return $this->teacher();
            case 'staff':
                return $this->staff();
            default:
                return $this->employee();
        }
    }

    /**
     * Get employee name based on employee_type
     */
    public function getEmployeeNameAttribute()
    {
        switch ($this->employee_type) {
            case 'teacher':
                if ($this->relationLoaded('teacher') && $this->teacher) {
                    return $this->teacher->name;
                }
                $teacher = Teacher::where('id', $this->employee_id)
                    ->where('instansi_id', $this->instansi_id)
                    ->first();
                return $teacher ? $teacher->name : null;
                
            case 'staff':
                if ($this->relationLoaded('staff') && $this->staff) {
                    return $this->staff->name;
                }
                $staff = Staff::where('id', $this->employee_id)
                    ->where('instansi_id', $this->instansi_id)
                    ->first();
                return $staff ? $staff->name : null;
                
            default: // employee
                if ($this->relationLoaded('employee') && $this->employee) {
                    return $this->employee->name;
                }
                $employee = Employee::withTrashed()->find($this->employee_id);
                return ($employee && $employee->instansi_id == $this->instansi_id) ? $employee->name : null;
        }
    }

    /**
     * Get employee number based on employee_type
     */
    public function getEmployeeNumberAttribute()
    {
        switch ($this->employee_type) {
            case 'teacher':
                if ($this->relationLoaded('teacher') && $this->teacher) {
                    return $this->teacher->employee_number ?? $this->teacher->nip ?? $this->teacher->nuptk ?? $this->teacher->nik ?? null;
                }
                $teacher = Teacher::where('id', $this->employee_id)
                    ->where('instansi_id', $this->instansi_id)
                    ->first();
                return $teacher ? ($teacher->employee_number ?? $teacher->nip ?? $teacher->nuptk ?? $teacher->nik ?? null) : null;
                
            case 'staff':
                if ($this->relationLoaded('staff') && $this->staff) {
                    return $this->staff->employee_number ?? $this->staff->nik ?? $this->staff->nip ?? null;
                }
                $staff = Staff::where('id', $this->employee_id)
                    ->where('instansi_id', $this->instansi_id)
                    ->first();
                return $staff ? ($staff->employee_number ?? $staff->nik ?? $staff->nip ?? null) : null;
                
            default: // employee
                if ($this->relationLoaded('employee') && $this->employee) {
                    return $this->employee->employee_number;
                }
                $employee = Employee::withTrashed()->find($this->employee_id);
                return ($employee && $employee->instansi_id == $this->instansi_id) ? $employee->employee_number : null;
        }
    }

    /**
     * Get payroll items for this payroll
     */
    public function items()
    {
        return $this->hasMany(PayrollItem::class);
    }

    /**
     * Get allowance items for this payroll
     */
    public function allowances()
    {
        return $this->hasMany(PayrollItem::class)->where('type', 'allowance');
    }

    /**
     * Get deduction items for this payroll
     */
    public function deductions()
    {
        return $this->hasMany(PayrollItem::class)->where('type', 'deduction');
    }

    /**
     * Get the user who created this payroll
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the user who last updated this payroll
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Scope for payrolls by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for payrolls by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payroll_date', [$startDate, $endDate]);
    }

    /**
     * Scope for payrolls by employee
     */
    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu',
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_PAID => 'Dibayar',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'bg-warning',
            self::STATUS_APPROVED => 'bg-info',
            self::STATUS_PAID => 'bg-success',
            self::STATUS_CANCELLED => 'bg-danger',
            default => 'bg-secondary'
        };
    }
}
