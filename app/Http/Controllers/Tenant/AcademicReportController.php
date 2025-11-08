<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\StudentGrade;
use App\Models\Tenant\Student;
use App\Models\Tenant\Subject;
use App\Models\Tenant\AcademicYear;
use App\Models\Tenant\ClassRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class AcademicReportController extends Controller
{
    /**
     * Dashboard laporan akademik
     */
    public function dashboard()
    {
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);

        $totalStudents = Student::where('instansi_id', $instansiId)->count();
        $totalSubjects = Subject::where('instansi_id', $instansiId)->count();
        
        // Hanya hitung nilai dari tahun pelajaran aktif
        $totalGrades = $currentAcademicYear 
            ? StudentGrade::where('instansi_id', $instansiId)
                ->where('academic_year_id', $currentAcademicYear->id)
                ->count()
            : 0;

        // Statistik nilai per semester
        $semester1Stats = $this->getSemesterStats(1, $currentAcademicYear?->id);
        $semester2Stats = $this->getSemesterStats(2, $currentAcademicYear?->id);

        return view('tenant.academic-reports.dashboard', compact(
            'currentAcademicYear',
            'totalStudents',
            'totalSubjects',
            'totalGrades',
            'semester1Stats',
            'semester2Stats'
        ));
    }

    /**
     * Rekap nilai per kelas
     */
    public function classReport(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        // Hanya admin yang bisa melihat laporan tahun pelajaran lain
        $academicYearId = null;
        if (Auth::user()->role === 'school_admin' && $request->academic_year_id) {
            $academicYearId = $request->academic_year_id;
        } elseif ($currentAcademicYear) {
            // Otomatis gunakan tahun pelajaran aktif
            $academicYearId = $currentAcademicYear->id;
        }
        
        // Hanya tampilkan semua tahun pelajaran untuk admin
        $academicYears = Auth::user()->role === 'school_admin' 
            ? AcademicYear::where('instansi_id', $instansiId)->get()
            : collect([$currentAcademicYear])->filter();
            
        $classes = ClassRoom::where('instansi_id', $instansiId)->get();
        
        // Filter by semester (otomatis semester aktif)
        $semester = null;
        if (Auth::user()->role === 'school_admin' && $request->semester) {
            // Admin bisa pilih semester lain jika diperlukan
            $semester = $request->semester;
        } elseif ($currentAcademicYear) {
            // Otomatis menggunakan semester aktif
            $semester = $currentAcademicYear->getCurrentSemester();
        } else {
            $semester = 1; // default
        }
        
        $classId = $request->class_id;

        $query = StudentGrade::with(['student', 'subject'])
            ->where('instansi_id', $instansiId);
            
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }
        
        if ($semester) {
            $query->where('semester', $semester);
        }

        if ($classId) {
            $query->whereHas('student', function($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        $grades = $query->get()->groupBy('student_id');

        return view('tenant.academic-reports.class-report', compact(
            'academicYears',
            'classes',
            'academicYearId',
            'semester',
            'classId',
            'grades'
        ));
    }

    /**
     * Rekap nilai per siswa
     */
    public function studentReport(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        // Hanya admin yang bisa melihat laporan tahun pelajaran lain
        $academicYearId = null;
        if (Auth::user()->role === 'school_admin' && $request->academic_year_id) {
            $academicYearId = $request->academic_year_id;
        } elseif ($currentAcademicYear) {
            // Otomatis gunakan tahun pelajaran aktif
            $academicYearId = $currentAcademicYear->id;
        }
        
        // Hanya tampilkan semua tahun pelajaran untuk admin
        $academicYears = Auth::user()->role === 'school_admin' 
            ? AcademicYear::where('instansi_id', $instansiId)->get()
            : collect([$currentAcademicYear])->filter();
            
        $students = Student::where('instansi_id', $instansiId)->get();
        
        // Filter by semester (otomatis semester aktif)
        $semester = null;
        if (Auth::user()->role === 'school_admin' && $request->semester) {
            // Admin bisa pilih semester lain jika diperlukan
            $semester = $request->semester;
        } elseif ($currentAcademicYear) {
            // Otomatis menggunakan semester aktif
            $semester = $currentAcademicYear->getCurrentSemester();
        } else {
            $semester = 1; // default
        }
        
        $studentId = $request->student_id;

        if ($studentId && $academicYearId && $semester) {
            $student = Student::find($studentId);
            $grades = StudentGrade::with(['subject', 'teacher'])
                ->where('instansi_id', $instansiId)
                ->where('academic_year_id', $academicYearId)
                ->where('semester', $semester)
                ->where('student_id', $studentId)
                ->get()
                ->groupBy('subject_id');

            return view('tenant.academic-reports.student-report', compact(
                'academicYears',
                'students',
                'academicYearId',
                'semester',
                'studentId',
                'student',
                'grades'
            ));
        }

        return view('tenant.academic-reports.student-report', compact(
            'academicYears',
            'students',
            'academicYearId',
            'semester',
            'studentId'
        ));
    }

    /**
     * Cetak rapor PDF
     */
    public function printReport(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'semester' => 'required|integer|in:1,2',
        ]);

        $student = Student::with(['classRoom'])->find($request->student_id);
        $academicYear = AcademicYear::find($request->academic_year_id);

        $instansiId = Auth::user()->instansi_id;
        $grades = StudentGrade::with(['subject', 'teacher'])
            ->where('instansi_id', $instansiId)
            ->where('academic_year_id', $request->academic_year_id)
            ->where('semester', $request->semester)
            ->where('student_id', $request->student_id)
            ->get()
            ->groupBy('subject_id');

        // Hitung rata-rata per mata pelajaran
        $subjectAverages = [];
        foreach ($grades as $subjectId => $subjectGrades) {
            $subjectAverages[$subjectId] = [
                'subject' => $subjectGrades->first()->subject,
                'average' => $subjectGrades->avg('final_score'),
                'letter_grade' => $this->getLetterGrade($subjectGrades->avg('final_score')),
                'teacher' => $subjectGrades->first()->teacher,
            ];
        }

        // Hitung rata-rata keseluruhan
        $overallAverage = collect($subjectAverages)->avg('average');
        $overallLetterGrade = $this->getLetterGrade($overallAverage);

        $pdf = Pdf::loadView('tenant.academic-reports.print-report', compact(
            'student',
            'academicYear',
            'subjectAverages',
            'overallAverage',
            'overallLetterGrade'
        ) + ['semester' => $request->semester]);

        return $pdf->download("rapor_{$student->name}_{$academicYear->year_name}_semester_{$request->semester}.pdf");
    }

    /**
     * Export data nilai ke Excel
     */
    public function exportGrades(Request $request)
    {
        $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'semester' => 'required|integer|in:1,2',
            'class_id' => 'nullable|exists:class_rooms,id',
        ]);

        $instansiId = Auth::user()->instansi_id;
        $query = StudentGrade::with(['student', 'subject', 'teacher'])
            ->where('instansi_id', $instansiId)
            ->where('academic_year_id', $request->academic_year_id)
            ->where('semester', $request->semester);

        if ($request->class_id) {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        $grades = $query->get();

        $filename = "data-nilai-" . now()->format('Y-m-d_H-i-s') . ".xlsx";
        
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\StudentGradeExport($grades),
            $filename
        );
    }

    /**
     * Get semester statistics
     */
    private function getSemesterStats($semester, $academicYearId)
    {
        if (!$academicYearId) {
            return [
                'total_grades' => 0,
                'average_score' => 0,
                'passed_count' => 0,
                'failed_count' => 0,
            ];
        }

        $instansiId = Auth::user()->instansi_id;
        $grades = StudentGrade::where('instansi_id', $instansiId)
            ->where('academic_year_id', $academicYearId)
            ->where('semester', $semester)
            ->whereNotNull('final_score')
            ->get();

        return [
            'total_grades' => $grades->count(),
            'average_score' => round($grades->avg('final_score'), 2),
            'passed_count' => $grades->where('is_passed', true)->count(),
            'failed_count' => $grades->where('is_passed', false)->count(),
        ];
    }

    /**
     * Get letter grade from score
     */
    private function getLetterGrade($score)
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'E';
    }
}
