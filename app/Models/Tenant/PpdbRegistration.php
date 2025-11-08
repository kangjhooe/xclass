<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class PpdbRegistration extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'registration_number',
        'student_name',
        'student_nisn',
        'student_nik',
        'birth_place',
        'birth_date',
        'gender',
        'religion',
        'address',
        'phone',
        'email',
        'parent_name',
        'parent_phone',
        'parent_occupation',
        'parent_income',
        'previous_school',
        'previous_school_address',
        'registration_path',
        'status',
        'selection_score',
        'interview_score',
        'document_score',
        'total_score',
        'notes',
        'registration_date',
        'selection_date',
        'announcement_date',
        'accepted_date',
        'rejected_reason',
        'documents',
        'payment_status',
        'payment_date',
        'payment_amount',
        'payment_receipt',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'registration_date' => 'datetime',
        'selection_date' => 'datetime',
        'announcement_date' => 'datetime',
        'accepted_date' => 'datetime',
        'payment_date' => 'datetime',
        'documents' => 'array',
        'payment_status' => 'boolean',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_REGISTERED = 'registered';
    const STATUS_SELECTION = 'selection';
    const STATUS_ANNOUNCED = 'announced';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';
    const STATUS_CANCELLED = 'cancelled';

    const REGISTRATION_PATH_ZONASI = 'zonasi';
    const REGISTRATION_PATH_AFFIRMATIVE = 'affirmative';
    const REGISTRATION_PATH_TRANSFER = 'transfer';
    const REGISTRATION_PATH_ACHIEVEMENT = 'achievement';
    const REGISTRATION_PATH_ACADEMIC = 'academic';

    /**
     * Get the tenant that owns the registration
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the student if accepted
     */
    public function student()
    {
        return $this->hasOne(Student::class, 'ppdb_registration_id');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by registration path
     */
    public function scopeByPath($query, $path)
    {
        return $query->where('registration_path', $path);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu',
            self::STATUS_REGISTERED => 'Terdaftar',
            self::STATUS_SELECTION => 'Seleksi',
            self::STATUS_ANNOUNCED => 'Diumumkan',
            self::STATUS_ACCEPTED => 'Diterima',
            self::STATUS_REJECTED => 'Ditolak',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get registration path label
     */
    public function getPathLabelAttribute()
    {
        return match($this->registration_path) {
            self::REGISTRATION_PATH_ZONASI => 'Zonasi',
            self::REGISTRATION_PATH_AFFIRMATIVE => 'Afirmasi',
            self::REGISTRATION_PATH_TRANSFER => 'Pindahan',
            self::REGISTRATION_PATH_ACHIEVEMENT => 'Prestasi',
            self::REGISTRATION_PATH_ACADEMIC => 'Akademik',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Check if registration is accepted
     */
    public function isAccepted()
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    /**
     * Check if registration is rejected
     */
    public function isRejected()
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if payment is completed
     */
    public function isPaymentCompleted()
    {
        return $this->payment_status === true;
    }
}
