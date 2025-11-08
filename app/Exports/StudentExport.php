<?php

namespace App\Exports;

use App\Models\Tenant\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Student Export Class
 * 
 * Handles Excel export for Student data
 */
class StudentExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $students;

    public function __construct($students)
    {
        $this->students = $students;
    }

    /**
     * Get collection of students
     */
    public function collection()
    {
        return $this->students;
    }

    /**
     * Define column headings
     */
    public function headings(): array
    {
        return [
            'Nama',
            'NIS',
            'NISN',
            'Email',
            'Telepon',
            'Alamat',
            'Tanggal Lahir',
            'Tempat Lahir',
            'Jenis Kelamin',
            'Agama',
            'Kelas',
            'Tanggal Masuk',
            'Tanggal Lulus',
            'Status',
            'Nama Orang Tua',
            'Telepon Orang Tua',
            'Email Orang Tua',
            'Pekerjaan Orang Tua',
            'Golongan Darah',
            'Kebutuhan Khusus',
            'Deskripsi Kebutuhan Khusus',
            'Transportasi',
            'Status Aktif',
            'Dibuat',
            'Diperbarui',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($student): array
    {
        // Handle date formatting safely
        $birthDate = null;
        if ($student->birth_date) {
            try {
                $birthDate = is_string($student->birth_date) 
                    ? date('d-m-Y', strtotime($student->birth_date))
                    : $student->birth_date->format('d-m-Y');
            } catch (\Exception $e) {
                $birthDate = $student->birth_date;
            }
        }
        
        $enrollmentDate = null;
        if ($student->enrollment_date) {
            try {
                $enrollmentDate = is_string($student->enrollment_date) 
                    ? date('d-m-Y', strtotime($student->enrollment_date))
                    : $student->enrollment_date->format('d-m-Y');
            } catch (\Exception $e) {
                $enrollmentDate = $student->enrollment_date;
            }
        }
        
        $graduationDate = null;
        if ($student->graduation_date) {
            try {
                $graduationDate = is_string($student->graduation_date) 
                    ? date('d-m-Y', strtotime($student->graduation_date))
                    : $student->graduation_date->format('d-m-Y');
            } catch (\Exception $e) {
                $graduationDate = $student->graduation_date;
            }
        }
        
        return [
            $student->name ?? '',
            $student->student_number ?? $student->nis ?? '',
            $student->nisn ?? '',
            $student->email ?? '',
            $student->phone ?? '',
            $student->address ?? '',
            $birthDate,
            $student->birth_place ?? '',
            ($student->gender == 'L' || $student->gender == 'male') ? 'Laki-laki' : (($student->gender == 'P' || $student->gender == 'female') ? 'Perempuan' : ($student->gender ?? '')),
            $student->religion ?? '',
            $student->classRoom->name ?? ($student->class->name ?? ''),
            $enrollmentDate,
            $graduationDate,
            $student->student_status ?? ($student->status ?? ''),
            $student->parent_name ?? '',
            $student->parent_phone ?? '',
            $student->parent_email ?? '',
            $student->parent_occupation ?? '',
            $student->blood_type ?? '',
            isset($student->has_special_needs) ? ($student->has_special_needs ? 'Ya' : 'Tidak') : '',
            $student->special_needs_description ?? $student->disability_description ?? '',
            $student->transportation ?? '',
            $student->is_active ? 'Aktif' : 'Tidak Aktif',
            $student->created_at ? (is_string($student->created_at) ? $student->created_at : $student->created_at->format('d-m-Y H:i:s')) : '',
            $student->updated_at ? (is_string($student->updated_at) ? $student->updated_at : $student->updated_at->format('d-m-Y H:i:s')) : '',
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
            'B' => 15, // NIS
            'C' => 15, // NISN
            'D' => 25, // Email
            'E' => 15, // Telepon
            'F' => 30, // Alamat
            'G' => 15, // Tanggal Lahir
            'H' => 20, // Tempat Lahir
            'I' => 15, // Jenis Kelamin
            'J' => 15, // Agama
            'K' => 15, // Kelas
            'L' => 15, // Tanggal Masuk
            'M' => 15, // Tanggal Lulus
            'N' => 15, // Status
            'O' => 25, // Nama Orang Tua
            'P' => 15, // Telepon Orang Tua
            'Q' => 25, // Email Orang Tua
            'R' => 20, // Pekerjaan Orang Tua
            'S' => 15, // Golongan Darah
            'T' => 15, // Kebutuhan Khusus
            'U' => 30, // Deskripsi Kebutuhan Khusus
            'V' => 20, // Transportasi
            'W' => 15, // Status Aktif
            'X' => 20, // Dibuat
            'Y' => 20, // Diperbarui
        ];
    }

    /**
     * Register events
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->getDelegate()->getStyle('A1:Y1')
                    ->getAlignment()
                    ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            },
        ];
    }
}
