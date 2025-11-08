<?php

namespace App\Services;

use App\Models\Tenant\Institution;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Staff;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Subject;
use App\Models\Tenant\Exam;
use App\Models\Tenant\ExamAttempt;
use App\Models\PPDBApplication;
use App\Models\Tenant\GuestBook;
use App\Models\Tenant\IncomingLetter;
use App\Models\Tenant\OutgoingLetter;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StatisticsExport;

class StatisticsService
{
    /**
     * Statistik overview keseluruhan
     */
    public function getOverviewStatistics()
    {
        return [
            'total_institutions' => Institution::count(),
            'total_students' => Student::count(),
            'total_teachers' => Teacher::count(),
            'total_staff' => Staff::count(),
            'total_classrooms' => ClassRoom::count(),
            'total_subjects' => Subject::count(),
            'total_exams' => Exam::count(),
            'total_ppdb_applications' => PPDBApplication::count(),
            'total_guest_books' => GuestBook::count(),
            'total_incoming_letters' => IncomingLetter::count(),
            'total_outgoing_letters' => OutgoingLetter::count(),
            'active_institutions' => Institution::where('is_active', true)->count(),
            'inactive_institutions' => Institution::where('is_active', false)->count(),
        ];
    }

    /**
     * Statistik institusi
     */
    public function getInstitutionStatistics()
    {
        $institutions = Institution::withCount([
            'students',
            'teachers', 
            'staff',
            'classRooms',
            'subjects'
        ])->get();

        return [
            'by_status' => Institution::select(DB::raw('CASE WHEN is_active = 1 THEN \'active\' ELSE \'inactive\' END as status'), DB::raw('count(*) as total'))
                ->groupBy('is_active')
                ->get(),
            'by_type' => Institution::select('type', DB::raw('count(*) as total'))
                ->groupBy('type')
                ->get(),
            'by_accreditation' => Institution::select('accreditation_status', DB::raw('count(*) as total'))
                ->whereNotNull('accreditation_status')
                ->groupBy('accreditation_status')
                ->get(),
            'top_institutions' => $institutions->sortByDesc('students_count')->take(10),
            'recent_institutions' => Institution::latest()->take(5)->get(),
        ];
    }

    /**
     * Statistik siswa
     */
    public function getStudentStatistics()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            return [
                'by_gender' => collect(),
                'by_class' => collect(),
                'by_institution' => collect(),
                'by_status' => collect(),
                'recent_students' => collect(),
            ];
        }
        
        return [
            'by_gender' => Student::select('gender', DB::raw('count(*) as total'))
                ->groupBy('gender')
                ->get(),
            'by_class' => Student::withoutGlobalScope('instansi')
                ->join('class_rooms', 'students.class_id', '=', 'class_rooms.id')
                ->select('class_rooms.name as class_name', DB::raw('count(students.id) as total'))
                ->where('students.instansi_id', $tenant->id)
                ->groupBy('class_rooms.name')
                ->get(),
            'by_institution' => Student::withoutGlobalScope('instansi')
                ->join('institutions', 'students.instansi_id', '=', 'institutions.instansi_id')
                ->select('institutions.name as institution_name', DB::raw('count(students.id) as total'))
                ->where('students.instansi_id', $tenant->id)
                ->groupBy('institutions.name')
                ->get(),
            'by_status' => Student::select(DB::raw('CASE WHEN is_active = 1 THEN \'active\' ELSE \'inactive\' END as status'), DB::raw('count(*) as total'))
                ->groupBy('is_active')
                ->get(),
            'recent_students' => Student::with('institution')->latest()->take(10)->get(),
        ];
    }

    /**
     * Statistik guru
     */
    public function getTeacherStatistics()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            return [
                'by_gender' => collect(),
                'by_education' => collect(),
                'by_institution' => collect(),
                'by_status' => collect(),
                'recent_teachers' => collect(),
            ];
        }
        
        return [
            'by_gender' => Teacher::select('gender', DB::raw('count(*) as total'))
                ->groupBy('gender')
                ->get(),
            'by_education' => Teacher::select('education_level', DB::raw('count(*) as total'))
                ->groupBy('education_level')
                ->get(),
            'by_institution' => Teacher::withoutGlobalScope('instansi')
                ->join('institutions', 'teachers.instansi_id', '=', 'institutions.instansi_id')
                ->select('institutions.name as institution_name', DB::raw('count(teachers.id) as total'))
                ->where('teachers.instansi_id', $tenant->id)
                ->groupBy('institutions.name')
                ->get(),
            'by_status' => Teacher::select(DB::raw('CASE WHEN is_active = 1 THEN \'active\' ELSE \'inactive\' END as status'), DB::raw('count(*) as total'))
                ->groupBy('is_active')
                ->get(),
            'recent_teachers' => Teacher::with('institution')->latest()->take(10)->get(),
        ];
    }

    /**
     * Statistik staff
     */
    public function getStaffStatistics()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            return [
                'by_gender' => collect(),
                'by_position' => collect(),
                'by_institution' => collect(),
                'by_status' => collect(),
                'recent_staff' => collect(),
            ];
        }
        
        return [
            'by_gender' => Staff::select('gender', DB::raw('count(*) as total'))
                ->groupBy('gender')
                ->get(),
            'by_position' => Staff::select('position', DB::raw('count(*) as total'))
                ->groupBy('position')
                ->get(),
            'by_institution' => Staff::withoutGlobalScope('instansi')
                ->join('institutions', 'staff.instansi_id', '=', 'institutions.instansi_id')
                ->select('institutions.name as institution_name', DB::raw('count(staff.id) as total'))
                ->where('staff.instansi_id', $tenant->id)
                ->groupBy('institutions.name')
                ->get(),
            'by_status' => Staff::select(DB::raw('CASE WHEN is_active = 1 THEN \'active\' ELSE \'inactive\' END as status'), DB::raw('count(*) as total'))
                ->groupBy('is_active')
                ->get(),
            'recent_staff' => Staff::with('institution')->latest()->take(10)->get(),
        ];
    }

    /**
     * Statistik akademik
     */
    public function getAcademicStatistics()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            return [
                'total_exams' => 0,
                'completed_exams' => 0,
                'ongoing_exams' => 0,
                'total_exam_results' => 0,
                'average_scores' => collect(),
                'by_subject' => collect(),
                'by_class' => collect(),
                'recent_exams' => collect(),
            ];
        }
        
        return [
            'total_exams' => Exam::count(),
            'completed_exams' => Exam::where('status', 'completed')->count(),
            'ongoing_exams' => Exam::where('status', 'ongoing')->count(),
            'total_exam_results' => ExamAttempt::count(),
            'average_scores' => ExamAttempt::select('exam_id', DB::raw('AVG(score) as average_score'))
                ->groupBy('exam_id')
                ->with('exam')
                ->get(),
            'by_subject' => Subject::select('subjects.*', DB::raw('COUNT(exam_subjects.exam_id) as exams_count'))
                ->leftJoin('exam_subjects', function($join) use ($tenant) {
                    $join->on('subjects.id', '=', 'exam_subjects.subject_id')
                         ->where('exam_subjects.instansi_id', '=', $tenant->id);
                })
                ->where('subjects.instansi_id', $tenant->id)
                ->groupBy('subjects.id')
                ->get(),
            'by_class' => ClassRoom::withoutGlobalScope('instansi')
                ->select('class_rooms.*', DB::raw('COUNT(exam_schedules.exam_id) as exams_count'))
                ->leftJoin('exam_schedules', function($join) use ($tenant) {
                    $join->on('class_rooms.id', '=', 'exam_schedules.class_id')
                         ->where('exam_schedules.instansi_id', '=', $tenant->id);
                })
                ->where('class_rooms.instansi_id', $tenant->id)
                ->groupBy('class_rooms.id')
                ->get(),
            'recent_exams' => Exam::with(['subjects', 'classRooms'])->latest()->take(10)->get(),
        ];
    }

    /**
     * Aktivitas terbaru
     */
    public function getRecentActivities()
    {
        $activities = collect();
        
        // Recent students
        $recentStudents = Student::with('institution')->latest()->take(5)->get()
            ->map(function($student) {
                $institutionName = $student->institution ? $student->institution->name : 'Tidak diketahui';
                return [
                    'type' => 'student',
                    'description' => "Siswa baru: {$student->name} di {$institutionName}",
                    'date' => $student->created_at,
                ];
            });
        
        // Recent teachers
        $recentTeachers = Teacher::with('institution')->latest()->take(5)->get()
            ->map(function($teacher) {
                $institutionName = $teacher->institution ? $teacher->institution->name : 'Tidak diketahui';
                return [
                    'type' => 'teacher',
                    'description' => "Guru baru: {$teacher->name} di {$institutionName}",
                    'date' => $teacher->created_at,
                ];
            });
        
        // Recent institutions
        $recentInstitutions = Institution::latest()->take(5)->get()
            ->map(function($institution) {
                return [
                    'type' => 'institution',
                    'description' => "Institusi baru: {$institution->name}",
                    'date' => $institution->created_at,
                ];
            });
        
        return $activities
            ->merge($recentStudents)
            ->merge($recentTeachers)
            ->merge($recentInstitutions)
            ->sortByDesc('date')
            ->take(15);
    }

    /**
     * Trend bulanan
     */
    public function getMonthlyTrends()
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $months[] = Carbon::now()->subMonths($i)->format('Y-m');
        }
        
        $trends = [];
        foreach ($months as $month) {
            $trends[] = [
                'month' => Carbon::parse($month)->format('M Y'),
                'students' => Student::whereYear('created_at', Carbon::parse($month)->year)
                    ->whereMonth('created_at', Carbon::parse($month)->month)
                    ->count(),
                'teachers' => Teacher::whereYear('created_at', Carbon::parse($month)->year)
                    ->whereMonth('created_at', Carbon::parse($month)->month)
                    ->count(),
                'institutions' => Institution::whereYear('created_at', Carbon::parse($month)->year)
                    ->whereMonth('created_at', Carbon::parse($month)->month)
                    ->count(),
            ];
        }
        
        return $trends;
    }

    /**
     * Data grafik institusi
     */
    public function getInstitutionChartData($period = '12months')
    {
        $months = $this->getPeriodMonths($period);
        $data = [];
        
        foreach ($months as $month) {
            $data[] = [
                'month' => $month['label'],
                'total' => Institution::whereYear('created_at', $month['year'])
                    ->whereMonth('created_at', $month['month'])
                    ->count(),
            ];
        }
        
        return $data;
    }

    /**
     * Data grafik siswa
     */
    public function getStudentChartData($period = '12months')
    {
        $months = $this->getPeriodMonths($period);
        $data = [];
        
        foreach ($months as $month) {
            $data[] = [
                'month' => $month['label'],
                'total' => Student::whereYear('created_at', $month['year'])
                    ->whereMonth('created_at', $month['month'])
                    ->count(),
            ];
        }
        
        return $data;
    }

    /**
     * Data grafik guru
     */
    public function getTeacherChartData($period = '12months')
    {
        $months = $this->getPeriodMonths($period);
        $data = [];
        
        foreach ($months as $month) {
            $data[] = [
                'month' => $month['label'],
                'total' => Teacher::whereYear('created_at', $month['year'])
                    ->whereMonth('created_at', $month['month'])
                    ->count(),
            ];
        }
        
        return $data;
    }

    /**
     * Data grafik akademik
     */
    public function getAcademicChartData($period = '12months')
    {
        $months = $this->getPeriodMonths($period);
        $data = [];
        
        foreach ($months as $month) {
            $data[] = [
                'month' => $month['label'],
                'exams' => Exam::whereYear('created_at', $month['year'])
                    ->whereMonth('created_at', $month['month'])
                    ->count(),
                'results' => ExamAttempt::whereYear('created_at', $month['year'])
                    ->whereMonth('created_at', $month['month'])
                    ->count(),
            ];
        }
        
        return $data;
    }

    /**
     * Statistik detail institusi
     */
    public function getDetailedInstitutionStatistics()
    {
        return Institution::withCount([
            'students',
            'teachers',
            'staff',
            'classRooms',
            'subjects',
            'exams'
        ])->get();
    }

    /**
     * Statistik detail siswa
     */
    public function getDetailedStudentStatistics()
    {
        return Student::with(['institution', 'classRoom'])
            ->select('*', DB::raw('YEAR(created_at) as year'))
            ->get()
            ->groupBy('year');
    }

    /**
     * Statistik detail guru
     */
    public function getDetailedTeacherStatistics()
    {
        return Teacher::with(['institution'])
            ->select('*', DB::raw('YEAR(created_at) as year'))
            ->get()
            ->groupBy('year');
    }

    /**
     * Statistik detail akademik
     */
    public function getDetailedAcademicStatistics()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            return [
                'exams_by_month' => collect(),
                'results_by_month' => collect(),
                'subjects_performance' => collect(),
            ];
        }
        
        return [
            'exams_by_month' => Exam::select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('count(*) as total')
            )->groupBy('year', 'month')->get(),
            'results_by_month' => ExamAttempt::select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('count(*) as total'),
                DB::raw('AVG(score) as average_score')
            )->groupBy('year', 'month')->get(),
            'subjects_performance' => Subject::select('subjects.*', DB::raw('COUNT(DISTINCT exam_subjects.exam_id) as exams_count'))
                ->leftJoin('exam_subjects', function($join) use ($tenant) {
                    $join->on('subjects.id', '=', 'exam_subjects.subject_id')
                         ->where('exam_subjects.instansi_id', '=', $tenant->id);
                })
                ->leftJoin('exams', function($join) use ($tenant) {
                    $join->on('exam_subjects.exam_id', '=', 'exams.id')
                         ->where('exams.instansi_id', '=', $tenant->id);
                })
                ->leftJoin('exam_attempts', function($join) use ($tenant) {
                    $join->on('exams.id', '=', 'exam_attempts.exam_id')
                         ->where('exam_attempts.instansi_id', '=', $tenant->id);
                })
                ->where('subjects.instansi_id', $tenant->id)
                ->groupBy('subjects.id')
                ->selectRaw('COUNT(DISTINCT exam_attempts.id) as attempts_count')
                ->get(),
        ];
    }

    /**
     * Export statistik
     */
    public function exportStatistics($type, $format)
    {
        $data = [];
        
        switch ($type) {
            case 'overview':
                $data = $this->getOverviewStatistics();
                break;
            case 'institutions':
                $data = $this->getDetailedInstitutionStatistics();
                break;
            case 'students':
                $data = $this->getDetailedStudentStatistics();
                break;
            case 'teachers':
                $data = $this->getDetailedTeacherStatistics();
                break;
            case 'academic':
                $data = $this->getDetailedAcademicStatistics();
                break;
        }
        
        return Excel::download(new StatisticsExport($data, $type), "statistics_{$type}.xlsx");
    }

    /**
     * Helper untuk mendapatkan periode bulan
     */
    private function getPeriodMonths($period)
    {
        $months = [];
        $count = $period === '12months' ? 12 : ($period === '6months' ? 6 : 3);
        
        for ($i = $count - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = [
                'year' => $date->year,
                'month' => $date->month,
                'label' => $date->format('M Y'),
            ];
        }
        
        return $months;
    }
}
