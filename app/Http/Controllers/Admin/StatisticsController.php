<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\StatisticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    protected $statisticsService;

    public function __construct(StatisticsService $statisticsService)
    {
        $this->statisticsService = $statisticsService;
    }

    /**
     * Dashboard statistik utama
     */
    public function index()
    {
        $data = [
            'overview' => $this->statisticsService->getOverviewStatistics(),
            'institutions' => $this->statisticsService->getInstitutionStatistics(),
            'students' => $this->statisticsService->getStudentStatistics(),
            'teachers' => $this->statisticsService->getTeacherStatistics(),
            'staff' => $this->statisticsService->getStaffStatistics(),
            'academic' => $this->statisticsService->getAcademicStatistics(),
            'recent_activities' => $this->statisticsService->getRecentActivities(),
            'monthly_trends' => $this->statisticsService->getMonthlyTrends(),
        ];

        return view('admin.statistics.index', compact('data'));
    }

    /**
     * Statistik detail institusi
     */
    public function institutions()
    {
        $institutions = $this->statisticsService->getDetailedInstitutionStatistics();
        return view('admin.statistics.institutions', compact('institutions'));
    }

    /**
     * Statistik detail siswa
     */
    public function students()
    {
        $students = $this->statisticsService->getDetailedStudentStatistics();
        return view('admin.statistics.students', compact('students'));
    }

    /**
     * Statistik detail guru
     */
    public function teachers()
    {
        $teachers = $this->statisticsService->getDetailedTeacherStatistics();
        return view('admin.statistics.teachers', compact('teachers'));
    }

    /**
     * Statistik akademik
     */
    public function academic()
    {
        $academic = $this->statisticsService->getDetailedAcademicStatistics();
        return view('admin.statistics.academic', compact('academic'));
    }

    /**
     * Export data statistik
     */
    public function export(Request $request)
    {
        $type = $request->get('type', 'overview');
        $format = $request->get('format', 'excel');
        
        return $this->statisticsService->exportStatistics($type, $format);
    }

    /**
     * API untuk data grafik
     */
    public function chartData(Request $request)
    {
        $type = $request->get('type');
        $period = $request->get('period', '12months');
        
        switch ($type) {
            case 'institutions':
                return response()->json($this->statisticsService->getInstitutionChartData($period));
            case 'students':
                return response()->json($this->statisticsService->getStudentChartData($period));
            case 'teachers':
                return response()->json($this->statisticsService->getTeacherChartData($period));
            case 'academic':
                return response()->json($this->statisticsService->getAcademicChartData($period));
            default:
                return response()->json(['error' => 'Invalid chart type'], 400);
        }
    }
}
