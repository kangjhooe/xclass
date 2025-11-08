<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamQuestion;
use App\Models\Tenant\ExamAttempt;
use App\Models\Tenant\ExamAnswer;
use App\Models\Tenant\Subject;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;
use App\Exports\ExamResultsExport;
use App\Exports\ExamResultsPdfExport;
use App\Http\Requests\StoreExamRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class ExamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $exams = Exam::with(['subject', 'classRoom', 'teacher'])
            ->where('instansi_id', tenant('id'))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $statistics = [
            'total_exams' => Exam::where('instansi_id', tenant('id'))->count(),
            'active_exams' => Exam::where('instansi_id', tenant('id'))
                ->whereIn('status', [Exam::STATUS_SCHEDULED, Exam::STATUS_ONGOING])
                ->count(),
            'completed_exams' => Exam::where('instansi_id', tenant('id'))
                ->where('status', Exam::STATUS_COMPLETED)
                ->count(),
            'total_questions' => ExamQuestion::where('instansi_id', tenant('id'))->count(),
        ];

        return view('tenant.exam.index', [
            'title' => 'Ujian Online',
            'exams' => $exams,
            'statistics' => $statistics,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => null]
            ]
        ]);
    }

    /**
     * Display exams management
     */
    public function exams(Request $request)
    {
        // Check if tenant has access to exam module
        $tenant = tenant();
        if (!$tenant || !$tenant->hasModule('exam')) {
            abort(403, 'Akses ke modul exam tidak diizinkan untuk tenant Anda');
        }
        
        $query = Exam::with(['subject', 'classRoom', 'teacher'])
            ->where('instansi_id', tenant('id'));

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by subject
        if ($request->has('subject_id') && $request->subject_id !== '') {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by class
        if ($request->has('class_id') && $request->class_id !== '') {
            $query->where('class_id', $request->class_id);
        }

        // Search
        if ($request->has('search') && $request->search !== '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $exams = $query->orderBy('created_at', 'desc')->paginate(15);
        $subjects = Subject::where('instansi_id', tenant('id'))->get();
        $classes = ClassRoom::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.exams', [
            'title' => 'Daftar Ujian',
            'exams' => $exams,
            'subjects' => $subjects,
            'classes' => $classes,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Daftar Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Display questions management
     */
    public function questions(Request $request)
    {
        // Check if tenant has access to exam module
        $tenant = tenant();
        if (!$tenant || !$tenant->hasModule('exam')) {
            abort(403, 'Akses ke modul exam tidak diizinkan untuk tenant Anda');
        }
        
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

        return view('tenant.exam.questions', [
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
     * Show the form for creating a new exam.
     */
    public function createExam()
    {
        $subjects = Subject::where('instansi_id', tenant('id'))->get();
        $classes = ClassRoom::where('instansi_id', tenant('id'))->get();
        $teachers = Teacher::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.exams.create', [
            'title' => 'Tambah Ujian',
            'subjects' => $subjects,
            'classes' => $classes,
            'teachers' => $teachers,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Daftar Ujian', 'url' => tenant_route('tenant.exam.exams')],
                ['name' => 'Tambah Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created exam in storage.
     */
    public function storeExam(StoreExamRequest $request)
    {

        try {
            DB::beginTransaction();

            $exam = Exam::create([
                'instansi_id' => tenant('id'),
                'title' => $request->title,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'class_id' => $request->class_id,
                'teacher_id' => $request->teacher_id,
                'exam_type' => $request->exam_type,
                'duration' => $request->duration,
                'total_score' => $request->total_score,
                'passing_score' => $request->passing_score,
                'start_time' => Carbon::parse($request->start_time),
                'end_time' => Carbon::parse($request->end_time),
                'instructions' => $request->instructions,
                'allow_review' => $request->boolean('allow_review'),
                'show_correct_answers' => $request->boolean('show_correct_answers'),
                'randomize_questions' => $request->boolean('randomize_questions'),
                'randomize_answers' => $request->boolean('randomize_answers'),
                'max_attempts' => $request->max_attempts,
                'created_by' => Auth::id(),
                'status' => Exam::STATUS_DRAFT,
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.exam.exams'))
                ->with('success', 'Ujian berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Show the form for editing the specified exam.
     */
    public function editExam(Exam $exam)
    {
        $subjects = Subject::where('instansi_id', tenant('id'))->get();
        $classes = ClassRoom::where('instansi_id', tenant('id'))->get();
        $teachers = Teacher::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.exams.edit', [
            'title' => 'Edit Ujian',
            'exam' => $exam,
            'subjects' => $subjects,
            'classes' => $classes,
            'teachers' => $teachers,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Daftar Ujian', 'url' => tenant_route('tenant.exam.exams')],
                ['name' => 'Edit Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Update the specified exam in storage.
     */
    public function updateExam(Request $request, Exam $exam)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:class_rooms,id',
            'teacher_id' => 'required|exists:teachers,id',
            'exam_type' => 'required|in:quiz,midterm,final,assignment',
            'duration' => 'required|integer|min:1|max:480',
            'total_score' => 'required|integer|min:1',
            'passing_score' => 'required|integer|min:0|max:100',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'instructions' => 'nullable|string',
            'allow_review' => 'boolean',
            'show_correct_answers' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'max_attempts' => 'required|integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $exam->update([
                'title' => $request->title,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'class_id' => $request->class_id,
                'teacher_id' => $request->teacher_id,
                'exam_type' => $request->exam_type,
                'duration' => $request->duration,
                'total_score' => $request->total_score,
                'passing_score' => $request->passing_score,
                'start_time' => Carbon::parse($request->start_time),
                'end_time' => Carbon::parse($request->end_time),
                'instructions' => $request->instructions,
                'allow_review' => $request->boolean('allow_review'),
                'show_correct_answers' => $request->boolean('show_correct_answers'),
                'randomize_questions' => $request->boolean('randomize_questions'),
                'randomize_answers' => $request->boolean('randomize_answers'),
                'max_attempts' => $request->max_attempts,
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.exam.exams'))
                ->with('success', 'Ujian berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified exam from storage.
     */
    public function destroyExam(Exam $exam)
    {
        try {
            DB::beginTransaction();

            // Check if exam has attempts
            if ($exam->attempts()->count() > 0) {
                return redirect()->back()
                    ->with('error', 'Tidak dapat menghapus ujian yang sudah memiliki peserta');
            }

            $exam->delete();

            DB::commit();

            return redirect(tenant_route('tenant.exam.exams'))
                ->with('success', 'Ujian berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show exam details
     */
    public function showExam(Exam $exam)
    {
        $exam->load(['subject', 'classRoom', 'teacher', 'questions', 'attempts.student']);
        
        $statistics = $exam->getDetailedStatistics();
        $attempts = $exam->attempts()->with('student')->paginate(10);

        return view('tenant.exam.exams.show', [
            'title' => 'Detail Ujian',
            'exam' => $exam,
            'statistics' => $statistics,
            'attempts' => $attempts,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Online', 'url' => tenant_route('tenant.exam.index')],
                ['name' => 'Daftar Ujian', 'url' => tenant_route('tenant.exam.exams')],
                ['name' => 'Detail Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Start exam
     */
    public function startExam(Exam $exam)
    {
        if ($exam->status !== Exam::STATUS_DRAFT) {
            return redirect()->back()
                ->with('error', 'Ujian tidak dapat dimulai');
        }

        $exam->update(['status' => Exam::STATUS_SCHEDULED]);

        return redirect()->back()
            ->with('success', 'Ujian berhasil dimulai');
    }

    /**
     * Stop exam
     */
    public function stopExam(Exam $exam)
    {
        if ($exam->status !== Exam::STATUS_ONGOING) {
            return redirect()->back()
                ->with('error', 'Ujian tidak dapat dihentikan');
        }

        $exam->update(['status' => Exam::STATUS_COMPLETED]);

        return redirect()->back()
            ->with('success', 'Ujian berhasil dihentikan');
    }

    /**
     * Get exam statistics
     */
    public function getExamStatistics(Exam $exam)
    {
        $statistics = $exam->getDetailedStatistics();
        
        return response()->json($statistics);
    }

    /**
     * Export exam results
     */
    public function exportResults(Exam $exam, Request $request)
    {
        $format = $request->get('format', 'excel');
        
        try {
            if ($format === 'pdf') {
                $pdfExport = new ExamResultsPdfExport($exam);
                return $pdfExport->stream();
            }
            
            // Excel export
            $attempts = $exam->attempts()->with(['student', 'answers.question'])->get();
            $export = new ExamResultsExport($exam, $attempts);
            
            $filename = 'hasil_ujian_' . str_replace(' ', '_', $exam->title) . '_' . now()->format('Y-m-d') . '.xlsx';
            
            return Excel::download($export, $filename);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat export: ' . $e->getMessage());
        }
    }
}
