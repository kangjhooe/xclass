<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class Institution extends Model
{
    use HasFactory, HasNpsn, HasAuditLog, HasInstansi;

    protected $fillable = [
        'npsn',
        'name',
        'type',
        'address',
        'phone',
        'email',
        'website',
        'headmaster_name',
        'headmaster_phone',
        'headmaster_email',
        'accreditation_status',
        'accreditation_number',
        'accreditation_date',
        'logo',
        'is_active',
        'instansi_id',
    ];

    protected $casts = [
        'accreditation_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant (instansi) for this institution
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get teachers for this institution
     */
    public function teachers()
    {
        return $this->hasMany(Teacher::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Get students for this institution
     */
    public function students()
    {
        return $this->hasMany(Student::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Get staff for this institution
     */
    public function staff()
    {
        return $this->hasMany(Staff::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Get classes for this institution
     */
    public function classes()
    {
        return $this->hasMany(ClassRoom::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Get class rooms for this institution (alias for classes)
     */
    public function classRooms()
    {
        return $this->classes();
    }

    /**
     * Get subjects for this institution
     */
    public function subjects()
    {
        return $this->hasMany(Subject::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Get exams for this institution
     */
    public function exams()
    {
        return $this->hasMany(Exam::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Scope for active institutions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get accreditation status label
     */
    public function getAccreditationStatusLabelAttribute()
    {
        $statuses = [
            'A' => 'Terakreditasi A',
            'B' => 'Terakreditasi B',
            'C' => 'Terakreditasi C',
            'D' => 'Terakreditasi D',
            'pending' => 'Dalam Proses',
            'expired' => 'Kadaluarsa',
        ];

        return $statuses[$this->accreditation_status] ?? 'Belum Terakreditasi';
    }

    /**
     * Get accreditation status color
     */
    public function getAccreditationStatusColorAttribute()
    {
        $colors = [
            'A' => 'success',
            'B' => 'info',
            'C' => 'warning',
            'D' => 'danger',
            'pending' => 'secondary',
            'expired' => 'danger',
        ];

        return $colors[$this->accreditation_status] ?? 'secondary';
    }
}
