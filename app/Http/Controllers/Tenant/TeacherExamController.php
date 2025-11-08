<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Exam;
use App\Models\Tenant\Question;
use App\Models\Tenant\ExamSubject;
use App\Models\Tenant\ExamSchedule;
use App\Models\Tenant\Subject;
use App\Models\Tenant\ClassRoom;
use App\Services\QuestionSharingService;
use App\Services\GradeAdjustmentService;
use App\Http\Requests\StoreExamSubjectRequest;
use App\Http\Requests\StoreExamScheduleRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TeacherExamController extends Controller
{
    protected $questionSharingService;
    protected $gradeAdjustmentService;

    public function __construct(QuestionSharingService $questionSharingService, GradeAdjustmentService $gradeAdjustmentService)
    {
        $this->questionSharingService = $questionSharingService;
        $this->gradeAdjustmentService = $gradeAdjustmentService;
    }

    /**
     * Display a listing of exams for teacher
     */
    public function index()
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $exams = Exam::where('instansi_id', tenant('id'))
            ->whereHas('examSubjects', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->id);
            })
            ->with(['examSubjects.subject'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('tenant.exam.teacher.index', [
            'title' => 'Ujian Saya',
            'exams' => $exams,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Saya', 'url' => null]
            ]
        ]);
    }

    /**
     * Display available exams for teacher to add subjects
     */
    public function availableExams()
    {
        $exams = Exam::where('instansi_id', tenant('id'))
            ->where('status', Exam::STATUS_DRAFT)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return view('tenant.exam.teacher.available-exams', [
            'title' => 'Ujian Tersedia',
            'exams' => $exams,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Saya', 'url' => tenant_route('tenant.teacher.exam.index')],
                ['name' => 'Ujian Tersedia', 'url' => null]
            ]
        ]);
    }

    /**
     * Show form to add subject to exam
     */
    public function addSubject(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $subjects = Subject::where('instansi_id', tenant('id'))
            ->where('teacher_id', $teacher->id)
            ->get();

        return view('tenant.exam.teacher.add-subject', [
            'title' => 'Tambah Mata Pelajaran ke Ujian',
            'exam' => $exam,
            'subjects' => $subjects,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Saya', 'url' => tenant_route('tenant.teacher.exam.index')],
                ['name' => 'Tambah Mata Pelajaran', 'url' => null]
            ]
        ]);
    }

    /**
     * Store exam subject
     */
    public function storeSubject(StoreExamSubjectRequest $request, Exam $exam)
    {
        try {
            DB::beginTransaction();

            $teacher = Auth::user()->teacher;
            if (!$teacher) {
                return redirect()->back()->with('error', 'Anda bukan guru');
            }

            $examSubject = ExamSubject::create([
                'instansi_id' => tenant('id'),
                'exam_id' => $exam->id,
                'subject_id' => $request->subject_id,
                'teacher_id' => $teacher->id,
                'total_questions' => 0,
                'total_score' => 0,
                'duration' => $request->duration,
                'settings' => $request->settings ?? [],
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.teacher.exam.subject.questions', $examSubject))
                ->with('success', 'Mata pelajaran berhasil ditambahkan. Silakan pilih soal.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Show questions management for exam subject
     */
    public function manageQuestions(ExamSubject $examSubject)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher || $examSubject->teacher_id !== $teacher->id) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses');
        }

        $examSubject->load(['subject', 'exam']);

        // Get available questions (own + shared)
        $availableQuestions = Question::accessibleBy(tenant('id'))
            ->where('subject_id', $examSubject->subject_id)
            ->with(['subject', 'creator', 'originTenant'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Get selected questions
        $selectedQuestions = $examSubject->questions();

        return view('tenant.exam.teacher.manage-questions', [
            'title' => 'Kelola Soal - ' . $examSubject->subject->name,
            'examSubject' => $examSubject,
            'availableQuestions' => $availableQuestions,
            'selectedQuestions' => $selectedQuestions,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Saya', 'url' => tenant_route('tenant.teacher.exam.index')],
                ['name' => 'Kelola Soal', 'url' => null]
            ]
        ]);
    }

    /**
     * Add questions to exam subject
     */
    public function addQuestions(Request $request, ExamSubject $examSubject)
    {
        try {
            DB::beginTransaction();

            $teacher = Auth::user()->teacher;
            if (!$teacher || $examSubject->teacher_id !== $teacher->id) {
                return redirect()->back()->with('error', 'Anda tidak memiliki akses');
            }

            $questionIds = $request->question_ids ?? [];
            $examSubject->setQuestions($questionIds);
            $examSubject->calculateTotalScore();

            DB::commit();

            return redirect()->back()
                ->with('success', 'Soal berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show form to create exam schedule
     */
    public function createSchedule(ExamSubject $examSubject)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher || $examSubject->teacher_id !== $teacher->id) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses');
        }

        $classes = ClassRoom::where('instansi_id', tenant('id'))->get();

        return view('tenant.exam.teacher.create-schedule', [
            'title' => 'Buat Jadwal Ujian',
            'examSubject' => $examSubject,
            'classes' => $classes,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Saya', 'url' => tenant_route('tenant.teacher.exam.index')],
                ['name' => 'Buat Jadwal', 'url' => null]
            ]
        ]);
    }

    /**
     * Store exam schedule
     */
    public function storeSchedule(StoreExamScheduleRequest $request, ExamSubject $examSubject)
    {
        try {
            DB::beginTransaction();

            $teacher = Auth::user()->teacher;
            if (!$teacher || $examSubject->teacher_id !== $teacher->id) {
                return redirect()->back()->with('error', 'Anda tidak memiliki akses');
            }

            $examSchedule = ExamSchedule::create([
                'instansi_id' => tenant('id'),
                'exam_id' => $examSubject->exam_id,
                'class_id' => $request->class_id,
                'subject_id' => $examSubject->subject_id,
                'teacher_id' => $teacher->id,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'duration' => $examSubject->duration,
                'total_questions' => $examSubject->total_questions,
                'total_score' => $examSubject->total_score,
                'passing_score' => $request->passing_score,
                'status' => ExamSchedule::STATUS_SCHEDULED,
                'instructions' => $request->instructions,
                'settings' => $request->settings ?? [],
                'allow_review' => $request->allow_review ?? true,
                'show_correct_answers' => $request->show_correct_answers ?? false,
                'randomize_questions' => $request->randomize_questions ?? false,
                'randomize_answers' => $request->randomize_answers ?? false,
                'max_attempts' => $request->max_attempts ?? 1,
            ]);

            DB::commit();

            return redirect(tenant_route('tenant.teacher.exam.schedule.show', $examSchedule))
                ->with('success', 'Jadwal ujian berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Show exam results for teacher
     */
    public function results(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $exam->load(['schedules' => function ($query) use ($teacher) {
            $query->where('teacher_id', $teacher->id)
                  ->with(['attempts.student', 'classRoom']);
        }]);

        return view('tenant.exam.teacher.results', [
            'title' => 'Hasil Ujian',
            'exam' => $exam,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Saya', 'url' => tenant_route('tenant.teacher.exam.index')],
                ['name' => 'Hasil Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Show grade adjustment form
     */
    public function gradeAdjustment(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $eligibleStudents = $this->gradeAdjustmentService->getEligibleStudents($exam, $teacher->id);
        $adjustmentHistory = $this->gradeAdjustmentService->getExamAdjustmentHistory($exam);

        return view('tenant.exam.teacher.grade-adjustment', [
            'title' => 'Katrol Nilai',
            'exam' => $exam,
            'eligibleStudents' => $eligibleStudents,
            'adjustmentHistory' => $adjustmentHistory,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Ujian Saya', 'url' => tenant_route('tenant.teacher.exam.index')],
                ['name' => 'Katrol Nilai', 'url' => null]
            ]
        ]);
    }

    /**
     * Apply grade adjustment
     */
    public function applyGradeAdjustment(Request $request, Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Anda bukan guru');
        }

        $adjustmentType = $request->adjustment_type;
        $note = $request->note;

        switch ($adjustmentType) {
            case 'percent':
                $percentage = $request->percentage;
                $result = $this->gradeAdjustmentService->applyPercentageAdjustment(
                    $exam, $percentage, Auth::id(), GradeAdjustment::ROLE_TEACHER, $note
                );
                break;

            case 'minimum':
                $minimumGrade = $request->minimum_grade;
                $result = $this->gradeAdjustmentService->applyMinimumGradeAdjustment(
                    $exam, $minimumGrade, Auth::id(), GradeAdjustment::ROLE_TEACHER, $note
                );
                break;

            case 'manual':
                $studentId = $request->student_id;
                $newGrade = $request->new_grade;
                $success = $this->gradeAdjustmentService->applyManualGradeAdjustment(
                    $exam, $studentId, $newGrade, Auth::id(), GradeAdjustment::ROLE_TEACHER, $note
                );
                $result = $success ? ['success' => [$studentId], 'failed' => []] : ['success' => [], 'failed' => [$studentId]];
                break;

            default:
                return redirect()->back()->with('error', 'Tipe penyesuaian tidak valid');
        }

        if (!empty($result['success'])) {
            return redirect()->back()->with('success', 'Penyesuaian nilai berhasil diterapkan');
        } else {
            return redirect()->back()->with('error', 'Gagal menerapkan penyesuaian nilai');
        }
    }
}
