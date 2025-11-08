<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class LetterNumberSetting extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'jenis_surat',
        'format_nomor',
        'nomor_terakhir',
        'reset_tahunan',
        'kode_lembaga',
        'deskripsi',
        'created_by',
    ];

    protected $casts = [
        'reset_tahunan' => 'boolean',
    ];

    /**
     * Get the tenant that owns the setting
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the user who created the setting
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
     * Get formatted current number
     */
    public function getFormattedCurrentNumberAttribute()
    {
        $bulanRomawi = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];

        $replacements = [
            '{counter}' => str_pad($this->nomor_terakhir, 3, '0', STR_PAD_LEFT),
            '{bulan_romawi}' => $bulanRomawi[date('n')],
            '{tahun}' => date('Y'),
            '{bulan}' => date('m'),
            '{tanggal}' => date('d'),
            '{kode_lembaga}' => $this->kode_lembaga ?? 'SCH',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $this->format_nomor);
    }

    /**
     * Get next number
     */
    public function getNextNumberAttribute()
    {
        return $this->nomor_terakhir + 1;
    }

    /**
     * Get example format
     */
    public function getExampleFormatAttribute()
    {
        $bulanRomawi = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];

        $replacements = [
            '{counter}' => '001',
            '{bulan_romawi}' => $bulanRomawi[date('n')],
            '{tahun}' => date('Y'),
            '{bulan}' => date('m'),
            '{tanggal}' => date('d'),
            '{kode_lembaga}' => $this->kode_lembaga ?? 'SCH',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $this->format_nomor);
    }

    /**
     * Check if should reset annually
     */
    public function shouldResetAnnually()
    {
        return $this->reset_tahunan;
    }

    /**
     * Reset counter for new year
     */
    public function resetForNewYear()
    {
        if ($this->reset_tahunan) {
            $this->update(['nomor_terakhir' => 0]);
        }
    }

    /**
     * Get available format placeholders
     */
    public static function getAvailablePlaceholders()
    {
        return [
            '{counter}' => 'Nomor urut (001, 002, dst)',
            '{bulan_romawi}' => 'Bulan dalam angka romawi (I, II, III, dst)',
            '{tahun}' => 'Tahun 4 digit (2025)',
            '{bulan}' => 'Bulan 2 digit (01, 02, dst)',
            '{tanggal}' => 'Tanggal 2 digit (01, 02, dst)',
            '{kode_lembaga}' => 'Kode lembaga yang ditentukan',
        ];
    }

    /**
     * Validate format
     */
    public function validateFormat()
    {
        $placeholders = array_keys(self::getAvailablePlaceholders());
        $format = $this->format_nomor;
        
        // Check if format contains at least one valid placeholder
        foreach ($placeholders as $placeholder) {
            if (strpos($format, $placeholder) !== false) {
                return true;
            }
        }
        
        return false;
    }
}
