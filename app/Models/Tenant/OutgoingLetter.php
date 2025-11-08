<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class OutgoingLetter extends Model
{
    use HasFactory, HasInstansi, LogsActivity;

    protected $fillable = [
        'instansi_id',
        'nomor_surat',
        'tanggal_surat',
        'jenis_surat',
        'tujuan',
        'perihal',
        'isi_surat',
        'file_path',
        'status',
        'created_by',
        'updated_by',
        'prioritas',
        'sifat_surat',
        'isi_ringkas',
        'tindak_lanjut',
        'tanggal_kirim',
        'pengirim',
        'lampiran',
    ];

    protected $casts = [
        'tanggal_surat' => 'date',
        'tanggal_kirim' => 'date',
        'lampiran' => 'array',
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_MENUNGGU_TTD = 'menunggu_ttd';
    const STATUS_TERKIRIM = 'terkirim';
    const STATUS_ARSIP = 'arsip';

    const JENIS_SURAT_KELUAR = 'Surat Keluar';
    const JENIS_SURAT_KEPUTUSAN = 'Surat Keputusan';
    const JENIS_SURAT_TUGAS = 'Surat Tugas';
    const JENIS_SURAT_UNDANGAN = 'Surat Undangan';
    const JENIS_SURAT_KETERANGAN = 'Surat Keterangan';
    const JENIS_SURAT_LAINNYA = 'Surat Lainnya';

    const PRIORITAS_RENDAH = 'rendah';
    const PRIORITAS_SEDANG = 'sedang';
    const PRIORITAS_TINGGI = 'tinggi';
    const PRIORITAS_SANGAT_TINGGI = 'sangat_tinggi';

    const SIFAT_BIASA = 'biasa';
    const SIFAT_SEGERA = 'segera';
    const SIFAT_SANGAT_SEGERA = 'sangat_segera';

    /**
     * Get the tenant that owns the letter
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the user who created the letter
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by jenis surat
     */
    public function scopeByJenisSurat($query, $jenisSurat)
    {
        return $query->where('jenis_surat', $jenisSurat);
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_surat', [$startDate, $endDate]);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_MENUNGGU_TTD => 'Menunggu TTD',
            self::STATUS_TERKIRIM => 'Terkirim',
            self::STATUS_ARSIP => 'Arsip',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'secondary',
            self::STATUS_MENUNGGU_TTD => 'warning',
            self::STATUS_TERKIRIM => 'success',
            self::STATUS_ARSIP => 'info',
            default => 'secondary'
        };
    }

    /**
     * Check if letter is draft
     */
    public function isDraft()
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Check if letter is waiting for signature
     */
    public function isWaitingForSignature()
    {
        return $this->status === self::STATUS_MENUNGGU_TTD;
    }

    /**
     * Check if letter is sent
     */
    public function isSent()
    {
        return $this->status === self::STATUS_TERKIRIM;
    }

    /**
     * Check if letter is archived
     */
    public function isArchived()
    {
        return $this->status === self::STATUS_ARSIP;
    }

    /**
     * Get formatted date
     */
    public function getFormattedTanggalSuratAttribute()
    {
        return $this->tanggal_surat->format('d-m-Y');
    }

    /**
     * Get file URL
     */
    public function getFileUrlAttribute()
    {
        if ($this->file_path) {
            return asset('storage/' . $this->file_path);
        }
        return null;
    }

    /**
     * Get file name
     */
    public function getFileNameAttribute()
    {
        if ($this->file_path) {
            return basename($this->file_path);
        }
        return null;
    }

    /**
     * Generate nomor surat otomatis menggunakan LetterNumberSetting
     */
    public function generateNomorSurat()
    {
        $setting = \App\Models\LetterNumberSetting::where('instansi_id', $this->instansi_id)->first();
        
        if (!$setting) {
            // Create default setting if not exists
            $setting = \App\Models\LetterNumberSetting::create([
                'instansi_id' => $this->instansi_id,
                'format_nomor' => '{{NOMOR}}/{{INSTITUSI}}/{{BULAN_ROMAWI}}/{{TAHUN}}',
                'institusi_code' => $this->tenant->code ?? 'SCH',
            ]);
        }

        return $setting->generateNextNumber();
    }

    /**
     * Update status
     */
    public function updateStatus($status)
    {
        $this->update(['status' => $status]);
    }

    /**
     * Archive letter
     */
    public function archive()
    {
        $this->update(['status' => self::STATUS_ARSIP]);
    }

    /**
     * Get the user who last updated the letter
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Get jenis surat options
     */
    public static function getJenisSuratOptions()
    {
        return [
            self::JENIS_SURAT_KELUAR => 'Surat Keluar',
            self::JENIS_SURAT_KEPUTUSAN => 'Surat Keputusan',
            self::JENIS_SURAT_TUGAS => 'Surat Tugas',
            self::JENIS_SURAT_UNDANGAN => 'Surat Undangan',
            self::JENIS_SURAT_KETERANGAN => 'Surat Keterangan',
            self::JENIS_SURAT_LAINNYA => 'Surat Lainnya',
        ];
    }

    /**
     * Get prioritas options
     */
    public static function getPrioritasOptions()
    {
        return [
            self::PRIORITAS_RENDAH => 'Rendah',
            self::PRIORITAS_SEDANG => 'Sedang',
            self::PRIORITAS_TINGGI => 'Tinggi',
            self::PRIORITAS_SANGAT_TINGGI => 'Sangat Tinggi',
        ];
    }

    /**
     * Get sifat surat options
     */
    public static function getSifatSuratOptions()
    {
        return [
            self::SIFAT_BIASA => 'Biasa',
            self::SIFAT_SEGERA => 'Segera',
            self::SIFAT_SANGAT_SEGERA => 'Sangat Segera',
        ];
    }

    /**
     * Get prioritas label
     */
    public function getPrioritasLabelAttribute()
    {
        return match($this->prioritas) {
            self::PRIORITAS_RENDAH => 'Rendah',
            self::PRIORITAS_SEDANG => 'Sedang',
            self::PRIORITAS_TINGGI => 'Tinggi',
            self::PRIORITAS_SANGAT_TINGGI => 'Sangat Tinggi',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get sifat surat label
     */
    public function getSifatSuratLabelAttribute()
    {
        return match($this->sifat_surat) {
            self::SIFAT_BIASA => 'Biasa',
            self::SIFAT_SEGERA => 'Segera',
            self::SIFAT_SANGAT_SEGERA => 'Sangat Segera',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get prioritas color for display
     */
    public function getPrioritasColorAttribute()
    {
        return match($this->prioritas) {
            self::PRIORITAS_RENDAH => 'success',
            self::PRIORITAS_SEDANG => 'warning',
            self::PRIORITAS_TINGGI => 'danger',
            self::PRIORITAS_SANGAT_TINGGI => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Get sifat surat color for display
     */
    public function getSifatSuratColorAttribute()
    {
        return match($this->sifat_surat) {
            self::SIFAT_BIASA => 'secondary',
            self::SIFAT_SEGERA => 'warning',
            self::SIFAT_SANGAT_SEGERA => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Get activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nomor_surat', 'tanggal_surat', 'jenis_surat', 'tujuan', 'perihal', 'status', 'prioritas', 'sifat_surat'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent('created', 'Surat keluar baru dibuat')
            ->setDescriptionForEvent('updated', 'Surat keluar diperbarui')
            ->setDescriptionForEvent('deleted', 'Surat keluar dihapus');
    }

    /**
     * Get the file storage path for this tenant
     */
    public function getStoragePath()
    {
        return "tenants/{$this->instansi_id}/letters/outgoing";
    }

    /**
     * Get full file path
     */
    public function getFullFilePath()
    {
        if ($this->file_path) {
            return storage_path('app/' . $this->getStoragePath() . '/' . $this->file_path);
        }
        return null;
    }

    /**
     * Get file URL for download
     */
    public function getDownloadUrl()
    {
        if ($this->file_path) {
            return route('tenant.letters.outgoing.download', $this);
        }
        return null;
    }

    /**
     * Generate QR Code for letter validation
     */
    public function generateQRCode()
    {
        $data = [
            'nomor_surat' => $this->nomor_surat,
            'tanggal_surat' => $this->tanggal_surat->format('Y-m-d'),
            'tujuan' => $this->tujuan,
            'perihal' => $this->perihal,
            'instansi_id' => $this->instansi_id,
        ];
        
        return base64_encode(json_encode($data));
    }

}
