<?php

namespace App\Exports;

use App\Models\Tenant\Institution;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Institution Export Class
 * 
 * Handles Excel export for Institution data
 */
class InstitutionExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $institutions;

    public function __construct($institutions)
    {
        $this->institutions = $institutions;
    }

    /**
     * Get collection of institutions
     */
    public function collection()
    {
        return $this->institutions;
    }

    /**
     * Define column headings
     */
    public function headings(): array
    {
        return [
            'NPSN',
            'Nama Lembaga',
            'Tipe',
            'Alamat',
            'Telepon',
            'Email',
            'Website',
            'Kepala Sekolah',
            'Telepon Kepala',
            'Email Kepala',
            'Status Akreditasi',
            'Nomor Akreditasi',
            'Tanggal Akreditasi',
            'Status Aktif',
            'Dibuat',
            'Diperbarui',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($institution): array
    {
        return [
            $institution->npsn,
            $institution->name,
            ucfirst($institution->type),
            $institution->address,
            $institution->phone,
            $institution->email,
            $institution->website,
            $institution->headmaster_name,
            $institution->headmaster_phone,
            $institution->headmaster_email,
            $institution->accreditation_status,
            $institution->accreditation_number,
            $institution->accreditation_date ? $institution->accreditation_date->format('d-m-Y') : null,
            $institution->is_active ? 'Aktif' : 'Tidak Aktif',
            $institution->created_at->format('d-m-Y H:i:s'),
            $institution->updated_at->format('d-m-Y H:i:s'),
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
            'A' => 15, // NPSN
            'B' => 30, // Nama Lembaga
            'C' => 15, // Tipe
            'D' => 40, // Alamat
            'E' => 20, // Telepon
            'F' => 25, // Email
            'G' => 25, // Website
            'H' => 25, // Kepala Sekolah
            'I' => 20, // Telepon Kepala
            'J' => 25, // Email Kepala
            'K' => 20, // Status Akreditasi
            'L' => 20, // Nomor Akreditasi
            'M' => 20, // Tanggal Akreditasi
            'N' => 15, // Status Aktif
            'O' => 20, // Dibuat
            'P' => 20, // Diperbarui
        ];
    }

    /**
     * Register events
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->getDelegate()->getStyle('A1:P1')
                    ->getAlignment()
                    ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            },
        ];
    }
}
