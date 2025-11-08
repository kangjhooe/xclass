<?php

namespace App\Models;

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
        'is_active',
        'deskripsi',
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
     * Scope for active templates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for templates by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get available variables for this template
     */
    public function getAvailableVariables()
    {
        // Extract variables from template content
        preg_match_all('/\{([^}]+)\}/', $this->isi_template, $matches);
        return array_unique($matches[1] ?? []);
    }

    /**
     * Process template with variables
     */
    public function processTemplate($variables = [])
    {
        $content = $this->isi_template;
        
        // Add default variables
        $defaultVariables = [
            'tanggal' => now()->format('d-m-Y'),
            'tahun' => now()->year,
            'bulan' => now()->format('F'),
            'hari' => now()->format('l'),
            'nama_sekolah' => $this->tenant->name ?? 'Nama Sekolah',
            'alamat_sekolah' => $this->tenant->address ?? 'Alamat Sekolah',
        ];

        // Merge with provided variables
        $allVariables = array_merge($defaultVariables, $variables);

        // Replace variables in content
        foreach ($allVariables as $key => $value) {
            $content = str_replace('{' . $key . '}', $value, $content);
        }

        return $content;
    }

    /**
     * Get template categories
     */
    public static function getCategories()
    {
        return [
            'akademik' => 'Akademik',
            'kepegawaian' => 'Kepegawaian',
            'administrasi' => 'Administrasi',
            'kesiswaan' => 'Kesiswaan',
            'umum' => 'Umum',
        ];
    }

    /**
     * Get default variables available for all templates
     */
    public static function getDefaultVariables()
    {
        return [
            'tanggal' => 'Tanggal saat ini (DD-MM-YYYY)',
            'tahun' => 'Tahun saat ini',
            'bulan' => 'Bulan saat ini (nama bulan)',
            'hari' => 'Hari saat ini (nama hari)',
            'nama_sekolah' => 'Nama sekolah/instansi',
            'alamat_sekolah' => 'Alamat sekolah/instansi',
            'nama_siswa' => 'Nama siswa',
            'kelas' => 'Kelas siswa',
            'nomor_surat' => 'Nomor surat',
            'perihal' => 'Perihal surat',
            'tujuan' => 'Tujuan surat',
            'pengirim' => 'Pengirim surat',
        ];
    }
}
