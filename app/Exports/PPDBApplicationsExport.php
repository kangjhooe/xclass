<?php

namespace App\Exports;

use App\Models\PPDBApplication;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PPDBApplicationsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $applications;

    public function __construct($applications = null)
    {
        $this->applications = $applications ?? PPDBApplication::all();
    }

    public function collection()
    {
        return $this->applications;
    }

    public function headings(): array
    {
        return [
            'Nomor Pendaftaran',
            'Nama Lengkap',
            'Email',
            'No. Telepon',
            'Tanggal Lahir',
            'Tempat Lahir',
            'Jenis Kelamin',
            'Alamat',
            'Asal Sekolah',
            'Alamat Sekolah',
            'Pilihan Jurusan',
            'Jalur Pendaftaran',
            'Nama Orang Tua',
            'No. Telepon Orang Tua',
            'Pekerjaan Orang Tua',
            'Penghasilan Orang Tua',
            'Status',
            'Nilai Seleksi',
            'Nilai Wawancara',
            'Nilai Dokumen',
            'Total Nilai',
            'Tahun Ajaran',
            'Gelombang',
            'Tanggal Daftar',
            'Tanggal Seleksi',
            'Tanggal Pengumuman',
            'Tanggal Diterima',
            'Catatan',
            'Alasan Ditolak'
        ];
    }

    public function map($application): array
    {
        return [
            $application->registration_number,
            $application->full_name,
            $application->email,
            $application->phone,
            $application->birth_date ? $application->birth_date->format('d-m-Y') : '-',
            $application->birth_place,
            $application->gender_label,
            $application->address,
            $application->previous_school,
            $application->previous_school_address,
            $application->major_choice,
            $application->registration_path_label,
            $application->parent_name,
            $application->parent_phone,
            $application->parent_occupation,
            $application->parent_income ? 'Rp ' . number_format($application->parent_income, 0, ',', '.') : '-',
            $application->status_label,
            $application->selection_score ?? '-',
            $application->interview_score ?? '-',
            $application->document_score ?? '-',
            $application->total_score ?? '-',
            $application->academic_year,
            $application->batch,
            $application->created_at->format('d-m-Y H:i:s'),
            $application->selection_date ? $application->selection_date->format('d-m-Y H:i:s') : '-',
            $application->announcement_date ? $application->announcement_date->format('d-m-Y H:i:s') : '-',
            $application->accepted_date ? $application->accepted_date->format('d-m-Y H:i:s') : '-',
            $application->notes ?? '-',
            $application->rejected_reason ?? '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20, // Nomor Pendaftaran
            'B' => 25, // Nama Lengkap
            'C' => 30, // Email
            'D' => 15, // No. Telepon
            'E' => 15, // Tanggal Lahir
            'F' => 20, // Tempat Lahir
            'G' => 15, // Jenis Kelamin
            'H' => 40, // Alamat
            'I' => 30, // Asal Sekolah
            'J' => 40, // Alamat Sekolah
            'K' => 15, // Pilihan Jurusan
            'L' => 15, // Jalur Pendaftaran
            'M' => 25, // Nama Orang Tua
            'N' => 15, // No. Telepon Orang Tua
            'O' => 20, // Pekerjaan Orang Tua
            'P' => 20, // Penghasilan Orang Tua
            'Q' => 15, // Status
            'R' => 15, // Nilai Seleksi
            'S' => 15, // Nilai Wawancara
            'T' => 15, // Nilai Dokumen
            'U' => 15, // Total Nilai
            'V' => 15, // Tahun Ajaran
            'W' => 15, // Gelombang
            'X' => 20, // Tanggal Daftar
            'Y' => 20, // Tanggal Seleksi
            'Z' => 20, // Tanggal Pengumuman
            'AA' => 20, // Tanggal Diterima
            'AB' => 30, // Catatan
            'AC' => 30, // Alasan Ditolak
        ];
    }
}
