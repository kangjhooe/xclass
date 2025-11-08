<?php

namespace App\Exports;

use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamAttempt;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ExamResultsPdfExport
{
    protected $exam;
    protected $attempts;

    public function __construct(Exam $exam, $attempts = null)
    {
        $this->exam = $exam;
        $this->attempts = $attempts ?? $exam->attempts()->with(['student', 'answers.question'])->get();
    }

    public function export()
    {
        $statistics = $this->exam->getDetailedStatistics();
        
        $pdf = Pdf::loadView('tenant.exam.exports.results-pdf', [
            'exam' => $this->exam,
            'attempts' => $this->attempts,
            'statistics' => $statistics,
            'exportDate' => now()
        ]);

        $pdf->setPaper('A4', 'landscape');
        
        return $pdf->download('hasil_ujian_' . $this->exam->title . '_' . now()->format('Y-m-d') . '.pdf');
    }

    public function stream()
    {
        $statistics = $this->exam->getDetailedStatistics();
        
        $pdf = Pdf::loadView('tenant.exam.exports.results-pdf', [
            'exam' => $this->exam,
            'attempts' => $this->attempts,
            'statistics' => $statistics,
            'exportDate' => now()
        ]);

        $pdf->setPaper('A4', 'landscape');
        
        return $pdf->stream('hasil_ujian_' . $this->exam->title . '_' . now()->format('Y-m-d') . '.pdf');
    }
}
