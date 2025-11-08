<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class LetterTemplate extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'nama_template',
        'jenis_surat',
        'isi_template',
        'deskripsi',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant that owns the template
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the user who created the template
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Scope for filtering by jenis surat
     */
    public function scopeByJenisSurat($query, $jenisSurat)
    {
        return $query->where('jenis_surat', $jenisSurat);
    }

    /**
     * Scope for active templates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if template is active
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Process template with variables
     */
    public function processTemplate($variables = [])
    {
        $content = $this->isi_template;
        
        // Default variables
        $defaultVariables = [
            '{tanggal}' => now()->format('d-m-Y'),
            '{tahun}' => date('Y'),
            '{bulan}' => date('m'),
            '{hari}' => date('d'),
        ];

        // Merge with provided variables
        $allVariables = array_merge($defaultVariables, $variables);

        // Replace variables in template
        foreach ($allVariables as $key => $value) {
            $content = str_replace($key, $value, $content);
        }

        return $content;
    }

    /**
     * Get available variables for this template
     */
    public function getAvailableVariablesAttribute()
    {
        return [
            '{tanggal}' => 'Tanggal saat ini (d-m-Y)',
            '{tahun}' => 'Tahun saat ini',
            '{bulan}' => 'Bulan saat ini',
            '{hari}' => 'Hari saat ini',
            '{nama_siswa}' => 'Nama siswa',
            '{kelas}' => 'Kelas siswa',
            '{nomor_surat}' => 'Nomor surat',
            '{perihal}' => 'Perihal surat',
            '{tujuan}' => 'Tujuan surat',
            '{nama_sekolah}' => 'Nama sekolah',
            '{alamat_sekolah}' => 'Alamat sekolah',
        ];
    }

    /**
     * Activate template
     */
    public function activate()
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Deactivate template
     */
    public function deactivate()
    {
        $this->update(['is_active' => false]);
    }
}
