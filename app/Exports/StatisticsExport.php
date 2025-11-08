<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StatisticsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $data;
    protected $type;

    public function __construct($data, $type)
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function collection()
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        switch ($this->type) {
            case 'overview':
                return [
                    'Metrik',
                    'Total',
                ];
            case 'institutions':
                return [
                    'Nama Institusi',
                    'Status',
                    'Tipe',
                    'Jumlah Siswa',
                    'Jumlah Guru',
                    'Jumlah Staff',
                    'Jumlah Kelas',
                    'Jumlah Mata Pelajaran',
                    'Tanggal Dibuat',
                ];
            case 'students':
                return [
                    'Nama',
                    'NIS',
                    'Jenis Kelamin',
                    'Kelas',
                    'Institusi',
                    'Status',
                    'Tanggal Dibuat',
                ];
            case 'teachers':
                return [
                    'Nama',
                    'NIP',
                    'Jenis Kelamin',
                    'Pendidikan',
                    'Institusi',
                    'Status',
                    'Tanggal Dibuat',
                ];
            case 'academic':
                return [
                    'Bulan/Tahun',
                    'Jumlah Ujian',
                    'Jumlah Hasil Ujian',
                    'Rata-rata Nilai',
                ];
            default:
                return [];
        }
    }

    public function map($item): array
    {
        switch ($this->type) {
            case 'overview':
                return [
                    $item['name'] ?? 'Unknown',
                    $item['value'] ?? 0,
                ];
            case 'institutions':
                return [
                    $item->name ?? '',
                    $item->status ?? '',
                    $item->type ?? '',
                    $item->students_count ?? 0,
                    $item->teachers_count ?? 0,
                    $item->staff_count ?? 0,
                    $item->class_rooms_count ?? 0,
                    $item->subjects_count ?? 0,
                    $item->created_at ? $item->created_at->format('d-m-Y') : '',
                ];
            case 'students':
                return [
                    $item->name ?? '',
                    $item->nis ?? '',
                    $item->gender ?? '',
                    $item->classRoom->name ?? '',
                    $item->institution->name ?? '',
                    $item->status ?? '',
                    $item->created_at ? $item->created_at->format('d-m-Y') : '',
                ];
            case 'teachers':
                return [
                    $item->name ?? '',
                    $item->nip ?? '',
                    $item->gender ?? '',
                    $item->education_level ?? '',
                    $item->institution->name ?? '',
                    $item->status ?? '',
                    $item->created_at ? $item->created_at->format('d-m-Y') : '',
                ];
            case 'academic':
                return [
                    $item->month ?? '',
                    $item->exams ?? 0,
                    $item->results ?? 0,
                    $item->average_score ?? 0,
                ];
            default:
                return [];
        }
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        switch ($this->type) {
            case 'overview':
                return 'Statistik Overview';
            case 'institutions':
                return 'Statistik Institusi';
            case 'students':
                return 'Statistik Siswa';
            case 'teachers':
                return 'Statistik Guru';
            case 'academic':
                return 'Statistik Akademik';
            default:
                return 'Statistik';
        }
    }
}
