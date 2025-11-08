<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class PPDBConfiguration extends Model
{
    use HasFactory, HasInstansi;

    protected $table = 'ppdb_configurations';

    protected $fillable = [
        'instansi_id',
        'academic_year',
        'batch_name',
        'registration_start',
        'registration_end',
        'announcement_date',
        're_registration_start',
        're_registration_end',
        'available_majors',
        'admission_paths',
        'quotas',
        'is_active',
        'description',
        'max_applications',
        'selection_criteria',
        'required_documents',
        'registration_fee',
        'auto_approval',
        'notification_settings'
    ];

    protected $casts = [
        'registration_start' => 'date',
        'registration_end' => 'date',
        'announcement_date' => 'date',
        're_registration_start' => 'date',
        're_registration_end' => 'date',
        'available_majors' => 'array',
        'admission_paths' => 'array',
        'quotas' => 'array',
        'is_active' => 'boolean',
        'max_applications' => 'integer',
        'selection_criteria' => 'array',
        'required_documents' => 'array',
        'registration_fee' => 'decimal:2',
        'auto_approval' => 'boolean',
        'notification_settings' => 'array'
    ];

    public function getIsRegistrationOpenAttribute()
    {
        $now = now();
        return $now->between($this->registration_start, $this->registration_end);
    }

    public function getIsAnnouncementTimeAttribute()
    {
        return now() >= $this->announcement_date;
    }

    public function getIsReRegistrationOpenAttribute()
    {
        $now = now();
        return $now->between($this->re_registration_start, $this->re_registration_end);
    }

    public function getStatusAttribute()
    {
        if (!$this->is_active) {
            return 'Nonaktif';
        }

        $now = now();
        
        if ($now < $this->registration_start) {
            return 'Belum Dimulai';
        } elseif ($now->between($this->registration_start, $this->registration_end)) {
            return 'Pendaftaran Dibuka';
        } elseif ($now->between($this->registration_end, $this->announcement_date)) {
            return 'Pendaftaran Ditutup';
        } elseif ($now->between($this->announcement_date, $this->re_registration_start)) {
            return 'Pengumuman';
        } elseif ($now->between($this->re_registration_start, $this->re_registration_end)) {
            return 'Daftar Ulang';
        } else {
            return 'Selesai';
        }
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'Belum Dimulai' => 'secondary',
            'Pendaftaran Dibuka' => 'success',
            'Pendaftaran Ditutup' => 'warning',
            'Pengumuman' => 'info',
            'Daftar Ulang' => 'primary',
            'Selesai' => 'dark',
            'Nonaktif' => 'danger',
            default => 'secondary'
        };
    }

    // Scope untuk filter
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByAcademicYear($query, $academicYear)
    {
        return $query->where('academic_year', $academicYear);
    }

    public function scopeByBatch($query, $batch)
    {
        return $query->where('batch_name', $batch);
    }

    public function scopeRegistrationOpen($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where('registration_start', '<=', $now)
            ->where('registration_end', '>=', $now);
    }

    // Method untuk validasi konfigurasi
    public function validateConfiguration()
    {
        $errors = [];

        if ($this->registration_end <= $this->registration_start) {
            $errors[] = 'Tanggal selesai pendaftaran harus setelah tanggal mulai';
        }

        if ($this->announcement_date <= $this->registration_end) {
            $errors[] = 'Tanggal pengumuman harus setelah tanggal selesai pendaftaran';
        }

        if ($this->re_registration_start <= $this->announcement_date) {
            $errors[] = 'Tanggal mulai daftar ulang harus setelah tanggal pengumuman';
        }

        if ($this->re_registration_end <= $this->re_registration_start) {
            $errors[] = 'Tanggal selesai daftar ulang harus setelah tanggal mulai daftar ulang';
        }

        if (empty($this->available_majors)) {
            $errors[] = 'Minimal satu jurusan harus dipilih';
        }

        return $errors;
    }

    // Method untuk mendapatkan konfigurasi aktif
    public static function getActiveConfiguration()
    {
        return self::active()
            ->where('registration_start', '<=', now())
            ->where('registration_end', '>=', now())
            ->first();
    }
}
