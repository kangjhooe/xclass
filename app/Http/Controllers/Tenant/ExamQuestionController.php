<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamQuestion;
use App\Http\Requests\StoreQuestionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ExamQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ExamQuestion::with(['exam', 'exam.subject', 'exam.classRoom'])
            ->where('instansi_id', tenant('id'));

        // Filter by exam
        if ($request->has('exam_id') && $request->exam_id !== '') {
            $query->where('exam_id', $request->exam_id);
        }

        // Filter by question type
        if ($request->has('question_type') && $request->question_type !== '') {
            $query->where('question_type', $request->question_type);
        }

        // Filter by difficulty
        if ($request->has('difficulty') && $request->difficulty !== '') {
            $query->where('difficulty', $request->difficulty);
        }

        // Search
        if ($request->has('search') && $request->search !== '') {
            $query->where('question_text', 'like', '%' . $request->search . '%');
        }

        $questions = $query->orderBy('created_at', 'desc')->paginate(15);
        $exams = Exam::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.questions.index', [
            'title' => 'Bank Soal',
            'questions' => $questions,
            'exams' => $exams,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Bank Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $exams = Exam::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.questions.create', [
            'title' => 'Tambah Soal',
            'exams' => $exams,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.exam.questions')],
                ['name' => 'Tambah Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionRequest $request)
    {

        try {
            DB::beginTransaction();

            // Get the next order number for this exam
            $nextOrder = ExamQuestion::where('exam_id', $request->exam_id)
                ->max('order') + 1;

            $question = ExamQuestion::create([
                'instansi_id' => tenant('id'),
                'exam_id' => $request->exam_id,
                'question_text' => $request->question_text,
                'question_type' => $request->question_type,
                'options' => $request->question_type === 'essay' ? null : $request->options,
                'correct_answer' => $request->correct_answer,
                'explanation' => $request->explanation,
                'points' => $request->points,
                'difficulty' => $request->difficulty,
                'order' => $request->order ?? $nextOrder,
                'is_active' => true,
            ]);

            // Update exam total questions and score
            $exam = Exam::find($request->exam_id);
            $exam->update([
                'total_questions' => $exam->questions()->count(),
                'total_score' => $exam->questions()->sum('points'),
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.exam.questions'))
                ->with('success', 'Soal berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ExamQuestion $question)
    {
        $question->load(['exam', 'exam.subject', 'exam.classRoom']);

        return view('tenant.exam.questions.show', [
            'title' => 'Detail Soal',
            'question' => $question,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.exam.questions')],
                ['name' => 'Detail Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ExamQuestion $question)
    {
        $exams = Exam::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.questions.edit', [
            'title' => 'Edit Soal',
            'question' => $question,
            'exams' => $exams,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.exam.questions')],
                ['name' => 'Edit Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExamQuestion $question)
    {
        $validator = Validator::make($request->all(), [
            'exam_id' => 'required|exists:exams,id',
            'question_text' => 'required|string',
            'question_type' => 'required|in:multiple_choice,true_false,essay,fill_blank,matching',
            'options' => 'required_if:question_type,multiple_choice,true_false,matching|array',
            'correct_answer' => 'required_if:question_type,multiple_choice,true_false,fill_blank,matching',
            'explanation' => 'nullable|string',
            'points' => 'required|integer|min:1',
            'difficulty' => 'required|in:easy,medium,hard',
            'order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $question->update([
                'exam_id' => $request->exam_id,
                'question_text' => $request->question_text,
                'question_type' => $request->question_type,
                'options' => $request->question_type === 'essay' ? null : $request->options,
                'correct_answer' => $request->correct_answer,
                'explanation' => $request->explanation,
                'points' => $request->points,
                'difficulty' => $request->difficulty,
                'order' => $request->order ?? $question->order,
            ]);

            // Update exam total questions and score
            $exam = Exam::find($request->exam_id);
            $exam->update([
                'total_questions' => $exam->questions()->count(),
                'total_score' => $exam->questions()->sum('points'),
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.exam.questions'))
                ->with('success', 'Soal berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExamQuestion $question)
    {
        try {
            DB::beginTransaction();

            $exam = $question->exam;
            $question->delete();

            // Update exam total questions and score
            $exam->update([
                'total_questions' => $exam->questions()->count(),
                'total_score' => $exam->questions()->sum('points'),
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.exam.questions'))
                ->with('success', 'Soal berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Toggle question active status
     */
    public function toggleActive(ExamQuestion $question)
    {
        $question->update(['is_active' => !$question->is_active]);

        return redirect()->back()
            ->with('success', 'Status soal berhasil diperbarui');
    }

    /**
     * Reorder questions
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:exam_questions,id',
            'questions.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Data tidak valid'], 400);
        }

        try {
            DB::beginTransaction();

            foreach ($request->questions as $questionData) {
                ExamQuestion::where('id', $questionData['id'])
                    ->update(['order' => $questionData['order']]);
            }

            DB::commit();

            return response()->json(['success' => 'Urutan soal berhasil diperbarui']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get question statistics
     */
    public function getStatistics(ExamQuestion $question)
    {
        $statistics = $question->getDetailedStatistics();
        
        return response()->json($statistics);
    }

    /**
     * Bulk create questions
     */
    public function bulkCreate()
    {
        $exams = Exam::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.questions.bulk-create', [
            'title' => 'Tambah Soal Massal',
            'exams' => $exams,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Bank Soal', 'url' => tenant_route('tenant.exam.questions')],
                ['name' => 'Tambah Soal Massal', 'url' => null]
            ]
        ]);
    }

    /**
     * Store bulk questions
     */
    public function bulkStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exam_id' => 'required|exists:exams,id',
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:multiple_choice,true_false,essay,fill_blank,matching',
            'questions.*.options' => 'required_if:questions.*.question_type,multiple_choice,true_false,matching|array',
            'questions.*.correct_answer' => 'required_if:questions.*.question_type,multiple_choice,true_false,fill_blank,matching',
            'questions.*.points' => 'required|integer|min:1',
            'questions.*.difficulty' => 'required|in:easy,medium,hard',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $exam = Exam::find($request->exam_id);
            $nextOrder = $exam->questions()->max('order') + 1;

            foreach ($request->questions as $index => $questionData) {
                ExamQuestion::create([
                    'instansi_id' => tenant('id'),
                    'exam_id' => $request->exam_id,
                    'question_text' => $questionData['question_text'],
                    'question_type' => $questionData['question_type'],
                    'options' => $questionData['question_type'] === 'essay' ? null : $questionData['options'],
                    'correct_answer' => $questionData['correct_answer'],
                    'explanation' => $questionData['explanation'] ?? null,
                    'points' => $questionData['points'],
                    'difficulty' => $questionData['difficulty'],
                    'order' => $nextOrder + $index,
                    'is_active' => true,
                ]);
            }

            // Update exam total questions and score
            $exam->update([
                'total_questions' => $exam->questions()->count(),
                'total_score' => $exam->questions()->sum('points'),
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.exam.questions'))
                ->with('success', count($request->questions) . ' soal berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }
}