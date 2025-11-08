<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class IncomingLetter extends Model
{
    use HasFactory, HasInstansi, LogsActivity;

    protected $fillable = [
        'instansi_id',
        'nomor_surat',
        'tanggal_terima',
        'pengirim',
        'perihal',
        'lampiran',
        'file_path',
        'status',
        'catatan',
        'disposisi',
        'created_by',
        'updated_by',
        'jenis_surat',
        'prioritas',
        'sifat_surat',
        'isi_ringkas',
        'tindak_lanjut',
        'tanggal_disposisi',
        'penerima_disposisi',
    ];

    protected $casts = [
        'tanggal_terima' => 'date',
        'tanggal_disposisi' => 'date',
        'lampiran' => 'array',
        'disposisi' => 'array',
    ];

    const STATUS_BARU = 'baru';
    const STATUS_DIPROSES = 'diproses';
    const STATUS_SELESAI = 'selesai';

    const JENIS_SURAT_MASUK = 'Surat Masuk';
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
     * Get the user who last updated the letter
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_terima', [$startDate, $endDate]);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_BARU => 'Baru',
            self::STATUS_DIPROSES => 'Diproses',
            self::STATUS_SELESAI => 'Selesai',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_BARU => 'warning',
            self::STATUS_DIPROSES => 'info',
            self::STATUS_SELESAI => 'success',
            default => 'secondary'
        };
    }

    /**
     * Check if letter is new
     */
    public function isNew()
    {
        return $this->status === self::STATUS_BARU;
    }

    /**
     * Check if letter is processed
     */
    public function isProcessed()
    {
        return $this->status === self::STATUS_DIPROSES;
    }

    /**
     * Check if letter is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_SELESAI;
    }

    /**
     * Get formatted date
     */
    public function getFormattedTanggalTerimaAttribute()
    {
        return $this->tanggal_terima->format('d-m-Y');
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
     * Add disposition
     */
    public function addDisposition($penerima, $catatan, $tanggal = null)
    {
        $disposisi = $this->disposisi ?? [];
        $disposisi[] = [
            'penerima' => $penerima,
            'catatan' => $catatan,
            'tanggal' => $tanggal ?? now()->toDateString(),
            'created_at' => now()->toDateTimeString(),
        ];
        
        $this->update(['disposisi' => $disposisi]);
    }

    /**
     * Update status
     */
    public function updateStatus($status)
    {
        $this->update(['status' => $status]);
    }

    /**
     * Get jenis surat options
     */
    public static function getJenisSuratOptions()
    {
        return [
            self::JENIS_SURAT_MASUK => 'Surat Masuk',
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
            ->logOnly(['nomor_surat', 'tanggal_terima', 'pengirim', 'perihal', 'status', 'prioritas', 'sifat_surat'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent('created', 'Surat masuk baru dibuat')
            ->setDescriptionForEvent('updated', 'Surat masuk diperbarui')
            ->setDescriptionForEvent('deleted', 'Surat masuk dihapus');
    }

    /**
     * Get the file storage path for this tenant
     */
    public function getStoragePath()
    {
        return "tenants/{$this->instansi_id}/letters/incoming";
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
            return route('tenant.letters.incoming.download', $this);
        }
        return null;
    }

}
