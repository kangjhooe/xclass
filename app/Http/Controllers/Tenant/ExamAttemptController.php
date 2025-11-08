<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamAttempt;
use App\Models\Tenant\ExamAnswer;
use App\Models\Tenant\Student;
use App\Exports\ExamAnswersExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class ExamAttemptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check if tenant has access to exam module
        $tenant = tenant();
        if (!$tenant || !$tenant->hasModule('exam')) {
            abort(403, 'Akses ke modul exam tidak diizinkan untuk tenant Anda');
        }
        
        $query = ExamAttempt::with(['exam', 'exam.subject', 'exam.classRoom', 'student'])
            ->where('instansi_id', tenant('id'));

        // Filter by exam
        if ($request->has('exam_id') && $request->exam_id !== '') {
            $query->where('exam_id', $request->exam_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by student
        if ($request->has('student_id') && $request->student_id !== '') {
            $query->where('student_id', $request->student_id);
        }

        $attempts = $query->orderBy('created_at', 'desc')->paginate(15);
        $exams = Exam::where('instansi_id', tenant('id'))->get();
        $students = Student::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.attempts.index', [
            'title' => 'Hasil Ujian',
            'attempts' => $attempts,
            'exams' => $exams,
            'students' => $students,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Hasil Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $exams = Exam::where('instansi_id', tenant('id'))
            ->where('status', Exam::STATUS_SCHEDULED)
            ->get();
        $students = Student::where('instansi_id', tenant('id'))
            ->where('is_active', true)
            ->get();

        return view('tenant.exam.attempts.create', [
            'title' => 'Tambah Hasil Ujian',
            'exams' => $exams,
            'students' => $students,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Hasil Ujian', 'url' => tenant_route('tenant.exam.attempts')],
                ['name' => 'Tambah Hasil Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exam_id' => 'required|exists:exams,id',
            'student_id' => 'required|exists:students,id',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $exam = Exam::find($request->exam_id);
            $student = Student::find($request->student_id);

            // Check if student can take this exam
            if (!$exam->canStudentTake($student->id)) {
                return redirect()->back()
                    ->with('error', 'Siswa tidak dapat mengikuti ujian ini');
            }

            // Check if exam is available
            if (!$exam->isAvailable()) {
                return redirect()->back()
                    ->with('error', 'Ujian tidak tersedia saat ini');
            }

            // Create attempt
            $attempt = ExamAttempt::create([
                'instansi_id' => tenant('id'),
                'exam_id' => $request->exam_id,
                'student_id' => $request->student_id,
                'started_at' => now(),
                'status' => ExamAttempt::STATUS_STARTED,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'question_order' => $exam->generateRandomQuestionOrder(),
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.exam.attempts.show', $attempt))
                ->with('success', 'Ujian berhasil dimulai');
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
    public function show(ExamAttempt $attempt)
    {
        $attempt->load(['exam', 'exam.subject', 'exam.classRoom', 'student', 'answers.question']);

        return view('tenant.exam.attempts.show', [
            'title' => 'Detail Hasil Ujian',
            'attempt' => $attempt,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Hasil Ujian', 'url' => tenant_route('tenant.exam.attempts')],
                ['name' => 'Detail Hasil Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ExamAttempt $attempt)
    {
        $attempt->load(['exam', 'student']);

        return view('tenant.exam.attempts.edit', [
            'title' => 'Edit Hasil Ujian',
            'attempt' => $attempt,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Hasil Ujian', 'url' => tenant_route('tenant.exam.attempts')],
                ['name' => 'Edit Hasil Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExamAttempt $attempt)
    {
        $validator = Validator::make($request->all(), [
            'score' => 'required|integer|min:0',
            'status' => 'required|in:started,in_progress,completed,abandoned,timeout',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $attempt->update([
                'score' => $request->score,
                'status' => $request->status,
                'submitted_at' => $request->status === ExamAttempt::STATUS_COMPLETED ? now() : null,
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.exam.attempts'))
                ->with('success', 'Hasil ujian berhasil diperbarui');
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
    public function destroy(ExamAttempt $attempt)
    {
        try {
            DB::beginTransaction();

            $attempt->delete();

            DB::commit();

            return redirect(tenant_route('tenant.exam.attempts'))
                ->with('success', 'Hasil ujian berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Start exam attempt
     */
    public function start(Exam $exam)
    {
        try {
            DB::beginTransaction();

            $student = Auth::user()->student;
            if (!$student) {
                return redirect()->back()
                    ->with('error', 'Anda bukan siswa');
            }

            // Check if student can take this exam
            if (!$exam->canStudentTake($student->id)) {
                return redirect()->back()
                    ->with('error', 'Anda tidak dapat mengikuti ujian ini');
            }

            // Check if exam is available
            if (!$exam->isAvailable()) {
                return redirect()->back()
                    ->with('error', 'Ujian tidak tersedia saat ini');
            }

            // Create or resume attempt
            $attempt = ExamAttempt::where('exam_id', $exam->id)
                ->where('student_id', $student->id)
                ->where('status', ExamAttempt::STATUS_STARTED)
                ->first();

            if (!$attempt) {
                $attempt = ExamAttempt::create([
                    'instansi_id' => tenant('id'),
                    'exam_id' => $exam->id,
                    'student_id' => $student->id,
                    'started_at' => now(),
                    'status' => ExamAttempt::STATUS_STARTED,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'question_order' => $exam->generateRandomQuestionOrder(),
                ]);
            } else {
                $attempt->resume();
            }

            DB::commit();

            return redirect(tenant_route('tenant.exam.take', $attempt));
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Take exam (student interface)
     */
    public function take(ExamAttempt $attempt)
    {
        $attempt->load(['exam', 'exam.questions', 'answers']);

        // Check if attempt is valid
        if (!$attempt->isInProgress() || $attempt->isTimedOut()) {
            return redirect(tenant_route('tenant.exam.index'))
                ->with('error', 'Ujian tidak dapat diakses');
        }

        // Get questions in order
        $questionOrder = $attempt->question_order ?? $attempt->exam->generateRandomQuestionOrder();
        $questions = ExamQuestion::whereIn('id', $questionOrder)
            ->orderByRaw('FIELD(id, ' . implode(',', $questionOrder) . ')')
            ->get();

        return view('tenant.exam.take', [
            'title' => 'Mengerjakan Ujian',
            'attempt' => $attempt,
            'questions' => $questions,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Mengerjakan Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Submit exam
     */
    public function submit(ExamAttempt $attempt, Request $request)
    {
        try {
            DB::beginTransaction();

            if (!$attempt->canSubmit()) {
                return response()->json(['error' => 'Ujian tidak dapat disubmit'], 400);
            }

            // Update attempt status
            $attempt->complete();

            // Calculate score
            $attempt->calculateScore();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ujian berhasil disubmit',
                'redirect' => tenant_route('tenant.exam.results', $attempt)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Save answer
     */
    public function saveAnswer(ExamAttempt $attempt, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_id' => 'required|exists:exam_questions,id',
            'answer' => 'nullable',
            'time_spent' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Data tidak valid'], 400);
        }

        try {
            DB::beginTransaction();

            $question = ExamQuestion::find($request->question_id);
            $answer = ExamAnswer::where('attempt_id', $attempt->id)
                ->where('question_id', $request->question_id)
                ->first();

            if (!$answer) {
                $answer = ExamAnswer::create([
                    'instansi_id' => tenant('id'),
                    'exam_id' => $attempt->exam_id,
                    'question_id' => $request->question_id,
                    'attempt_id' => $attempt->id,
                    'student_id' => $attempt->student_id,
                    'answer' => $request->answer,
                    'time_spent' => $request->time_spent ?? 0,
                    'answered_at' => now(),
                ]);
            } else {
                $answer->updateAnswer($request->answer, $request->time_spent ?? 0, $request->boolean('auto_save'));
            }

            DB::commit();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get attempt progress
     */
    public function getProgress(ExamAttempt $attempt)
    {
        $progress = $attempt->getSummary();
        $remainingTime = $attempt->getRemainingTime();

        return response()->json([
            'progress' => $progress,
            'remaining_time' => $remainingTime,
            'formatted_remaining_time' => $attempt->getFormattedRemainingTime(),
            'can_submit' => $attempt->canSubmit(),
        ]);
    }

    /**
     * Show exam results
     */
    public function results(ExamAttempt $attempt)
    {
        $attempt->load(['exam', 'exam.subject', 'exam.classRoom', 'answers.question']);

        if (!$attempt->isCompleted() && !$attempt->exam->allow_review) {
            return redirect(tenant_route('tenant.exam.index'))
                ->with('error', 'Hasil ujian belum tersedia');
        }

        return view('tenant.exam.results', [
            'title' => 'Hasil Ujian',
            'attempt' => $attempt,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Hasil Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Export attempt results
     */
    public function export(ExamAttempt $attempt, Request $request)
    {
        $format = $request->get('format', 'excel');
        
        try {
            if ($format === 'excel') {
                $export = new ExamAnswersExport($attempt);
                $filename = 'detail_jawaban_' . str_replace(' ', '_', $attempt->student->name) . '_' . now()->format('Y-m-d') . '.xlsx';
                
                return Excel::download($export, $filename);
            }
            
            // PDF export for individual attempt
            return redirect()->back()
                ->with('error', 'Export PDF untuk detail jawaban belum tersedia');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat export: ' . $e->getMessage());
        }
    }
}