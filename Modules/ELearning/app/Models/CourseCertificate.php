<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseCertificate extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'enrollment_id',
        'course_id',
        'student_id',
        'instansi_id',
        'certificate_number',
        'certificate_file',
        'issued_at',
        'expires_at',
        'metadata',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function enrollment()
    {
        return $this->belongsTo(CourseEnrollment::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function student()
    {
        return $this->belongsTo(\App\Models\Tenant\Student::class);
    }

    // Helper methods
    public function generateCertificateNumber()
    {
        if (!$this->certificate_number) {
            $this->certificate_number = 'CERT-' . strtoupper(uniqid());
            $this->save();
        }
        return $this->certificate_number;
    }

    public function isExpired()
    {
        if (!$this->expires_at) return false;
        return now() > $this->expires_at;
    }
}

