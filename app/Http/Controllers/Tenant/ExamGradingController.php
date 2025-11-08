<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamAttempt;
use App\Models\Tenant\ExamAnswer;
use App\Services\ExamGradingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExamGradingController extends Controller
{
    protected $gradingService;

    public function __construct(ExamGradingService $gradingService)
    {
        $this->gradingService = $gradingService;
    }

    /**
     * Display grading dashboard
     */
    public function index(Exam $exam)
    {
        $this->authorize('view', $exam);

        $attempts = $exam->attempts()
            ->with(['student', 'answers.question'])
            ->where('status', ExamAttempt::STATUS_COMPLETED)
            ->orderBy('submitted_at', 'desc')
            ->paginate(20);

        $statistics = $this->gradingService->getGradingStatistics($exam);

        return view('tenant.exam.grading.index', [
            'title' => 'Penilaian Ujian',
            'exam' => $exam,
            'attempts' => $attempts,
            'statistics' => $statistics,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Penilaian', 'url' => null]
            ]
        ]);
    }

    /**
     * Show manual grading interface
     */
    public function show(Exam $exam, ExamAttempt $attempt)
    {
        $this->authorize('view', $exam);
        $this->authorize('view', $attempt);

        $answers = $attempt->answers()
            ->with('question')
            ->orderBy('question_id')
            ->get();

        $essayQuestions = $answers->filter(function ($answer) {
            return $answer->question->question_type === 'essay';
        });

        $gradedAnswers = $answers->where('grading_data.manual_grading', true);
        $pendingAnswers = $answers->where('grading_data.manual_grading', false)
            ->where('question.question_type', 'essay');

        return view('tenant.exam.grading.show', [
            'title' => 'Penilaian Manual',
            'exam' => $exam,
            'attempt' => $attempt,
            'answers' => $answers,
            'essayQuestions' => $essayQuestions,
            'gradedAnswers' => $gradedAnswers,
            'pendingAnswers' => $pendingAnswers,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Penilaian', 'url' => tenant_route('tenant.exam.grading.index', $exam)],
                ['name' => 'Detail', 'url' => null]
            ]
        ]);
    }

    /**
     * Grade an attempt automatically
     */
    public function gradeAttempt(Exam $exam, ExamAttempt $attempt)
    {
        $this->authorize('update', $exam);
        $this->authorize('update', $attempt);

        if ($attempt->status !== ExamAttempt::STATUS_COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => 'Attempt must be completed before grading'
            ], 400);
        }

        $result = $this->gradingService->gradeAttempt($attempt);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Attempt graded successfully',
                'data' => $result
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to grade attempt: ' . $result['error']
            ], 500);
        }
    }

    /**
     * Grade all attempts for an exam
     */
    public function gradeAllAttempts(Exam $exam)
    {
        $this->authorize('update', $exam);

        $attempts = $exam->attempts()
            ->where('status', ExamAttempt::STATUS_COMPLETED)
            ->get();

        $results = [];
        $successCount = 0;
        $errorCount = 0;

        foreach ($attempts as $attempt) {
            $result = $this->gradingService->gradeAttempt($attempt);
            $results[] = [
                'attempt_id' => $attempt->id,
                'student_name' => $attempt->student->name,
                'success' => $result['success'],
                'error' => $result['error'] ?? null
            ];

            if ($result['success']) {
                $successCount++;
            } else {
                $errorCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Graded {$successCount} attempts successfully, {$errorCount} failed",
            'data' => [
                'total_attempts' => $attempts->count(),
                'success_count' => $successCount,
                'error_count' => $errorCount,
                'results' => $results
            ]
        ]);
    }

    /**
     * Manual grade an essay answer
     */
    public function manualGradeEssay(Request $request, Exam $exam, ExamAttempt $attempt, ExamAnswer $answer)
    {
        $this->authorize('update', $exam);
        $this->authorize('update', $attempt);

        $request->validate([
            'points' => 'required|integer|min:0|max:' . $answer->question->points,
            'feedback' => 'nullable|string|max:1000'
        ]);

        $result = $this->gradingService->manualGradeEssay(
            $answer,
            $request->points,
            $request->feedback
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Essay graded successfully',
                'data' => $result
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to grade essay: ' . $result['error']
            ], 500);
        }
    }

    /**
     * Bulk grade essays
     */
    public function bulkGradeEssays(Request $request, Exam $exam)
    {
        $this->authorize('update', $exam);

        $request->validate([
            'gradings' => 'required|array',
            'gradings.*.answer_id' => 'required|exists:exam_answers,id',
            'gradings.*.points' => 'required|integer|min:0',
            'gradings.*.feedback' => 'nullable|string|max:1000'
        ]);

        $results = [];
        $successCount = 0;
        $errorCount = 0;

        DB::beginTransaction();
        try {
            foreach ($request->gradings as $grading) {
                $answer = ExamAnswer::findOrFail($grading['answer_id']);
                
                // Validate points against question max points
                if ($grading['points'] > $answer->question->points) {
                    $results[] = [
                        'answer_id' => $grading['answer_id'],
                        'success' => false,
                        'error' => 'Points exceed maximum for this question'
                    ];
                    $errorCount++;
                    continue;
                }

                $result = $this->gradingService->manualGradeEssay(
                    $answer,
                    $grading['points'],
                    $grading['feedback'] ?? null
                );

                $results[] = [
                    'answer_id' => $grading['answer_id'],
                    'success' => $result['success'],
                    'error' => $result['error'] ?? null
                ];

                if ($result['success']) {
                    $successCount++;
                } else {
                    $errorCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Graded {$successCount} essays successfully, {$errorCount} failed",
                'data' => [
                    'total_essays' => count($request->gradings),
                    'success_count' => $successCount,
                    'error_count' => $errorCount,
                    'results' => $results
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to grade essays: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get grading statistics
     */
    public function statistics(Exam $exam)
    {
        $this->authorize('view', $exam);

        $statistics = $this->gradingService->getGradingStatistics($exam);

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    /**
     * Export grading results
     */
    public function export(Exam $exam, Request $request)
    {
        $this->authorize('view', $exam);

        $format = $request->get('format', 'excel');
        $attempts = $exam->attempts()
            ->with(['student', 'answers.question'])
            ->where('status', ExamAttempt::STATUS_COMPLETED)
            ->get();

        if ($format === 'pdf') {
            return $this->exportToPdf($exam, $attempts);
        } else {
            return $this->exportToExcel($exam, $attempts);
        }
    }

    /**
     * Export to Excel
     */
    private function exportToExcel(Exam $exam, $attempts)
    {
        $export = new \App\Exports\ExamGradingExport($exam, $attempts);
        return \Maatwebsite\Excel\Facades\Excel::download($export, 'penilaian_ujian_' . $exam->title . '.xlsx');
    }

    /**
     * Export to PDF
     */
    private function exportToPdf(Exam $exam, $attempts)
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('tenant.exam.grading.exports.pdf', [
            'exam' => $exam,
            'attempts' => $attempts
        ]);

        return $pdf->stream('penilaian_ujian_' . $exam->title . '.pdf');
    }
}
