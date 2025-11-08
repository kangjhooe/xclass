<?php

namespace App\Models;

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
        'nomor_terakhir' => 'integer',
    ];

    /**
     * Get the tenant that owns the setting
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Generate next letter number
     */
    public function generateNextNumber()
    {
        $currentYear = now()->year;
        $currentMonth = now()->month;
        
        // Check if we need to reset yearly
        if ($this->reset_tahunan) {
            $lastResetYear = $this->updated_at->year;
            if ($lastResetYear < $currentYear) {
                $this->nomor_terakhir = 0;
            }
        }

        $this->nomor_terakhir++;
        $this->save();

        return $this->formatNumber($this->nomor_terakhir, $currentYear, $currentMonth);
    }

    /**
     * Format the number according to the format_nomor
     */
    public function formatNumber($number, $year, $month)
    {
        $format = $this->format_nomor;
        
        // Pad number with zeros (3 digits)
        $paddedNumber = str_pad($number, 3, '0', STR_PAD_LEFT);
        
        // Roman month mapping
        $romanMonths = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];
        
        $replacements = [
            '{{NOMOR}}' => $paddedNumber,
            '{{INSTITUSI}}' => $this->kode_lembaga ?? 'INST',
            '{{BULAN_ROMAWI}}' => $romanMonths[$month] ?? 'I',
            '{{TAHUN}}' => $year,
            '{{PREFIX}}' => '',
            '{{SUFFIX}}' => '',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $format);
    }

    /**
     * Preview number without incrementing
     */
    public function previewNumber()
    {
        $currentYear = now()->year;
        $currentMonth = now()->month;
        $nextNumber = $this->nomor_terakhir + 1;
        
        return $this->formatNumber($nextNumber, $currentYear, $currentMonth);
    }
}
