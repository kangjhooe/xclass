<?php

namespace App\Exports;

use App\Models\Tenant\StudentGrade;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Student Grade Export Class
 * 
 * Handles Excel export for Student Grade data
 */
class StudentGradeExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $grades;

    public function __construct($grades)
    {
        $this->grades = $grades;
    }

    /**
     * Get collection of grades
     */
    public function collection()
    {
        return $this->grades;
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
            'Kelas',
            'Mata Pelajaran',
            'Guru',
            'Tahun Akademik',
            'Semester',
            'Jenis Penilaian',
            'Nama Penilaian',
            'Nilai',
            'Nilai Maksimal',
            'Bobot',
            'Nilai Akhir',
            'Persentase',
            'Status',
            'Catatan',
            'Dibuat',
            'Diperbarui',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($grade): array
    {
        $percentage = '';
        if ($grade->max_score > 0 && $grade->score !== null) {
            $percentage = round(($grade->score / $grade->max_score) * 100, 2) . '%';
        }

        $assignmentType = match($grade->assignment_type) {
            'tugas' => 'Tugas',
            'uts' => 'UTS',
            'uas' => 'UAS',
            'quiz' => 'Kuis',
            'project' => 'Proyek',
            default => ucfirst($grade->assignment_type ?? ''),
        };

        return [
            $grade->student->name ?? '',
            $grade->student->student_number ?? $grade->student->nis ?? '',
            $grade->student->nisn ?? '',
            $grade->student->classRoom->name ?? ($grade->student->class->name ?? ''),
            $grade->subject->name ?? '',
            $grade->teacher->name ?? '',
            $grade->academicYear->year_name ?? ($grade->academicYear->year ?? ''),
            $grade->semester == 1 ? 'Semester 1' : 'Semester 2',
            $assignmentType,
            $grade->assignment_name ?? '',
            $grade->score ? number_format($grade->score, 2, ',', '.') : '',
            $grade->max_score ? number_format($grade->max_score, 2, ',', '.') : '',
            $grade->weight ? number_format($grade->weight, 2, ',', '.') : '',
            $grade->final_score ? number_format($grade->final_score, 2, ',', '.') : '',
            $percentage,
            $grade->is_passed ? 'Lulus' : 'Tidak Lulus',
            $grade->notes ?? '',
            $grade->created_at ? (is_string($grade->created_at) ? date('d-m-Y H:i:s', strtotime($grade->created_at)) : $grade->created_at->format('d-m-Y H:i:s')) : '',
            $grade->updated_at ? (is_string($grade->updated_at) ? date('d-m-Y H:i:s', strtotime($grade->updated_at)) : $grade->updated_at->format('d-m-Y H:i:s')) : '',
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
            'D' => 15, // Kelas
            'E' => 20, // Mata Pelajaran
            'F' => 25, // Guru
            'G' => 15, // Tahun Akademik
            'H' => 15, // Semester
            'I' => 15, // Jenis Penilaian
            'J' => 25, // Nama Penilaian
            'K' => 12, // Nilai
            'L' => 15, // Nilai Maksimal
            'M' => 12, // Bobot
            'N' => 12, // Nilai Akhir
            'O' => 12, // Persentase
            'P' => 15, // Status
            'Q' => 30, // Catatan
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
