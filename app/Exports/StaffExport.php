<?php

namespace App\Exports;

use App\Models\Tenant\Staff;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Staff Export Class
 * 
 * Handles Excel export for Staff data
 */
class StaffExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $staff;

    public function __construct($staff)
    {
        $this->staff = $staff;
    }

    /**
     * Get collection of staff
     */
    public function collection()
    {
        return $this->staff;
    }

    /**
     * Define column headings
     */
    public function headings(): array
    {
        return [
            'Nama',
            'NIP',
            'Email',
            'Telepon',
            'Alamat',
            'Tanggal Lahir',
            'Tempat Lahir',
            'Jenis Kelamin',
            'Agama',
            'Posisi',
            'Departemen',
            'Pendidikan',
            'Status Kepegawaian',
            'Tanggal Masuk',
            'Gaji',
            'Status Aktif',
            'Dibuat',
            'Diperbarui',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($staff): array
    {
        return [
            $staff->name,
            $staff->nip,
            $staff->email,
            $staff->phone,
            $staff->address,
            $staff->birth_date ? $staff->birth_date->format('d-m-Y') : null,
            $staff->birth_place,
            $staff->gender === 'L' ? 'Laki-laki' : 'Perempuan',
            $staff->religion,
            $staff->position,
            $staff->department,
            $staff->education_level,
            ucfirst($staff->employment_status),
            $staff->hire_date ? $staff->hire_date->format('d-m-Y') : null,
            $staff->salary ? number_format($staff->salary, 0, ',', '.') : null,
            $staff->is_active ? 'Aktif' : 'Tidak Aktif',
            $staff->created_at->format('d-m-Y H:i:s'),
            $staff->updated_at->format('d-m-Y H:i:s'),
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
            'A' => 25, // Nama
            'B' => 15, // NIP
            'C' => 25, // Email
            'D' => 15, // Telepon
            'E' => 30, // Alamat
            'F' => 15, // Tanggal Lahir
            'G' => 20, // Tempat Lahir
            'H' => 15, // Jenis Kelamin
            'I' => 15, // Agama
            'J' => 20, // Posisi
            'K' => 20, // Departemen
            'L' => 20, // Pendidikan
            'M' => 20, // Status Kepegawaian
            'N' => 15, // Tanggal Masuk
            'O' => 15, // Gaji
            'P' => 15, // Status Aktif
            'Q' => 20, // Dibuat
            'R' => 20, // Diperbarui
        ];
    }

    /**
     * Register events
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->getDelegate()->getStyle('A1:R1')
                    ->getAlignment()
                    ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            },
        ];
    }
}
