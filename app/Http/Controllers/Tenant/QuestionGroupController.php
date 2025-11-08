<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\QuestionGroup;
use App\Models\Tenant\Question;
use App\Models\Tenant\Subject;
use App\Http\Requests\StoreQuestionGroupRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuestionGroupController extends Controller
{
    /**
     * Display a listing of question groups
     */
    public function index(Request $request)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $filters = $request->only(['subject_id', 'stimulus_type', 'search']);
        $query = QuestionGroup::where('tenant_id', tenant('id'))
            ->with(['subject', 'creator', 'questions']);

        // Apply filters
        if (isset($filters['subject_id']) && $filters['subject_id']) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (isset($filters['stimulus_type']) && $filters['stimulus_type']) {
            $query->where('stimulus_type', $filters['stimulus_type']);
        }

        if (isset($filters['search']) && $filters['search']) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        $questionGroups = $query->orderBy('created_at', 'desc')->paginate(15);
        $subjects = Subject::where('instansi_id', tenant('id'))
            ->where('teacher_id', $teacher->id)
            ->get();

        return view('tenant.exam.question-groups.index', [
            'title' => 'Kelompok Soal (Stimulus)',
            'questionGroups' => $questionGroups,
            'subjects' => $subjects,
            'filters' => $filters,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.questions.index')],
                ['name' => 'Kelompok Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for creating a new question group
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

        return view('tenant.exam.question-groups.create', [
            'title' => 'Buat Kelompok Soal Baru',
            'subjects' => $subjects,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.questions.index')],
                ['name' => 'Kelompok Soal', 'url' => tenant_route('tenant.question-groups.index')],
                ['name' => 'Buat Baru', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created question group
     */
    public function store(StoreQuestionGroupRequest $request)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $questionGroup = QuestionGroup::create([
                'tenant_id' => tenant('id'),
                'subject_id' => $request->subject_id,
                'created_by' => Auth::id(),
                'title' => $request->title,
                'description' => $request->description,
                'stimulus_type' => $request->stimulus_type,
                'stimulus_content' => $request->stimulus_content,
                'metadata' => $request->metadata ?? [],
            ]);

            return redirect(tenant_route('tenant.question-groups.show', $questionGroup))
                ->with('success', 'Kelompok soal berhasil dibuat. Silakan tambahkan soal ke dalam kelompok ini.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified question group
     */
    public function show(QuestionGroup $questionGroup)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        // Check if teacher has access to this question group
        if ($questionGroup->tenant_id !== tenant('id')) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke kelompok soal ini');
        }

        $questionGroup->load(['subject', 'creator', 'questions' => function ($query) {
            $query->orderBy('group_order');
        }]);

        return view('tenant.exam.question-groups.show', [
            'title' => 'Detail Kelompok Soal',
            'questionGroup' => $questionGroup,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.questions.index')],
                ['name' => 'Kelompok Soal', 'url' => tenant_route('tenant.question-groups.index')],
                ['name' => 'Detail', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for editing the question group
     */
    public function edit(QuestionGroup $questionGroup)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        // Check if teacher owns this question group
        if ($questionGroup->created_by !== Auth::id() || $questionGroup->tenant_id !== tenant('id')) {
            return redirect()->back()->with('error', 'Anda tidak dapat mengedit kelompok soal ini');
        }

        $subjects = Subject::where('instansi_id', tenant('id'))
            ->where('teacher_id', $teacher->id)
            ->get();

        return view('tenant.exam.question-groups.edit', [
            'title' => 'Edit Kelompok Soal',
            'questionGroup' => $questionGroup,
            'subjects' => $subjects,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.questions.index')],
                ['name' => 'Kelompok Soal', 'url' => tenant_route('tenant.question-groups.index')],
                ['name' => 'Edit', 'url' => null]
            ]
        ]);
    }

    /**
     * Update the specified question group
     */
    public function update(StoreQuestionGroupRequest $request, QuestionGroup $questionGroup)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question group
            if ($questionGroup->created_by !== Auth::id() || $questionGroup->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak dapat mengedit kelompok soal ini');
            }

            $questionGroup->update([
                'subject_id' => $request->subject_id,
                'title' => $request->title,
                'description' => $request->description,
                'stimulus_type' => $request->stimulus_type,
                'stimulus_content' => $request->stimulus_content,
                'metadata' => $request->metadata ?? [],
            ]);

            return redirect(tenant_route('tenant.question-groups.show', $questionGroup))
                ->with('success', 'Kelompok soal berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified question group
     */
    public function destroy(QuestionGroup $questionGroup)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question group
            if ($questionGroup->created_by !== Auth::id() || $questionGroup->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak dapat menghapus kelompok soal ini');
            }

            // Check if group has questions
            if ($questionGroup->hasQuestions()) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus kelompok soal yang memiliki soal. Hapus semua soal terlebih dahulu.');
            }

            $questionGroup->delete();

            return redirect(tenant_route('tenant.question-groups.index'))
                ->with('success', 'Kelompok soal berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Add question to group
     */
    public function addQuestion(Request $request, QuestionGroup $questionGroup)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question group
            if ($questionGroup->created_by !== Auth::id() || $questionGroup->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak memiliki akses ke kelompok soal ini');
            }

            $questionId = $request->question_id;
            $question = Question::where('id', $questionId)
                ->where('tenant_id', tenant('id'))
                ->where('creator_id', Auth::id())
                ->first();

            if (!$question) {
                return redirect()->back()->with('error', 'Soal tidak ditemukan');
            }

            if ($question->belongsToGroup()) {
                return redirect()->back()->with('error', 'Soal sudah berada dalam kelompok lain');
            }

            $questionGroup->addQuestion($question);

            return redirect()->back()->with('success', 'Soal berhasil ditambahkan ke kelompok');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove question from group
     */
    public function removeQuestion(QuestionGroup $questionGroup, Question $question)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question group
            if ($questionGroup->created_by !== Auth::id() || $questionGroup->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak memiliki akses ke kelompok soal ini');
            }

            if ($question->question_group_id !== $questionGroup->id) {
                return redirect()->back()->with('error', 'Soal tidak berada dalam kelompok ini');
            }

            $questionGroup->removeQuestion($question);

            return redirect()->back()->with('success', 'Soal berhasil dikeluarkan dari kelompok');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Reorder questions in group
     */
    public function reorderQuestions(Request $request, QuestionGroup $questionGroup)
    {
        try {
            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            // Check if teacher owns this question group
            if ($questionGroup->created_by !== Auth::id() || $questionGroup->tenant_id !== tenant('id')) {
                return redirect()->back()->with('error', 'Anda tidak memiliki akses ke kelompok soal ini');
            }

            $questionIds = $request->question_ids ?? [];
            $questionGroup->reorderQuestions($questionIds);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get available questions for adding to group
     */
    public function getAvailableQuestions(QuestionGroup $questionGroup)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return response()->json(['error' => 'Anda bukan guru'], 403);
        }

        // Check if teacher owns this question group
        if ($questionGroup->created_by !== Auth::id() || $questionGroup->tenant_id !== tenant('id')) {
            return response()->json(['error' => 'Anda tidak memiliki akses ke kelompok soal ini'], 403);
        }

        $questions = Question::where('tenant_id', tenant('id'))
            ->where('creator_id', Auth::id())
            ->where('subject_id', $questionGroup->subject_id)
            ->whereNull('question_group_id')
            ->with(['subject'])
            ->get();

        return response()->json(['questions' => $questions]);
    }
}
