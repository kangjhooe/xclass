<?php

namespace App\Exports;

use App\Models\Tenant\HealthRecord;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Health Record Export Class
 * 
 * Handles Excel export for Health Record data
 */
class HealthRecordExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $records;

    public function __construct($records)
    {
        $this->records = $records;
    }

    /**
     * Get collection of health records
     */
    public function collection()
    {
        return $this->records;
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
            'Tanggal Pemeriksaan',
            'Jenis Pemeriksaan',
            'Tinggi Badan (cm)',
            'Berat Badan (kg)',
            'BMI',
            'Tekanan Darah',
            'Suhu (°C)',
            'Denyut Nadi',
            'Penglihatan Kiri',
            'Penglihatan Kanan',
            'Pendengaran Kiri',
            'Pendengaran Kanan',
            'Kondisi Gigi',
            'Kondisi Umum',
            'Keluhan',
            'Diagnosis',
            'Pengobatan',
            'Obat',
            'Perlu Tindak Lanjut',
            'Tanggal Tindak Lanjut',
            'Pemeriksa',
            'Catatan',
            'Dibuat Oleh',
            'Dibuat',
            'Diperbarui',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($record): array
    {
        $checkupDate = '';
        if ($record->record_date) {
            try {
                if (is_string($record->record_date)) {
                    $date = \Carbon\Carbon::parse($record->record_date);
                    $checkupDate = $date->format('d-m-Y');
                } elseif (is_object($record->record_date)) {
                    $checkupDate = $record->record_date->format('d-m-Y');
                }
            } catch (\Exception $e) {
                $checkupDate = '';
            }
        }

        $followUpDate = '';
        if ($record->follow_up_date) {
            try {
                if (is_string($record->follow_up_date)) {
                    $date = \Carbon\Carbon::parse($record->follow_up_date);
                    $followUpDate = $date->format('d-m-Y');
                } elseif (is_object($record->follow_up_date)) {
                    $followUpDate = $record->follow_up_date->format('d-m-Y');
                }
            } catch (\Exception $e) {
                $followUpDate = '';
            }
        }

        $bmi = '';
        if ($record->height && $record->weight) {
            $heightInMeters = $record->height / 100;
            $bmi = round($record->weight / ($heightInMeters * $heightInMeters), 2);
        }

        return [
            $record->student->name ?? '',
            $record->student->student_number ?? $record->student->nis ?? '',
            $record->student->nisn ?? '',
            $record->student->classRoom->name ?? ($record->student->class->name ?? ''),
            $checkupDate,
            $record->type_label ?? ucfirst($record->record_type ?? ''),
            $record->height ? number_format($record->height, 2, ',', '.') : '',
            $record->weight ? number_format($record->weight, 2, ',', '.') : '',
            $bmi,
            $record->blood_pressure ?? '',
            $record->temperature ? number_format($record->temperature, 1, ',', '.') : '',
            $record->pulse ?? '',
            $record->vision_left ?? '',
            $record->vision_right ?? '',
            $record->hearing_left ?? '',
            $record->hearing_right ?? '',
            $record->dental_condition ?? '',
            $record->general_condition ?? '',
            $record->complaints ?? '',
            $record->diagnosis ?? '',
            $record->treatment ?? '',
            $record->medication ?? '',
            $record->follow_up_required ? 'Ya' : 'Tidak',
            $followUpDate,
            $record->examiner ?? '',
            $record->notes ?? '',
            $record->creator->name ?? '',
            $record->created_at ? (is_string($record->created_at) ? date('d-m-Y H:i:s', strtotime($record->created_at)) : $record->created_at->format('d-m-Y H:i:s')) : '',
            $record->updated_at ? (is_string($record->updated_at) ? date('d-m-Y H:i:s', strtotime($record->updated_at)) : $record->updated_at->format('d-m-Y H:i:s')) : '',
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
            'E' => 15, // Tanggal Pemeriksaan
            'F' => 20, // Jenis Pemeriksaan
            'G' => 15, // Tinggi Badan
            'H' => 15, // Berat Badan
            'I' => 10, // BMI
            'J' => 15, // Tekanan Darah
            'K' => 12, // Suhu
            'L' => 12, // Denyut Nadi
            'M' => 15, // Penglihatan Kiri
            'N' => 15, // Penglihatan Kanan
            'O' => 15, // Pendengaran Kiri
            'P' => 15, // Pendengaran Kanan
            'Q' => 20, // Kondisi Gigi
            'R' => 20, // Kondisi Umum
            'S' => 30, // Keluhan
            'T' => 30, // Diagnosis
            'U' => 30, // Pengobatan
            'V' => 25, // Obat
            'W' => 15, // Perlu Tindak Lanjut
            'X' => 18, // Tanggal Tindak Lanjut
            'Y' => 20, // Pemeriksa
            'Z' => 40, // Catatan
            'AA' => 20, // Dibuat Oleh
            'AB' => 20, // Dibuat
            'AC' => 20, // Diperbarui
        ];
    }

    /**
     * Register events
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->getDelegate()->getStyle('A1:AC1')
                    ->getAlignment()
                    ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            },
        ];
    }
}
