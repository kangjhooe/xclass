<?php

namespace App\Exports;

use App\Models\Tenant\OutgoingLetter;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OutgoingLettersExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $letters;

    public function __construct($letters)
    {
        $this->letters = $letters;
    }

    public function collection()
    {
        return $this->letters;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nomor Surat',
            'Tanggal Surat',
            'Jenis Surat',
            'Tujuan',
            'Perihal',
            'Prioritas',
            'Sifat Surat',
            'Status',
            'Isi Ringkas',
            'Tindak Lanjut',
            'Pengirim',
            'Tanggal Kirim',
            'Dibuat Oleh',
            'Tanggal Dibuat',
        ];
    }

    public function map($letter): array
    {
        return [
            $letter->id,
            $letter->nomor_surat,
            $letter->tanggal_surat->format('d-m-Y'),
            $letter->jenis_surat,
            $letter->tujuan,
            $letter->perihal,
            $letter->prioritas_label ?? '-',
            $letter->sifat_surat_label ?? '-',
            $letter->status_label,
            $letter->isi_ringkas ?? '-',
            $letter->tindak_lanjut ?? '-',
            $letter->pengirim ?? '-',
            $letter->tanggal_kirim ? $letter->tanggal_kirim->format('d-m-Y') : '-',
            $letter->creator->name ?? '-',
            $letter->created_at->format('d-m-Y H:i'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E3F2FD']
                ]
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 20,
            'C' => 15,
            'D' => 20,
            'E' => 25,
            'F' => 30,
            'G' => 15,
            'H' => 15,
            'I' => 15,
            'J' => 40,
            'K' => 30,
            'L' => 20,
            'M' => 15,
            'N' => 20,
            'O' => 20,
        ];
    }
}
