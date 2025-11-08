<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class GuestBook extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'visitor_name',
        'visitor_phone',
        'visitor_email',
        'visitor_organization',
        'visitor_address',
        'photo_path',
        'purpose',
        'purpose_description',
        'person_to_meet',
        'department',
        'visit_date',
        'visit_time',
        'check_in_time',
        'check_out_time',
        'status',
        'notes',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'visit_time' => 'datetime:H:i',
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
    ];

    const PURPOSE_MEETING = 'meeting';
    const PURPOSE_CONSULTATION = 'consultation';
    const PURPOSE_INSPECTION = 'inspection';
    const PURPOSE_OTHER = 'other';

    const STATUS_CHECKED_IN = 'checked_in';
    const STATUS_CHECKED_OUT = 'checked_out';
    const STATUS_CANCELLED = 'cancelled';

    public function getPurposeLabelAttribute()
    {
        return match($this->purpose) {
            self::PURPOSE_MEETING => 'Rapat',
            self::PURPOSE_CONSULTATION => 'Konsultasi',
            self::PURPOSE_INSPECTION => 'Inspeksi',
            self::PURPOSE_OTHER => 'Lainnya',
            default => 'Tidak Diketahui'
        };
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_CHECKED_IN => 'Masuk',
            self::STATUS_CHECKED_OUT => 'Keluar',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_CHECKED_IN => 'success',
            self::STATUS_CHECKED_OUT => 'info',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary'
        };
    }

    public function getPurposeOptions()
    {
        return [
            self::PURPOSE_MEETING => 'Rapat',
            self::PURPOSE_CONSULTATION => 'Konsultasi',
            self::PURPOSE_INSPECTION => 'Inspeksi',
            self::PURPOSE_OTHER => 'Lainnya',
        ];
    }

    public function getStatusOptions()
    {
        return [
            self::STATUS_CHECKED_IN => 'Masuk',
            self::STATUS_CHECKED_OUT => 'Keluar',
            self::STATUS_CANCELLED => 'Dibatalkan',
        ];
    }

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk filter berdasarkan tanggal
     */
    public function scopeByDateRange($query, $dateFrom, $dateTo)
    {
        if ($dateFrom) {
            $query->whereDate('visit_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('visit_date', '<=', $dateTo);
        }
        return $query;
    }

    /**
     * Scope untuk pencarian
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('visitor_name', 'like', "%{$search}%")
              ->orWhere('visitor_organization', 'like', "%{$search}%")
              ->orWhere('person_to_meet', 'like', "%{$search}%")
              ->orWhere('visitor_phone', 'like', "%{$search}%");
        });
    }
}
