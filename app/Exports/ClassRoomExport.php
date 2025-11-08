<?php

namespace App\Exports;

use App\Models\Tenant\ClassRoom;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * ClassRoom Export Class
 * 
 * Handles Excel export for ClassRoom data
 */
class ClassRoomExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $classRooms;

    public function __construct($classRooms)
    {
        $this->classRooms = $classRooms;
    }

    /**
     * Get collection of class rooms
     */
    public function collection()
    {
        return $this->classRooms;
    }

    /**
     * Define column headings
     */
    public function headings(): array
    {
        return [
            'Nama Kelas',
            'Kode Kelas',
            'Jenjang',
            'Tipe',
            'Kapasitas',
            'Deskripsi',
            'Gedung',
            'Lantai',
            'Nomor Ruang',
            'Wali Kelas',
            'Tahun Akademik',
            'Peralatan',
            'Status',
            'Tersedia',
            'Perlu Perawatan',
            'Status Aktif',
            'Jumlah Siswa',
            'Dibuat',
            'Diperbarui',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($classRoom): array
    {
        return [
            $classRoom->name,
            $classRoom->code,
            $classRoom->level,
            $classRoom->type,
            $classRoom->capacity,
            $classRoom->description,
            $classRoom->building,
            $classRoom->floor,
            $classRoom->room_number,
            $classRoom->teacher->name ?? null,
            $classRoom->academic_year,
            $classRoom->equipment,
            ucfirst($classRoom->status),
            $classRoom->is_available ? 'Ya' : 'Tidak',
            $classRoom->needs_maintenance ? 'Ya' : 'Tidak',
            $classRoom->is_active ? 'Aktif' : 'Tidak Aktif',
            $classRoom->students->count(),
            $classRoom->created_at->format('d-m-Y H:i:s'),
            $classRoom->updated_at->format('d-m-Y H:i:s'),
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
            'A' => 20, // Nama Kelas
            'B' => 15, // Kode Kelas
            'C' => 15, // Jenjang
            'D' => 15, // Tipe
            'E' => 10, // Kapasitas
            'F' => 30, // Deskripsi
            'G' => 15, // Gedung
            'H' => 10, // Lantai
            'I' => 15, // Nomor Ruang
            'J' => 25, // Wali Kelas
            'K' => 15, // Tahun Akademik
            'L' => 30, // Peralatan
            'M' => 15, // Status
            'N' => 10, // Tersedia
            'O' => 15, // Perlu Perawatan
            'P' => 15, // Status Aktif
            'Q' => 15, // Jumlah Siswa
            'R' => 20, // Dibuat
            'S' => 20, // Diperbarui
        ];
    }

    /**
     * Register events
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->getDelegate()->getStyle('A1:S1')
                    ->getAlignment()
                    ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            },
        ];
    }
}
