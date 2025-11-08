<?php

namespace App\Exports;

use App\Models\Tenant\Teacher;
use Barryvdh\DomPDF\Facade\Pdf;

class TeacherCredentialsPdfExport
{
    protected $data;
    protected $tenant;

    public function __construct($data, $tenant)
    {
        // $data should be array of ['teacher' => Teacher, 'password' => string, 'email' => string]
        $this->data = $data;
        $this->tenant = $tenant;
    }

    public function export()
    {
        $pdf = Pdf::loadView('tenant.teachers.exports.credentials-pdf', [
            'data' => $this->data,
            'tenant' => $this->tenant,
            'exportDate' => now()
        ]);

        $pdf->setPaper('A4', 'portrait');
        
        return $pdf->download('kredensial_guru_' . now()->format('Y-m-d_His') . '.pdf');
    }

    public function stream()
    {
        $pdf = Pdf::loadView('tenant.teachers.exports.credentials-pdf', [
            'data' => $this->data,
            'tenant' => $this->tenant,
            'exportDate' => now()
        ]);

        $pdf->setPaper('A4', 'portrait');
        
        return $pdf->stream('kredensial_guru_' . now()->format('Y-m-d_His') . '.pdf');
    }
}

