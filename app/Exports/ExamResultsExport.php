<?php

namespace App\Exports;

use App\Models\Tenant\ExamAttempt;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ExamResultsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $exam;
    protected $attempts;

    public function __construct($exam, $attempts = null)
    {
        $this->exam = $exam;
        $this->attempts = $attempts ?? $exam->attempts()->with(['student', 'answers.question'])->get();
    }

    public function collection()
    {
        return $this->attempts;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Siswa',
            'NIS',
            'Kelas',
            'Nilai',
            'Persentase (%)',
            'Nilai Huruf',
            'Status',
            'Jawaban Benar',
            'Jawaban Salah',
            'Total Soal',
            'Waktu Pengerjaan',
            'Tanggal Mulai',
            'Tanggal Selesai',
            'IP Address',
            'Status Attempt'
        ];
    }

    public function map($attempt): array
    {
        return [
            $attempt->id,
            $attempt->student->name,
            $attempt->student->nis ?? '-',
            $attempt->exam->classRoom->name,
            $attempt->score,
            $attempt->percentage_score,
            $attempt->grade,
            $attempt->isPassed() ? 'Lulus' : 'Tidak Lulus',
            $attempt->correct_answers,
            $attempt->total_questions - $attempt->correct_answers,
            $attempt->total_questions,
            $attempt->formatted_time_spent,
            $attempt->started_at->format('d-m-Y H:i:s'),
            $attempt->submitted_at ? $attempt->submitted_at->format('d-m-Y H:i:s') : '-',
            $attempt->ip_address ?? '-',
            $attempt->status_label
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,   // No
            'B' => 25,  // Nama Siswa
            'C' => 15,  // NIS
            'D' => 15,  // Kelas
            'E' => 10,  // Nilai
            'F' => 15,  // Persentase
            'G' => 12,  // Nilai Huruf
            'H' => 15,  // Status
            'I' => 15,  // Jawaban Benar
            'J' => 15,  // Jawaban Salah
            'K' => 12,  // Total Soal
            'L' => 18,  // Waktu Pengerjaan
            'M' => 20,  // Tanggal Mulai
            'N' => 20,  // Tanggal Selesai
            'O' => 15,  // IP Address
            'P' => 15,  // Status Attempt
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Header row
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2E86AB']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ],
            // Data rows
            'A:P' => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ]
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Add exam information at the top
                $sheet->insertNewRowBefore(1, 5);
                
                $sheet->setCellValue('A1', 'LAPORAN HASIL UJIAN');
                $sheet->setCellValue('A2', 'Nama Ujian: ' . $this->exam->title);
                $sheet->setCellValue('A3', 'Mata Pelajaran: ' . $this->exam->subject->name);
                $sheet->setCellValue('A4', 'Kelas: ' . $this->exam->classRoom->name);
                $sheet->setCellValue('A5', 'Tanggal Export: ' . now()->format('d-m-Y H:i:s'));
                
                // Style the header information
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                $sheet->getStyle('A2:A5')->getFont()->setSize(12);
                
                // Merge cells for title
                $sheet->mergeCells('A1:P1');
                $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                
                // Add statistics
                $statistics = $this->exam->getDetailedStatistics();
                $row = 7;
                $sheet->setCellValue('A' . $row, 'STATISTIK UJIAN');
                $sheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $sheet->setCellValue('A' . $row, 'Total Peserta: ' . $statistics['total_attempts']);
                $row++;
                $sheet->setCellValue('A' . $row, 'Rata-rata Nilai: ' . $statistics['average_score']);
                $row++;
                $sheet->setCellValue('A' . $row, 'Nilai Tertinggi: ' . $statistics['highest_score']);
                $row++;
                $sheet->setCellValue('A' . $row, 'Nilai Terendah: ' . $statistics['lowest_score']);
                $row++;
                $sheet->setCellValue('A' . $row, 'Tingkat Kelulusan: ' . $statistics['pass_rate'] . '%');
                
                // Adjust column widths for statistics
                $sheet->getColumnDimension('A')->setWidth(30);
            }
        ];
    }
}
