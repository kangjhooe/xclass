<?php

namespace App\Exports;

use App\Models\ActivityLog;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Activity Log Export Class
 * 
 * Handles Excel export for Activity Log data
 */
class ActivityLogExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $logs;

    public function __construct($logs)
    {
        $this->logs = $logs;
    }

    /**
     * Get collection of activity logs
     */
    public function collection()
    {
        return $this->logs;
    }

    /**
     * Define column headings
     */
    public function headings(): array
    {
        return [
            'ID',
            'Tanggal & Waktu',
            'Pengguna',
            'Aksi',
            'Model',
            'ID Model',
            'Deskripsi',
            'Perubahan',
            'IP Address',
            'User Agent',
        ];
    }

    /**
     * Map data for each row
     */
    public function map($log): array
    {
        $changes = '';
        if ($log->changes && is_array($log->changes)) {
            $changeArray = [];
            foreach ($log->changes as $field => $change) {
                $old = $change['old'] ?? '';
                $new = $change['new'] ?? '';
                $changeArray[] = "{$field}: {$old} → {$new}";
            }
            $changes = implode('; ', $changeArray);
        }

        return [
            $log->id,
            $log->created_at ? $log->created_at->format('d-m-Y H:i:s') : '',
            $log->user->name ?? 'Unknown',
            $log->action_label ?? ucfirst($log->action ?? ''),
            $log->model_name ?? class_basename($log->model_type ?? ''),
            $log->model_id ?? '',
            $log->description ?? '',
            $changes,
            $log->ip_address ?? '',
            $log->user_agent ?? '',
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
            'A' => 10, // ID
            'B' => 20, // Tanggal & Waktu
            'C' => 25, // Pengguna
            'D' => 15, // Aksi
            'E' => 20, // Model
            'F' => 10, // ID Model
            'G' => 40, // Deskripsi
            'H' => 50, // Perubahan
            'I' => 18, // IP Address
            'J' => 40, // User Agent
        ];
    }

    /**
     * Register events
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->getDelegate()->getStyle('A1:J1')
                    ->getAlignment()
                    ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            },
        ];
    }
}
