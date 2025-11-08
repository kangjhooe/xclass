<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\StudentPromotion;
use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\AcademicYear;
use App\Models\Tenant\StudentGrade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $query = StudentPromotion::with(['student', 'fromClass', 'toClass', 'fromAcademicYear', 'toAcademicYear'])
            ->where('instansi_id', $instansiId);

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // Filter by academic year
        if ($request->academic_year_id) {
            $query->where('from_academic_year_id', $request->academic_year_id);
        }

        $promotions = $query->orderBy('created_at', 'desc')->paginate(20);

        $academicYears = AcademicYear::where('instansi_id', $instansiId)->get();

        return view('tenant.promotions.index', compact('promotions', 'academicYears'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $instansiId = Auth::user()->instansi_id;
        
        // Get current active academic year
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        if (!$currentAcademicYear) {
            return redirect()->route('tenant.promotions.index')
                ->with('error', 'Tidak ada tahun pelajaran yang aktif. Silakan aktifkan tahun pelajaran terlebih dahulu.');
        }

        // Get next academic year (tahun pelajaran tujuan)
        $nextAcademicYear = AcademicYear::where('instansi_id', $instansiId)
            ->where('id', '!=', $currentAcademicYear->id)
            ->orderBy('start_date', 'asc')
            ->first();

        // Get classes from current academic year
        $currentClasses = ClassRoom::where('instansi_id', $instansiId)
            ->where('is_active', true)
            ->get()
            ->groupBy('level');

        // Get classes for next academic year
        $nextClasses = ClassRoom::where('instansi_id', $instansiId)
            ->get()
            ->groupBy('level');

        // Get students by class
        $studentsByClass = [];
        foreach ($currentClasses as $level => $classes) {
            foreach ($classes as $class) {
                $students = Student::where('instansi_id', $instansiId)
                    ->where('class_id', $class->id)
                    ->where('is_active', true)
                    ->get();
                
                if ($students->count() > 0) {
                    $studentsByClass[$class->id] = [
                        'class' => $class,
                        'students' => $students,
                    ];
                }
            }
        }

        $academicYears = AcademicYear::where('instansi_id', $instansiId)->get();

        return view('tenant.promotions.create', compact(
            'currentAcademicYear',
            'nextAcademicYear',
            'currentClasses',
            'nextClasses',
            'studentsByClass',
            'academicYears'
        ));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        $currentSemester = $currentAcademicYear ? $currentAcademicYear->getCurrentSemester() : 2;

        $request->validate([
            'promotions' => 'required|array',
            'promotions.*.student_id' => 'required|exists:students,id',
            'promotions.*.to_class_id' => 'required|exists:class_rooms,id',
            'promotions.*.type' => 'required|in:promotion,repeat,transfer',
            'promotions.*.reason' => 'nullable|string|max:500',
            'to_academic_year_id' => 'required|exists:academic_years,id',
        ]);

        // Validate semester (biasanya naik kelas dilakukan di semester genap)
        if ($currentSemester != 2) {
            return redirect()->back()
                ->with('warning', 'Naik kelas biasanya dilakukan di semester Genap. Semester saat ini: ' . ($currentSemester == 1 ? 'Ganjil' : 'Genap'))
                ->withInput();
        }

        $created = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($request->promotions as $promotionData) {
                $student = Student::findOrFail($promotionData['student_id']);
                
                // Calculate final average from current academic year semester genap
                $finalAverage = $this->calculateFinalAverage($student->id, $currentAcademicYear->id, 2);

                // Check if promotion already exists
                $existing = StudentPromotion::where('student_id', $student->id)
                    ->where('from_academic_year_id', $currentAcademicYear->id)
                    ->where('status', '!=', StudentPromotion::STATUS_CANCELLED)
                    ->first();

                if ($existing) {
                    $errors[] = "Siswa {$student->name} sudah memiliki promotion yang sedang berlangsung.";
                    continue;
                }

                StudentPromotion::create([
                    'student_id' => $student->id,
                    'from_class_id' => $student->class_id,
                    'to_class_id' => $promotionData['to_class_id'],
                    'from_academic_year_id' => $currentAcademicYear->id,
                    'to_academic_year_id' => $request->to_academic_year_id,
                    'semester' => $currentSemester,
                    'status' => StudentPromotion::STATUS_PENDING,
                    'type' => $promotionData['type'],
                    'reason' => $promotionData['reason'] ?? null,
                    'final_average' => $finalAverage,
                    'created_by' => Auth::id(),
                    'instansi_id' => $instansiId,
                ]);

                $created++;
            }

            DB::commit();

            $message = "Berhasil membuat {$created} data naik kelas.";
            if (count($errors) > 0) {
                $message .= " " . implode(" ", array_slice($errors, 0, 3));
                if (count($errors) > 3) {
                    $message .= " dan " . (count($errors) - 3) . " error lainnya.";
                }
            }

            return redirect()->route('tenant.promotions.index')
                ->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Approve promotion
     */
    public function approve(StudentPromotion $promotion)
    {
        $this->authorize('update', $promotion);

        if ($promotion->status != StudentPromotion::STATUS_PENDING) {
            return redirect()->back()
                ->with('error', 'Hanya promotion dengan status pending yang bisa di-approve.');
        }

        $promotion->update([
            'status' => StudentPromotion::STATUS_APPROVED,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Promotion berhasil di-approve.');
    }

    /**
     * Complete promotion (move student to new class)
     */
    public function complete(StudentPromotion $promotion)
    {
        $this->authorize('update', $promotion);

        if ($promotion->status != StudentPromotion::STATUS_APPROVED) {
            return redirect()->back()
                ->with('error', 'Promotion harus di-approve terlebih dahulu sebelum di-complete.');
        }

        DB::beginTransaction();
        try {
            // Update student class
            $student = $promotion->student;
            $student->update([
                'class_id' => $promotion->to_class_id,
            ]);

            // Update promotion status
            $promotion->update([
                'status' => StudentPromotion::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', "Siswa {$student->name} berhasil dipindahkan ke kelas baru.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Bulk complete promotions
     */
    public function bulkComplete(Request $request)
    {
        $request->validate([
            'promotion_ids' => 'required|array',
            'promotion_ids.*' => 'exists:student_promotions,id',
        ]);

        $instansiId = Auth::user()->instansi_id;
        $promotions = StudentPromotion::where('instansi_id', $instansiId)
            ->whereIn('id', $request->promotion_ids)
            ->where('status', StudentPromotion::STATUS_APPROVED)
            ->get();

        if ($promotions->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada promotion yang dapat di-complete.');
        }

        $completed = 0;
        DB::beginTransaction();
        try {
            foreach ($promotions as $promotion) {
                $student = $promotion->student;
                $student->update([
                    'class_id' => $promotion->to_class_id,
                ]);

                $promotion->update([
                    'status' => StudentPromotion::STATUS_COMPLETED,
                    'completed_at' => now(),
                ]);

                $completed++;
            }

            DB::commit();

            return redirect()->back()
                ->with('success', "Berhasil menyelesaikan {$completed} promotion.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Cancel promotion
     */
    public function cancel(StudentPromotion $promotion)
    {
        $this->authorize('update', $promotion);

        if ($promotion->status == StudentPromotion::STATUS_COMPLETED) {
            return redirect()->back()
                ->with('error', 'Promotion yang sudah completed tidak bisa dibatalkan.');
        }

        $promotion->update([
            'status' => StudentPromotion::STATUS_CANCELLED,
        ]);

        return redirect()->back()
            ->with('success', 'Promotion berhasil dibatalkan.');
    }

    /**
     * Get students by class for promotion
     */
    public function getStudentsByClass(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);

        $students = Student::where('instansi_id', $instansiId)
            ->where('class_id', $request->class_id)
            ->where('is_active', true)
            ->with('classRoom')
            ->get();

        // Calculate final average for each student
        $students->transform(function ($student) use ($currentAcademicYear) {
            $student->final_average = $this->calculateFinalAverage(
                $student->id,
                $currentAcademicYear->id,
                2 // Semester genap
            );
            return $student;
        });

        return response()->json($students);
    }

    /**
     * Calculate final average for student
     */
    private function calculateFinalAverage($studentId, $academicYearId, $semester)
    {
        $grades = StudentGrade::where('student_id', $studentId)
            ->where('academic_year_id', $academicYearId)
            ->where('semester', $semester)
            ->whereNotNull('final_score')
            ->get();

        if ($grades->isEmpty()) {
            return null;
        }

        return round($grades->avg('final_score'), 2);
    }
}
