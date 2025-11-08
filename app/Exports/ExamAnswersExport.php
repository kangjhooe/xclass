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

class ExamAnswersExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $attempt;

    public function __construct(ExamAttempt $attempt)
    {
        $this->attempt = $attempt->load(['exam', 'student', 'answers.question']);
    }

    public function collection()
    {
        return $this->attempt->answers;
    }

    public function headings(): array
    {
        return [
            'No Soal',
            'Pertanyaan',
            'Jenis Soal',
            'Tingkat Kesulitan',
            'Poin',
            'Jawaban Siswa',
            'Jawaban Benar',
            'Status',
            'Poin Diperoleh',
            'Waktu Pengerjaan',
            'Tanggal Dijawab'
        ];
    }

    public function map($answer): array
    {
        $question = $answer->question;
        
        return [
            $answer->question->order,
            $this->truncateText($question->question_text, 100),
            $question->type_label,
            $question->difficulty_label,
            $question->points,
            $this->formatStudentAnswer($answer),
            $this->formatCorrectAnswer($question),
            $answer->is_correct ? 'Benar' : 'Salah',
            $answer->points,
            $answer->formatted_time_spent,
            $answer->answered_at ? $answer->answered_at->format('d-m-Y H:i:s') : '-'
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10,  // No Soal
            'B' => 50,  // Pertanyaan
            'C' => 15,  // Jenis Soal
            'D' => 15,  // Tingkat Kesulitan
            'E' => 8,   // Poin
            'F' => 30,  // Jawaban Siswa
            'G' => 30,  // Jawaban Benar
            'H' => 10,  // Status
            'I' => 12,  // Poin Diperoleh
            'J' => 15,  // Waktu Pengerjaan
            'K' => 20,  // Tanggal Dijawab
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
            'A:K' => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_TOP,
                    'wrapText' => true
                ]
            ]
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Add exam and student information at the top
                $sheet->insertNewRowBefore(1, 6);
                
                $sheet->setCellValue('A1', 'DETAIL JAWABAN SISWA');
                $sheet->setCellValue('A2', 'Nama Ujian: ' . $this->attempt->exam->title);
                $sheet->setCellValue('A3', 'Mata Pelajaran: ' . $this->attempt->exam->subject->name);
                $sheet->setCellValue('A4', 'Nama Siswa: ' . $this->attempt->student->name);
                $sheet->setCellValue('A5', 'NIS: ' . ($this->attempt->student->nis ?? '-'));
                $sheet->setCellValue('A6', 'Tanggal Export: ' . now()->format('d-m-Y H:i:s'));
                
                // Style the header information
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                $sheet->getStyle('A2:A6')->getFont()->setSize(12);
                
                // Merge cells for title
                $sheet->mergeCells('A1:K1');
                $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                
                // Add attempt summary
                $row = 8;
                $sheet->setCellValue('A' . $row, 'RINGKASAN UJIAN');
                $sheet->getStyle('A' . $row)->getFont()->setBold(true);
                $row++;
                
                $sheet->setCellValue('A' . $row, 'Nilai: ' . $this->attempt->score . '/' . $this->attempt->exam->total_score);
                $row++;
                $sheet->setCellValue('A' . $row, 'Persentase: ' . $this->attempt->percentage_score . '%');
                $row++;
                $sheet->setCellValue('A' . $row, 'Nilai Huruf: ' . $this->attempt->grade);
                $row++;
                $sheet->setCellValue('A' . $row, 'Status: ' . ($this->attempt->isPassed() ? 'Lulus' : 'Tidak Lulus'));
                $row++;
                $sheet->setCellValue('A' . $row, 'Waktu Pengerjaan: ' . $this->attempt->formatted_time_spent);
                $row++;
                $sheet->setCellValue('A' . $row, 'Tanggal Mulai: ' . $this->attempt->started_at->format('d-m-Y H:i:s'));
                $row++;
                $sheet->setCellValue('A' . $row, 'Tanggal Selesai: ' . ($this->attempt->submitted_at ? $this->attempt->submitted_at->format('d-m-Y H:i:s') : '-'));
                
                // Adjust column widths
                $sheet->getColumnDimension('A')->setWidth(30);
            }
        ];
    }

    private function truncateText($text, $length = 100)
    {
        return strlen($text) > $length ? substr($text, 0, $length) . '...' : $text;
    }

    private function formatStudentAnswer($answer)
    {
        if (empty($answer->answer)) {
            return 'Tidak dijawab';
        }

        $question = $answer->question;
        
        switch ($question->question_type) {
            case 'multiple_choice':
            case 'true_false':
                $options = $question->options;
                return $options[$answer->answer] ?? $answer->answer;
            
            case 'fill_blank':
                return is_array($answer->answer) ? implode(', ', $answer->answer) : $answer->answer;
            
            case 'essay':
                return $answer->answer;
            
            case 'matching':
                return is_array($answer->answer) ? implode(', ', $answer->answer) : $answer->answer;
            
            default:
                return $answer->answer;
        }
    }

    private function formatCorrectAnswer($question)
    {
        switch ($question->question_type) {
            case 'multiple_choice':
            case 'true_false':
                $options = $question->options;
                return $options[$question->correct_answer] ?? $question->correct_answer;
            
            case 'fill_blank':
                return is_array($question->correct_answer) ? 
                    implode(', ', $question->correct_answer) : 
                    $question->correct_answer;
            
            case 'essay':
                return 'Memerlukan penilaian manual';
            
            case 'matching':
                return is_array($question->correct_answer) ? 
                    implode(', ', $question->correct_answer) : 
                    $question->correct_answer;
            
            default:
                return $question->correct_answer;
        }
    }
}
