<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class PPDBApplication extends Model
{
    use HasFactory, HasInstansi;
    
    protected $table = 'ppdb_applications';

    protected $fillable = [
        'user_id',
        'instansi_id',
        'registration_number',
        'full_name',
        'email',
        'phone',
        'birth_date',
        'birth_place',
        'gender',
        'address',
        'previous_school',
        'previous_school_address',
        'major_choice',
        'parent_name',
        'parent_phone',
        'parent_occupation',
        'parent_income',
        'status',
        'notes',
        'photo_path',
        'ijazah_path',
        'kk_path',
        'academic_year',
        'batch',
        'registration_path',
        'selection_score',
        'interview_score',
        'document_score',
        'total_score',
        'registration_date',
        'selection_date',
        'announcement_date',
        'accepted_date',
        'rejected_reason',
        'documents',
        'payment_status',
        'payment_date',
        'payment_amount',
        'payment_receipt'
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
        'documents_status' => 'array',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_REGISTERED = 'registered';
    const STATUS_SELECTION = 'selection';
    const STATUS_ANNOUNCED = 'announced';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';
    const STATUS_CANCELLED = 'cancelled';

    // Registration path constants
    const REGISTRATION_PATH_ZONASI = 'zonasi';
    const REGISTRATION_PATH_AFFIRMATIVE = 'affirmative';
    const REGISTRATION_PATH_TRANSFER = 'transfer';
    const REGISTRATION_PATH_ACHIEVEMENT = 'achievement';
    const REGISTRATION_PATH_ACADEMIC = 'academic';

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

    public function getGenderLabelAttribute()
    {
        return match($this->gender) {
            'L', 'male' => 'Laki-laki',
            'P', 'female' => 'Perempuan',
            default => 'Tidak Diketahui'
        };
    }

    public function getRegistrationPathLabelAttribute()
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

    public function getPaymentStatusLabelAttribute()
    {
        return $this->payment_status ? 'Lunas' : 'Belum Lunas';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function profile()
    {
        return $this->hasOne(PPDBProfile::class, 'ppdb_application_id');
    }

    // Scope untuk filter berdasarkan status
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeByAcademicYear($query, $academicYear)
    {
        return $query->where('academic_year', $academicYear);
    }

    public function scopeByBatch($query, $batch)
    {
        return $query->where('batch', $batch);
    }

    public function scopeByMajor($query, $major)
    {
        return $query->where('major_choice', $major);
    }

    // Method untuk generate nomor pendaftaran
    public static function generateRegistrationNumber($academicYear, $batch)
    {
        $prefix = 'PPDB';
        $year = substr($academicYear, 0, 4);
        $batchCode = strtoupper(substr($batch, 0, 3));
        
        $lastNumber = self::where('academic_year', $academicYear)
            ->where('batch', $batch)
            ->count();
        
        $sequence = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}{$year}{$batchCode}{$sequence}";
    }

    // Method untuk update status dengan log
    public function updateStatus($status, $notes = null)
    {
        $this->update([
            'status' => $status,
            'notes' => $notes,
            'updated_at' => now()
        ]);

        // Log status change
        if ($status === self::STATUS_ACCEPTED) {
            $this->update(['accepted_date' => now()]);
        }
    }
}
