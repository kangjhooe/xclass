<?php

namespace App\Exports;

use App\Models\PPDBApplication;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class AcceptedApplicationsExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    public function __construct(
        protected ?string $academicYear = null,
        protected ?string $batch = null,
        protected ?string $major = null,
        protected ?string $path = null,
    ) {}

    public function collection()
    {
        $q = PPDBApplication::query()->where('status', PPDBApplication::STATUS_ACCEPTED);
        if ($this->academicYear) { $q->where('academic_year', $this->academicYear); }
        if ($this->batch) { $q->where('batch', $this->batch); }
        if ($this->major) { $q->where('major_choice', $this->major); }
        if ($this->path) { $q->where('registration_path', $this->path); }

        return $q->orderBy('major_choice')
            ->orderBy('registration_path')
            ->orderByDesc('total_score')
            ->get(['registration_number','full_name','major_choice','registration_path','total_score','academic_year','batch']);
    }

    public function headings(): array
    {
        return ['Nomor Pendaftaran','Nama','Jurusan','Jalur','Skor','Tahun Ajaran','Gelombang'];
    }
}


