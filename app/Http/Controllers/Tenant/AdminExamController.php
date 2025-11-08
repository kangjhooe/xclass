<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Exam;
use App\Models\Tenant\ClassRoom;
use App\Http\Requests\StoreExamRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ExamResultsExport;

class AdminExamController extends Controller
{
    /**
     * Display a listing of exams for admin
     */
    public function index()
    {
        $exams = Exam::where('instansi_id', tenant('id'))
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
        ];

        return view('tenant.exam.admin.index', [
            'title' => 'Manajemen Ujian (Admin)',
            'exams' => $exams,
            'statistics' => $statistics,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Manajemen Ujian (Admin)', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for creating a new exam
     */
    public function create()
    {
        $classes = ClassRoom::where('instansi_id', tenant('id'))->get();
        
        return view('tenant.exam.admin.create', [
            'title' => 'Buat Ujian Baru',
            'classes' => $classes,
            'examTypes' => [
                Exam::TYPE_QUIZ => 'Quiz',
                Exam::TYPE_MIDTERM => 'Ujian Tengah Semester',
                Exam::TYPE_FINAL => 'Ujian Akhir Semester',
                Exam::TYPE_ASSIGNMENT => 'Tugas',
            ],
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Manajemen Ujian (Admin)', 'url' => tenant_route('tenant.admin.exam.index')],
                ['name' => 'Buat Ujian Baru', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created exam
     */
    public function store(StoreExamRequest $request)
    {
        try {
            DB::beginTransaction();

            $exam = Exam::create([
                'instansi_id' => tenant('id'),
                'title' => $request->title,
                'description' => $request->description,
                'exam_type' => $request->exam_type,
                'semester' => $request->semester,
                'academic_year' => $request->academic_year,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => Exam::STATUS_DRAFT,
                'instructions' => $request->instructions,
                'settings' => $request->settings ?? [],
                'created_by' => Auth::id(),
            ]);

            DB::commit();
            return redirect()->route('tenant.admin.exam.index')
                ->with('success', 'Ujian berhasil dibuat. Selanjutnya guru dapat menambahkan mata pelajaran dan soal.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified exam
     */
    public function show(Exam $exam)
    {
        $exam->load(['examSubjects.subject', 'examSubjects.teacher', 'schedules.classRoom', 'gradeAdjustments']);
        
        $statistics = [
            'total_subjects' => $exam->examSubjects->count(),
            'total_schedules' => $exam->schedules->count(),
            'total_attempts' => $exam->attempts()->count(),
            'completed_attempts' => $exam->attempts()->where('status', 'completed')->count(),
        ];

        return view('tenant.exam.admin.show', [
            'title' => 'Detail Ujian',
            'exam' => $exam,
            'statistics' => $statistics,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Manajemen Ujian (Admin)', 'url' => tenant_route('tenant.admin.exam.index')],
                ['name' => 'Detail Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Show the form for editing the exam
     */
    public function edit(Exam $exam)
    {
        $classes = ClassRoom::where('instansi_id', tenant('id'))->get();
        
        return view('tenant.exam.admin.edit', [
            'title' => 'Edit Ujian',
            'exam' => $exam,
            'classes' => $classes,
            'examTypes' => [
                Exam::TYPE_QUIZ => 'Quiz',
                Exam::TYPE_MIDTERM => 'Ujian Tengah Semester',
                Exam::TYPE_FINAL => 'Ujian Akhir Semester',
                Exam::TYPE_ASSIGNMENT => 'Tugas',
            ],
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Manajemen Ujian (Admin)', 'url' => tenant_route('tenant.admin.exam.index')],
                ['name' => 'Edit Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Update the specified exam
     */
    public function update(StoreExamRequest $request, Exam $exam)
    {
        try {
            DB::beginTransaction();

            $exam->update([
                'title' => $request->title,
                'description' => $request->description,
                'exam_type' => $request->exam_type,
                'semester' => $request->semester,
                'academic_year' => $request->academic_year,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'instructions' => $request->instructions,
                'settings' => $request->settings ?? [],
            ]);

            DB::commit();
            return redirect()->route('tenant.admin.exam.index')
                ->with('success', 'Ujian berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified exam
     */
    public function destroy(Exam $exam)
    {
        try {
            DB::beginTransaction();

            // Check if exam has attempts
            if ($exam->attempts()->count() > 0) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus ujian yang sudah memiliki percobaan siswa.');
            }

            $exam->delete();

            DB::commit();
            return redirect()->route('tenant.admin.exam.index')
                ->with('success', 'Ujian berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Start exam
     */
    public function start(Exam $exam)
    {
        try {
            if ($exam->status !== Exam::STATUS_DRAFT) {
                return redirect()->back()->with('error', 'Ujian tidak dapat dimulai dari status ini.');
            }

            $exam->update(['status' => Exam::STATUS_SCHEDULED]);
            
            return redirect()->back()->with('success', 'Ujian berhasil dimulai.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Stop exam
     */
    public function stop(Exam $exam)
    {
        try {
            if ($exam->status !== Exam::STATUS_ONGOING) {
                return redirect()->back()->with('error', 'Ujian tidak dapat dihentikan dari status ini.');
            }

            $exam->update(['status' => Exam::STATUS_COMPLETED]);
            
            return redirect()->back()->with('success', 'Ujian berhasil dihentikan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show exam results
     */
    public function results(Exam $exam)
    {
        $attempts = $exam->attempts()
            ->with(['student', 'examSubjects.subject'])
            ->where('status', 'completed')
            ->orderBy('submitted_at', 'desc')
            ->paginate(20);

        $statistics = [
            'total_attempts' => $attempts->total(),
            'average_score' => $exam->attempts()->where('status', 'completed')->avg('score') ?? 0,
            'highest_score' => $exam->attempts()->where('status', 'completed')->max('score') ?? 0,
            'lowest_score' => $exam->attempts()->where('status', 'completed')->min('score') ?? 0,
        ];

        return view('tenant.exam.admin.results', [
            'title' => 'Hasil Ujian',
            'exam' => $exam,
            'attempts' => $attempts,
            'statistics' => $statistics,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Manajemen Ujian (Admin)', 'url' => tenant_route('tenant.admin.exam.index')],
                ['name' => 'Hasil Ujian', 'url' => null]
            ]
        ]);
    }

    /**
     * Export exam results
     */
    public function export(Exam $exam)
    {
        try {
            $attempts = $exam->attempts()
                ->with(['student', 'examSubjects.subject'])
                ->where('status', 'completed')
                ->get();

            $filename = 'hasil_ujian_' . $exam->title . '_' . date('Y-m-d_H-i-s') . '.xlsx';
            
            return Excel::download(new ExamResultsExport($attempts), $filename);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengekspor: ' . $e->getMessage());
        }
    }

    /**
     * Show grade adjustment interface
     */
    public function gradeAdjustment(Exam $exam)
    {
        $attempts = $exam->attempts()
            ->with(['student'])
            ->where('status', 'completed')
            ->orderBy('student_id')
            ->get();

        $gradeAdjustments = $exam->gradeAdjustments()
            ->with(['student', 'adjustedBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return view('tenant.exam.admin.grade-adjustment', [
            'title' => 'Katrol Nilai',
            'exam' => $exam,
            'attempts' => $attempts,
            'gradeAdjustments' => $gradeAdjustments,
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Manajemen Ujian (Admin)', 'url' => tenant_route('tenant.admin.exam.index')],
                ['name' => 'Katrol Nilai', 'url' => null]
            ]
        ]);
    }

    /**
     * Apply grade adjustment
     */
    public function applyGradeAdjustment(Request $request, Exam $exam)
    {
        try {
            DB::beginTransaction();

            $adjustmentService = app(\App\Services\GradeAdjustmentService::class);
            
            $adjustments = $adjustmentService->adjustGrades(
                $exam,
                $request->adjustment_type,
                $request->all(),
                Auth::id(),
                'admin'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Penyesuaian nilai berhasil diterapkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}