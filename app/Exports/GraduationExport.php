<?php

namespace App\Exports;

use App\Models\Tenant\Graduation;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Graduation Export Class
 * 
 * Handles Excel export for Graduation data
 */
class GraduationExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $graduations;

    public function __construct($graduations)
    {
        $this->graduations = $graduations;
    }

    /**
     * Get collection of graduations
     */
    public function collection()
    {
        return $this->graduations;
    }

    /**
     * Define column headings
     */
    public function headings(): array
    {
        return [
            'Nama Siswa',
            'NIS',
            'NISN',
            'Tahun Lulus',
            'Tanggal Lulus',
            'Nilai Akhir',
            'IPK',
            'Peringkat',
            'Prestasi',
            'Nomor Sertifikat',
            'Status',
            'Tanggal Wisuda',
            'Tempat Wisuda',
            'Catatan',
            'Dibuat Oleh',
            'Dibuat',
            'Diperbarui',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($graduation): array
    {
        $achievements = '';
        if ($graduation->achievements && is_array($graduation->achievements)) {
            $achievements = implode(', ', $graduation->achievements);
        }

        $graduationDate = '';
        if ($graduation->graduation_date) {
            try {
                if (is_string($graduation->graduation_date)) {
                    $date = \Carbon\Carbon::parse($graduation->graduation_date);
                    $graduationDate = $date->format('d-m-Y');
                } elseif (is_object($graduation->graduation_date)) {
                    $graduationDate = $graduation->graduation_date->format('d-m-Y');
                }
            } catch (\Exception $e) {
                $graduationDate = '';
            }
        }

        $ceremonyDate = '';
        if ($graduation->graduation_ceremony_date) {
            try {
                if (is_string($graduation->graduation_ceremony_date)) {
                    $date = \Carbon\Carbon::parse($graduation->graduation_ceremony_date);
                    $ceremonyDate = $date->format('d-m-Y');
                } elseif (is_object($graduation->graduation_ceremony_date)) {
                    $ceremonyDate = $graduation->graduation_ceremony_date->format('d-m-Y');
                }
            } catch (\Exception $e) {
                $ceremonyDate = '';
            }
        }

        return [
            $graduation->student->name ?? '',
            $graduation->student->student_number ?? $graduation->student->nis ?? '',
            $graduation->student->nisn ?? '',
            $graduation->graduation_year ?? '',
            $graduationDate,
            $graduation->final_grade ? number_format($graduation->final_grade, 2, ',', '.') : '',
            $graduation->gpa ? number_format($graduation->gpa, 2, ',', '.') : '',
            $graduation->rank ? "Peringkat ke-{$graduation->rank}" : '',
            $achievements,
            $graduation->certificate_number ?? '',
            $graduation->status_label ?? ucfirst($graduation->status ?? ''),
            $ceremonyDate,
            $graduation->graduation_ceremony_venue ?? '',
            $graduation->notes ?? '',
            $graduation->creator->name ?? '',
            $graduation->created_at ? (is_string($graduation->created_at) ? date('d-m-Y H:i:s', strtotime($graduation->created_at)) : $graduation->created_at->format('d-m-Y H:i:s')) : '',
            $graduation->updated_at ? (is_string($graduation->updated_at) ? date('d-m-Y H:i:s', strtotime($graduation->updated_at)) : $graduation->updated_at->format('d-m-Y H:i:s')) : '',
        ];
    }

    /**
     * Apply styles to the worksheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Header row
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '366092'],
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }

    /**
     * Set column widths
     */
    public function columnWidths(): array
    {
        return [
            'A' => 25, // Nama Siswa
            'B' => 15, // NIS
            'C' => 15, // NISN
            'D' => 12, // Tahun Lulus
            'E' => 15, // Tanggal Lulus
            'F' => 12, // Nilai Akhir
            'G' => 10, // IPK
            'H' => 15, // Peringkat
            'I' => 30, // Prestasi
            'J' => 20, // Nomor Sertifikat
            'K' => 15, // Status
            'L' => 15, // Tanggal Wisuda
            'M' => 30, // Tempat Wisuda
            'N' => 40, // Catatan
            'O' => 20, // Dibuat Oleh
            'P' => 20, // Dibuat
            'Q' => 20, // Diperbarui
        ];
    }

    /**
     * Register events
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->getDelegate()->getStyle('A1:Q1')
                    ->getAlignment()
                    ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            },
        ];
    }
}
