<?php

namespace App\Exports;

use App\Models\Tenant\Teacher;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Teacher Export Class
 * 
 * Handles Excel export for Teacher data
 */
class TeacherExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $teachers;

    public function __construct($teachers)
    {
        $this->teachers = $teachers;
    }

    /**
     * Get collection of teachers
     */
    public function collection()
    {
        return $this->teachers;
    }

    /**
     * Define column headings
     */
    public function headings(): array
    {
        return [
            'Nama',
            'NUPTK',
            'NIP',
            'Email',
            'Telepon',
            'Alamat',
            'Tanggal Lahir',
            'Tempat Lahir',
            'Jenis Kelamin',
            'Agama',
            'Mata Pelajaran',
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
    public function map($teacher): array
    {
        return [
            $teacher->name,
            $teacher->nuptk,
            $teacher->nip,
            $teacher->email,
            $teacher->phone,
            $teacher->address,
            $teacher->birth_date ? $teacher->birth_date->format('d-m-Y') : null,
            $teacher->birth_place,
            $teacher->gender === 'L' ? 'Laki-laki' : 'Perempuan',
            $teacher->religion,
            $teacher->subject,
            $teacher->education_level,
            ucfirst($teacher->employment_status),
            $teacher->hire_date ? $teacher->hire_date->format('d-m-Y') : null,
            $teacher->salary ? number_format($teacher->salary, 0, ',', '.') : null,
            $teacher->is_active ? 'Aktif' : 'Tidak Aktif',
            $teacher->created_at->format('d-m-Y H:i:s'),
            $teacher->updated_at->format('d-m-Y H:i:s'),
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
            'B' => 15, // NUPTK
            'C' => 15, // NIP
            'D' => 25, // Email
            'E' => 15, // Telepon
            'F' => 30, // Alamat
            'G' => 15, // Tanggal Lahir
            'H' => 20, // Tempat Lahir
            'I' => 15, // Jenis Kelamin
            'J' => 15, // Agama
            'K' => 20, // Mata Pelajaran
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
