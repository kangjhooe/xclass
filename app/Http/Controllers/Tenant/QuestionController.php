<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Question;
use App\Models\Tenant\Subject;
use App\Services\QuestionSharingService;
use App\Services\QuestionImportExportService;
use App\Http\Requests\StoreQuestionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class QuestionController extends Controller
{
    protected $questionSharingService;
    protected $importExportService;

    public function __construct(QuestionSharingService $questionSharingService, QuestionImportExportService $importExportService)
    {
        $this->questionSharingService = $questionSharingService;
        $this->importExportService = $importExportService;
    }

    /**
     * Display a listing of questions
     */
    public function index(Request $request)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $filters = $request->only(['subject_id', 'type', 'difficulty', 'visibility', 'search']);
        $questions = $this->questionSharingService->getShareableQuestions(tenant('id'), $filters);
        $subjects = Subject::where('instansi_id', tenant('id'))
            ->where('teacher_id', $teacher->id)
            ->get();

        $statistics = $this->questionSharingService->getSharingStatistics(tenant('id'));

        return view('tenant.exam.questions.index', [
            'title' => 'Bank Soal',
            'questions' => $questions,
            'subjects' => $subjects,
            'statistics' => $statistics,
            'filters' => $filters,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for creating a new question
     */
    public function create()
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $subjects = Subject::where('instansi_id', tenant('id'))
            ->where('teacher_id', $teacher->id)
            ->get();

        return view('tenant.exam.questions.create', [
            'title' => 'Buat Soal Baru',
            'subjects' => $subjects,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.questions.index')],
                ['name' => 'Buat Soal Baru', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created question
     */
    public function store(StoreQuestionRequest $request)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $question = Question::create([
                'subject_id' => $request->subject_id,
                'tenant_id' => tenant('id'),
                'creator_id' => Auth::id(),
                'question_text' => $request->question_text,
                'type' => $request->type,
                'options' => $request->options,
                'answer_key' => $request->answer_key,
                'explanation' => $request->explanation,
                'points' => $request->points,
                'difficulty' => $request->difficulty,
                'visibility' => Question::VISIBILITY_PRIVATE,
                'metadata' => $request->metadata ?? [],
            ]);

            return redirect(tenant_route('tenant.questions.show', $question))
                ->with('success', 'Soal berhasil dibuat');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified question
     */
    public function show(Question $question)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        // Check if teacher has access to this question
        if ($question->tenant_id !== tenant('id') && !$question->isShared()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke soal ini');
        }

        $question->load(['subject', 'creator', 'originTenant']);

        return view('tenant.exam.questions.show', [
            'title' => 'Detail Soal',
            'question' => $question,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.questions.index')],
                ['name' => 'Detail Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for editing the question
     */
    public function edit(Question $question)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        // Check if teacher owns this question
        if ($question->creator_id !== Auth::id() || $question->tenant_id !== tenant('id')) {
            return redirect()->back()->with('error', 'Anda tidak dapat mengedit soal ini');
        }

        $subjects = Subject::where('instansi_id', tenant('id'))
            ->where('teacher_id', $teacher->id)
            ->get();

        return view('tenant.exam.questions.edit', [
            'title' => 'Edit Soal',
            'question' => $question,
            'subjects' => $subjects,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.questions.index')],
                ['name' => 'Edit Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Update the specified question
     */
    public function update(StoreQuestionRequest $request, Question $question)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question
            if ($question->creator_id !== Auth::id() || $question->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak dapat mengedit soal ini');
            }

            $question->update([
                'subject_id' => $request->subject_id,
                'question_text' => $request->question_text,
                'type' => $request->type,
                'options' => $request->options,
                'answer_key' => $request->answer_key,
                'explanation' => $request->explanation,
                'points' => $request->points,
                'difficulty' => $request->difficulty,
                'metadata' => $request->metadata ?? [],
            ]);

            return redirect(tenant_route('tenant.questions.show', $question))
                ->with('success', 'Soal berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified question
     */
    public function destroy(Question $question)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question
            if ($question->creator_id !== Auth::id() || $question->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak dapat menghapus soal ini');
            }

            $question->delete();

            return redirect(tenant_route('tenant.questions.index'))
                ->with('success', 'Soal berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Share question
     */
    public function share(Question $question)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question
            if ($question->creator_id !== Auth::id() || $question->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak dapat membagikan soal ini');
            }

            if ($this->questionSharingService->shareQuestion($question)) {
                return redirect()->back()->with('success', 'Soal berhasil dibagikan');
            } else {
                return redirect()->back()->with('error', 'Gagal membagikan soal');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Unshare question
     */
    public function unshare(Question $question)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question
            if ($question->creator_id !== Auth::id() || $question->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak dapat menghentikan berbagi soal ini');
            }

            if ($this->questionSharingService->unshareQuestion($question)) {
                return redirect()->back()->with('success', 'Berbagi soal dihentikan');
            } else {
                return redirect()->back()->with('error', 'Gagal menghentikan berbagi soal');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Copy shared question to own question bank
     */
    public function copy(Question $question)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if question is shared
            if (!$question->isShared()) {
                return redirect()->back()->with('error', 'Soal tidak dibagikan');
            }

            $copiedQuestion = $this->questionSharingService->copyQuestionToTenant(
                $question, tenant('id'), Auth::id()
            );

            if ($copiedQuestion) {
                return redirect(tenant_route('tenant.questions.show', $copiedQuestion))
                    ->with('success', 'Soal berhasil disalin ke bank soal Anda');
            } else {
                return redirect()->back()->with('error', 'Gagal menyalin soal');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Display shared questions
     */
    public function shared(Request $request)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $filters = $request->only(['subject_id', 'type', 'difficulty', 'search']);
        $questions = $this->questionSharingService->getSharedQuestions(tenant('id'), $filters);
        $subjects = Subject::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.questions.shared', [
            'title' => 'Soal yang Dibagikan',
            'questions' => $questions,
            'subjects' => $subjects,
            'filters' => $filters,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.questions.index')],
                ['name' => 'Soal yang Dibagikan', 'url' => null]
            ]
        ]);
    }

    /**
     * Bulk share questions
     */
    public function bulkShare(Request $request)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $questionIds = $request->question_ids ?? [];
            if (empty($questionIds)) {
                return redirect()->back()->with('error', 'Pilih soal yang akan dibagikan');
            }

            $result = $this->questionSharingService->bulkShareQuestions($questionIds, tenant('id'));

            $message = 'Berhasil membagikan ' . count($result['success']) . ' soal';
            if (!empty($result['failed'])) {
                $message .= ', gagal membagikan ' . count($result['failed']) . ' soal';
            }

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Bulk unshare questions
     */
    public function bulkUnshare(Request $request)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $questionIds = $request->question_ids ?? [];
            if (empty($questionIds)) {
                return redirect()->back()->with('error', 'Pilih soal yang akan dihentikan berbaginya');
            }

            $result = $this->questionSharingService->bulkUnshareQuestions($questionIds, tenant('id'));

            $message = 'Berhasil menghentikan berbagi ' . count($result['success']) . ' soal';
            if (!empty($result['failed'])) {
                $message .= ', gagal menghentikan berbagi ' . count($result['failed']) . ' soal';
            }

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Export questions to Excel
     */
    public function exportExcel(Request $request)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $filters = $request->only(['subject_id', 'type', 'difficulty', 'visibility']);
            $questions = $this->questionSharingService->getShareableQuestions(tenant('id'), $filters);
            
            $filename = 'bank_soal_' . date('Y-m-d_H-i-s') . '.xlsx';
            $filePath = $this->importExportService->exportToExcel($questions, $filename);
            
            return response()->download($filePath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengekspor: ' . $e->getMessage());
        }
    }

    /**
     * Export questions to JSON
     */
    public function exportJson(Request $request)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $filters = $request->only(['subject_id', 'type', 'difficulty', 'visibility']);
            $questions = $this->questionSharingService->getShareableQuestions(tenant('id'), $filters);
            
            $filename = 'bank_soal_' . date('Y-m-d_H-i-s') . '.json';
            $filePath = $this->importExportService->exportToJson($questions, $filename);
            
            return response()->download($filePath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengekspor: ' . $e->getMessage());
        }
    }

    /**
     * Download import template
     */
    public function downloadTemplate()
    {
        try {
            $filePath = $this->importExportService->getImportTemplate();
            return response()->download($filePath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengunduh template: ' . $e->getMessage());
        }
    }

    /**
     * Import questions from Excel
     */
    public function importExcel(Request $request)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls|max:10240',
                'subject_id' => 'required|exists:subjects,id',
            ]);

            $file = $request->file('file');
            $subjectId = $request->subject_id;

            $result = $this->importExportService->importFromExcel($file, $subjectId, Auth::id(), tenant('id'));

            if ($result['success']) {
                $message = 'Berhasil mengimpor ' . $result['questions_count'] . ' soal';
                if ($result['groups_count'] > 0) {
                    $message .= ' dan ' . $result['groups_count'] . ' kelompok soal';
                }
                return redirect()->back()->with('success', $message);
            } else {
                return redirect()->back()->with('error', 'Gagal mengimpor: ' . $result['error']);
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengimpor: ' . $e->getMessage());
        }
    }

    /**
     * Import questions from JSON
     */
    public function importJson(Request $request)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $request->validate([
                'file' => 'required|file|mimes:json|max:10240',
                'subject_id' => 'required|exists:subjects,id',
            ]);

            $file = $request->file('file');
            $subjectId = $request->subject_id;

            $result = $this->importExportService->importFromJson($file, $subjectId, Auth::id(), tenant('id'));

            if ($result['success']) {
                $message = 'Berhasil mengimpor ' . $result['questions_count'] . ' soal';
                if ($result['groups_count'] > 0) {
                    $message .= ' dan ' . $result['groups_count'] . ' kelompok soal';
                }
                return redirect()->back()->with('success', $message);
            } else {
                return redirect()->back()->with('error', 'Gagal mengimpor: ' . $result['error']);
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengimpor: ' . $e->getMessage());
        }
    }


}
