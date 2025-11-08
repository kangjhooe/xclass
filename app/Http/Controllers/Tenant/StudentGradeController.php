<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\StudentGrade;
use App\Models\Tenant\Student;
use App\Models\Tenant\Subject;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\AcademicYear;
use App\Models\Tenant\GradeWeight;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentGradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        
        // Get current active academic year
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        // Hanya admin yang bisa melihat data tahun pelajaran lain (untuk keperluan laporan/audit)
        // Guru dan siswa hanya melihat tahun pelajaran aktif
        $academicYearId = null;
        if (Auth::user()->role === 'school_admin' && $request->academic_year_id) {
            // Admin bisa pilih tahun pelajaran lain jika diperlukan
            $academicYearId = $request->academic_year_id;
        } elseif ($currentAcademicYear) {
            // Otomatis menggunakan tahun pelajaran aktif
            $academicYearId = $currentAcademicYear->id;
        }

        $query = StudentGrade::with(['student', 'subject', 'teacher', 'academicYear'])
            ->where('instansi_id', $instansiId);

        // Filter by academic year (otomatis tahun pelajaran aktif)
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        // Filter by semester (otomatis semester aktif)
        $currentSemester = null;
        if (Auth::user()->role === 'school_admin' && $request->semester) {
            // Admin bisa pilih semester lain jika diperlukan
            $currentSemester = $request->semester;
        } elseif ($currentAcademicYear) {
            // Otomatis menggunakan semester aktif
            $currentSemester = $currentAcademicYear->getCurrentSemester();
        }
        
        if ($currentSemester) {
            $query->where('semester', $currentSemester);
        }

        // Filter by subject
        if ($request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by student
        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        $studentGrades = $query->orderBy('created_at', 'desc')->paginate(20);

        // Hanya tampilkan semua tahun pelajaran untuk admin (untuk filter opsional)
        $academicYears = Auth::user()->role === 'school_admin' 
            ? AcademicYear::where('instansi_id', $instansiId)->get()
            : collect([$currentAcademicYear])->filter();
            
        $subjects = Subject::where('instansi_id', $instansiId)->get();
        $students = Student::where('instansi_id', $instansiId)->get();

        return view('tenant.student-grades.index', compact(
            'studentGrades', 
            'academicYears', 
            'subjects', 
            'students',
            'currentAcademicYear',
            'academicYearId',
            'currentSemester'
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $instansiId = Auth::user()->instansi_id;
        
        // Otomatis gunakan tahun pelajaran aktif untuk input nilai baru
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        if (!$currentAcademicYear) {
            return redirect()->route('tenant.student-grades.index')
                ->with('error', 'Tidak ada tahun pelajaran yang aktif. Silakan aktifkan tahun pelajaran terlebih dahulu.');
        }

        $academicYears = AcademicYear::where('instansi_id', $instansiId)->get();
        $subjects = Subject::where('instansi_id', $instansiId)->get();
        $students = Student::where('instansi_id', $instansiId)->get();
        $teachers = Teacher::where('instansi_id', $instansiId)->get();
        $assignmentTypes = StudentGrade::getAssignmentTypes();

        return view('tenant.student-grades.create', compact(
            'academicYears', 
            'subjects', 
            'students', 
            'teachers', 
            'assignmentTypes',
            'currentAcademicYear'
        ));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        // Validasi
        $rules = [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'assignment_type' => 'required|string',
            'assignment_name' => 'required|string|max:255',
            'score' => 'nullable|numeric|min:0',
            'max_score' => 'required|numeric|min:1',
            'notes' => 'nullable|string',
        ];
        
        // Hanya admin yang bisa input ke tahun pelajaran lain
        if (Auth::user()->role === 'school_admin' && $request->academic_year_id) {
            $rules['academic_year_id'] = 'required|exists:academic_years,id';
        }
        
        // Hanya admin yang bisa input ke semester lain
        if (Auth::user()->role === 'school_admin' && $request->semester) {
            $rules['semester'] = 'required|integer|in:1,2';
        }
        
        $request->validate($rules);
        
        // Otomatis gunakan tahun pelajaran aktif jika tidak diisi (untuk guru)
        $academicYearId = $request->academic_year_id ?? ($currentAcademicYear ? $currentAcademicYear->id : null);
        
        if (!$academicYearId) {
            return redirect()->back()
                ->with('error', 'Tidak ada tahun pelajaran yang aktif. Silakan aktifkan tahun pelajaran terlebih dahulu.')
                ->withInput();
        }
        
        // Otomatis gunakan semester aktif jika tidak diisi (untuk guru)
        $semester = $request->semester ?? ($currentAcademicYear ? $currentAcademicYear->getCurrentSemester() : 1);

        // Get weight for assignment type
        $gradeWeight = GradeWeight::where('instansi_id', Auth::user()->instansi_id)
            ->where('assignment_type', $request->assignment_type)
            ->where('is_active', true)
            ->first();

        $weight = $gradeWeight ? $gradeWeight->weight_percentage / 100 : 1.0;

        $studentGrade = StudentGrade::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'teacher_id' => $request->teacher_id,
            'academic_year_id' => $academicYearId,
            'semester' => $semester,
            'assignment_type' => $request->assignment_type,
            'assignment_name' => $request->assignment_name,
            'score' => $request->score,
            'max_score' => $request->max_score,
            'weight' => $weight,
            'notes' => $request->notes,
            'instansi_id' => $instansiId,
        ]);

        // Calculate final score
        $studentGrade->calculateFinalScore();

        return redirect()->route('tenant.student-grades.index')
            ->with('success', 'Nilai berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(StudentGrade $studentGrade)
    {
        $this->authorize('view', $studentGrade);
        
        return view('tenant.student-grades.show', compact('studentGrade'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(StudentGrade $studentGrade)
    {
        $this->authorize('update', $studentGrade);
        
        $academicYears = AcademicYear::where('instansi_id', Auth::user()->instansi_id)->get();
        $subjects = Subject::where('instansi_id', Auth::user()->instansi_id)->get();
        $students = Student::where('instansi_id', Auth::user()->instansi_id)->get();
        $teachers = Teacher::where('instansi_id', Auth::user()->instansi_id)->get();
        $assignmentTypes = StudentGrade::getAssignmentTypes();

        return view('tenant.student-grades.edit', compact('studentGrade', 'academicYears', 'subjects', 'students', 'teachers', 'assignmentTypes'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StudentGrade $studentGrade)
    {
        $this->authorize('update', $studentGrade);

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'semester' => 'required|integer|in:1,2',
            'assignment_type' => 'required|string',
            'assignment_name' => 'required|string|max:255',
            'score' => 'nullable|numeric|min:0',
            'max_score' => 'required|numeric|min:1',
            'notes' => 'nullable|string',
        ]);

        // Get weight for assignment type
        $gradeWeight = GradeWeight::where('instansi_id', Auth::user()->instansi_id)
            ->where('assignment_type', $request->assignment_type)
            ->where('is_active', true)
            ->first();

        $weight = $gradeWeight ? $gradeWeight->weight_percentage / 100 : 1.0;

        $studentGrade->update([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'teacher_id' => $request->teacher_id,
            'academic_year_id' => $request->academic_year_id,
            'semester' => $request->semester,
            'assignment_type' => $request->assignment_type,
            'assignment_name' => $request->assignment_name,
            'score' => $request->score,
            'max_score' => $request->max_score,
            'weight' => $weight,
            'notes' => $request->notes,
        ]);

        // Recalculate final score
        $studentGrade->calculateFinalScore();

        return redirect()->route('tenant.student-grades.index')
            ->with('success', 'Nilai berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StudentGrade $studentGrade)
    {
        $this->authorize('delete', $studentGrade);

        $studentGrade->delete();

        return redirect()->route('tenant.student-grades.index')
            ->with('success', 'Nilai berhasil dihapus.');
    }

    /**
     * Bulk input grades
     */
    public function bulkInput()
    {
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        if (!$currentAcademicYear) {
            return redirect()->route('tenant.student-grades.index')
                ->with('error', 'Tidak ada tahun pelajaran yang aktif. Silakan aktifkan tahun pelajaran terlebih dahulu.');
        }
        
        $academicYears = AcademicYear::where('instansi_id', $instansiId)->get();
        $subjects = Subject::where('instansi_id', $instansiId)->get();
        $teachers = Teacher::where('instansi_id', $instansiId)->get();
        $assignmentTypes = StudentGrade::getAssignmentTypes();

        return view('tenant.student-grades.bulk-input', compact(
            'academicYears', 
            'subjects', 
            'teachers', 
            'assignmentTypes',
            'currentAcademicYear'
        ));
    }

    /**
     * Store bulk grades
     */
    public function storeBulk(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        $rules = [
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'assignment_type' => 'required|string',
            'assignment_name' => 'required|string|max:255',
            'max_score' => 'required|numeric|min:1',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:students,id',
            'grades.*.score' => 'nullable|numeric|min:0',
        ];
        
        // Hanya admin yang bisa input ke tahun pelajaran lain
        if (Auth::user()->role === 'school_admin' && $request->academic_year_id) {
            $rules['academic_year_id'] = 'required|exists:academic_years,id';
        }
        
        // Hanya admin yang bisa input ke semester lain
        if (Auth::user()->role === 'school_admin' && $request->semester) {
            $rules['semester'] = 'required|integer|in:1,2';
        }
        
        $request->validate($rules);
        
        // Otomatis gunakan tahun pelajaran aktif jika tidak diisi
        $academicYearId = $request->academic_year_id ?? ($currentAcademicYear ? $currentAcademicYear->id : null);
        
        if (!$academicYearId) {
            return redirect()->back()
                ->with('error', 'Tidak ada tahun pelajaran yang aktif. Silakan aktifkan tahun pelajaran terlebih dahulu.')
                ->withInput();
        }
        
        // Otomatis gunakan semester aktif jika tidak diisi
        $semester = $request->semester ?? ($currentAcademicYear ? $currentAcademicYear->getCurrentSemester() : 1);

        $gradeWeight = GradeWeight::where('instansi_id', $instansiId)
            ->where('assignment_type', $request->assignment_type)
            ->where('is_active', true)
            ->first();

        $weight = $gradeWeight ? $gradeWeight->weight_percentage / 100 : 1.0;

        $created = 0;
        foreach ($request->grades as $gradeData) {
            if (!empty($gradeData['score'])) {
                $studentGrade = StudentGrade::create([
                    'student_id' => $gradeData['student_id'],
                    'subject_id' => $request->subject_id,
                    'teacher_id' => $request->teacher_id,
                    'academic_year_id' => $academicYearId,
                    'semester' => $semester,
                    'assignment_type' => $request->assignment_type,
                    'assignment_name' => $request->assignment_name,
                    'score' => $gradeData['score'],
                    'max_score' => $request->max_score,
                    'weight' => $weight,
                    'instansi_id' => $instansiId,
                ]);

                $studentGrade->calculateFinalScore();
                $created++;
            }
        }

        return redirect()->route('tenant.student-grades.index')
            ->with('success', "Berhasil menambahkan {$created} nilai.");
    }

    /**
     * Get students by class for bulk input
     */
    public function getStudentsByClass(Request $request)
    {
        $students = Student::where('instansi_id', Auth::user()->instansi_id)
            ->where('class_id', $request->class_id)
            ->get();

        return response()->json($students);
    }
}
