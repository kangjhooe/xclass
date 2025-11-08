<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get report statistics
        $stats = [
            'total_students' => DB::table('students')->where('instansi_id', $instansiId)->count(),
            'total_teachers' => DB::table('teachers')->where('instansi_id', $instansiId)->count(),
            'total_classes' => DB::table('class_rooms')->where('instansi_id', $instansiId)->count(),
            'total_subjects' => DB::table('subjects')->where('instansi_id', $instansiId)->count(),
            'total_budget' => DB::table('budgets')->where('instansi_id', $instansiId)->sum('amount'),
            'total_expenses' => DB::table('expenses')->where('instansi_id', $instansiId)->sum('amount'),
        ];

        return view('tenant.report.index', [
            'title' => 'Laporan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => null]
            ],
            'stats' => $stats
        ]);
    }

    /**
     * Display academic reports
     */
    public function academic(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        // Get academic statistics
        $stats = [
            'total_students' => DB::table('students')->where('instansi_id', $instansiId)->count(),
            'active_students' => DB::table('students')->where('instansi_id', $instansiId)->where('status', 'active')->count(),
            'total_classes' => DB::table('class_rooms')->where('instansi_id', $instansiId)->count(),
            'total_subjects' => DB::table('subjects')->where('instansi_id', $instansiId)->count(),
        ];

        // Get student distribution by class
        $studentDistribution = DB::table('students')
            ->leftJoin('class_rooms', 'students.class_room_id', '=', 'class_rooms.id')
            ->where('students.instansi_id', $instansiId)
            ->select('class_rooms.name as class_name', DB::raw('COUNT(students.id) as student_count'))
            ->groupBy('class_rooms.id', 'class_rooms.name')
            ->get();

        // Get grade distribution
        $gradeDistribution = DB::table('student_grades')
            ->leftJoin('students', 'student_grades.student_id', '=', 'students.id')
            ->where('students.instansi_id', $instansiId)
            ->select('student_grades.grade', DB::raw('COUNT(*) as count'))
            ->groupBy('student_grades.grade')
            ->get();

        return view('tenant.report.academic', [
            'title' => 'Laporan Akademik',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => tenant_route('tenant.report.index')],
                ['name' => 'Laporan Akademik', 'url' => null]
            ],
            'stats' => $stats,
            'studentDistribution' => $studentDistribution,
            'gradeDistribution' => $gradeDistribution
        ]);
    }

    /**
     * Display financial reports
     */
    public function financial(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        // Get financial statistics
        $stats = [
            'total_budget' => DB::table('budgets')->where('instansi_id', $instansiId)->sum('amount'),
            'total_expenses' => DB::table('expenses')->where('instansi_id', $instansiId)->sum('amount'),
            'this_month_expenses' => DB::table('expenses')
                ->where('instansi_id', $instansiId)
                ->whereMonth('expense_date', now()->month)
                ->whereYear('expense_date', now()->year)
                ->sum('amount'),
            'budget_utilization' => 0,
        ];

        if ($stats['total_budget'] > 0) {
            $stats['budget_utilization'] = round(($stats['total_expenses'] / $stats['total_budget']) * 100, 2);
        }

        // Get expense by category
        $expenseByCategory = DB::table('expenses')
            ->leftJoin('expense_categories', 'expenses.expense_category_id', '=', 'expense_categories.id')
            ->where('expenses.instansi_id', $instansiId)
            ->select('expense_categories.name as category_name', DB::raw('SUM(expenses.amount) as total_amount'))
            ->groupBy('expense_categories.id', 'expense_categories.name')
            ->get();

        // Get monthly expenses for the current year
        $monthlyExpenses = DB::table('expenses')
            ->where('instansi_id', $instansiId)
            ->whereYear('expense_date', now()->year)
            ->select(DB::raw('MONTH(expense_date) as month'), DB::raw('SUM(amount) as total'))
            ->groupBy(DB::raw('MONTH(expense_date)'))
            ->get();

        return view('tenant.report.financial', [
            'title' => 'Laporan Keuangan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => tenant_route('tenant.report.index')],
                ['name' => 'Laporan Keuangan', 'url' => null]
            ],
            'stats' => $stats,
            'expenseByCategory' => $expenseByCategory,
            'monthlyExpenses' => $monthlyExpenses
        ]);
    }

    /**
     * Generate student report
     */
    public function generateStudentReport(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'class_id' => 'nullable|exists:class_rooms,id',
            'status' => 'nullable|in:active,inactive,graduated',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        $query = DB::table('students')
            ->leftJoin('class_rooms', 'students.class_room_id', '=', 'class_rooms.id')
            ->where('students.instansi_id', $instansiId);

        if ($request->filled('class_id')) {
            $query->where('students.class_room_id', $request->class_id);
        }

        if ($request->filled('status')) {
            $query->where('students.status', $request->status);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('students.created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('students.created_at', '<=', $request->end_date);
        }

        $students = $query->select('students.*', 'class_rooms.name as class_name')
            ->orderBy('students.name')
            ->get();

        return view('tenant.report.students', [
            'title' => 'Laporan Siswa',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => tenant_route('tenant.report.index')],
                ['name' => 'Laporan Siswa', 'url' => null]
            ],
            'students' => $students,
            'filters' => $request->all()
        ]);
    }

    /**
     * Generate attendance report
     */
    public function generateAttendanceReport(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'class_id' => 'nullable|exists:class_rooms,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date'
        ]);

        $query = DB::table('attendances')
            ->leftJoin('students', 'attendances.student_id', '=', 'students.id')
            ->leftJoin('class_rooms', 'students.class_room_id', '=', 'class_rooms.id')
            ->where('attendances.instansi_id', $instansiId)
            ->whereBetween('attendances.attendance_date', [$request->start_date, $request->end_date]);

        if ($request->filled('class_id')) {
            $query->where('students.class_room_id', $request->class_id);
        }

        $attendances = $query->select('attendances.*', 'students.name as student_name', 'class_rooms.name as class_name')
            ->orderBy('attendances.attendance_date')
            ->orderBy('students.name')
            ->get();

        // Calculate attendance statistics
        $stats = [
            'total_attendance' => $attendances->count(),
            'present' => $attendances->where('status', 'present')->count(),
            'absent' => $attendances->where('status', 'absent')->count(),
            'late' => $attendances->where('status', 'late')->count(),
        ];

        return view('tenant.report.attendance', [
            'title' => 'Laporan Kehadiran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => tenant_route('tenant.report.index')],
                ['name' => 'Laporan Kehadiran', 'url' => null]
            ],
            'attendances' => $attendances,
            'stats' => $stats,
            'filters' => $request->all()
        ]);
    }

    /**
     * Generate grade report
     */
    public function generateGradeReport(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'class_id' => 'nullable|exists:class_rooms,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'academic_year_id' => 'nullable|exists:academic_years,id'
        ]);

        $query = DB::table('student_grades')
            ->leftJoin('students', 'student_grades.student_id', '=', 'students.id')
            ->leftJoin('class_rooms', 'students.class_room_id', '=', 'class_rooms.id')
            ->leftJoin('subjects', 'student_grades.subject_id', '=', 'subjects.id')
            ->where('student_grades.instansi_id', $instansiId);

        if ($request->filled('class_id')) {
            $query->where('students.class_room_id', $request->class_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('student_grades.subject_id', $request->subject_id);
        }

        if ($request->filled('academic_year_id')) {
            $query->where('student_grades.academic_year_id', $request->academic_year_id);
        }

        $grades = $query->select('student_grades.*', 'students.name as student_name', 'class_rooms.name as class_name', 'subjects.name as subject_name')
            ->orderBy('students.name')
            ->orderBy('subjects.name')
            ->get();

        return view('tenant.report.grades', [
            'title' => 'Laporan Nilai',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => tenant_route('tenant.report.index')],
                ['name' => 'Laporan Nilai', 'url' => null]
            ],
            'grades' => $grades,
            'filters' => $request->all()
        ]);
    }

    /**
     * Generate financial report
     */
    public function generateFinancialReport(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'category_id' => 'nullable|exists:expense_categories,id'
        ]);

        $query = DB::table('expenses')
            ->leftJoin('expense_categories', 'expenses.expense_category_id', '=', 'expense_categories.id')
            ->where('expenses.instansi_id', $instansiId)
            ->whereBetween('expenses.expense_date', [$request->start_date, $request->end_date]);

        if ($request->filled('category_id')) {
            $query->where('expenses.expense_category_id', $request->category_id);
        }

        $expenses = $query->select('expenses.*', 'expense_categories.name as category_name')
            ->orderBy('expenses.expense_date', 'desc')
            ->get();

        // Calculate financial statistics
        $stats = [
            'total_amount' => $expenses->sum('amount'),
            'expense_count' => $expenses->count(),
            'average_amount' => $expenses->count() > 0 ? $expenses->avg('amount') : 0,
        ];

        return view('tenant.report.financial-detail', [
            'title' => 'Laporan Keuangan Detail',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => tenant_route('tenant.report.index')],
                ['name' => 'Laporan Keuangan Detail', 'url' => null]
            ],
            'expenses' => $expenses,
            'stats' => $stats,
            'filters' => $request->all()
        ]);
    }

    /**
     * Export report to PDF
     */
    public function exportPdf(Request $request)
    {
        $instansiId = $this->getInstansiId();
        $reportType = $request->get('type', 'academic');
        
        // This would typically use a PDF library like DomPDF or similar
        // For now, we'll just return a view that can be printed as PDF
        
        return view('tenant.report.pdf.' . $reportType, [
            'title' => 'Laporan PDF',
            'data' => $this->getReportData($reportType, $instansiId, $request->all())
        ]);
    }

    /**
     * Get report data based on type
     */
    private function getReportData($type, $instansiId, $filters = [])
    {
        switch ($type) {
            case 'academic':
                return $this->getAcademicReportData($instansiId, $filters);
            case 'financial':
                return $this->getFinancialReportData($instansiId, $filters);
            case 'students':
                return $this->getStudentReportData($instansiId, $filters);
            case 'attendance':
                return $this->getAttendanceReportData($instansiId, $filters);
            case 'grades':
                return $this->getGradeReportData($instansiId, $filters);
            default:
                return [];
        }
    }

    private function getAcademicReportData($instansiId, $filters)
    {
        return [
            'total_students' => DB::table('students')->where('instansi_id', $instansiId)->count(),
            'total_teachers' => DB::table('teachers')->where('instansi_id', $instansiId)->count(),
            'total_classes' => DB::table('class_rooms')->where('instansi_id', $instansiId)->count(),
        ];
    }

    private function getFinancialReportData($instansiId, $filters)
    {
        return [
            'total_budget' => DB::table('budgets')->where('instansi_id', $instansiId)->sum('amount'),
            'total_expenses' => DB::table('expenses')->where('instansi_id', $instansiId)->sum('amount'),
        ];
    }

    private function getStudentReportData($instansiId, $filters)
    {
        $query = DB::table('students')->where('instansi_id', $instansiId);
        
        if (isset($filters['class_id'])) {
            $query->where('class_room_id', $filters['class_id']);
        }
        
        return $query->get();
    }

    private function getAttendanceReportData($instansiId, $filters)
    {
        $query = DB::table('attendances')->where('instansi_id', $instansiId);
        
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('attendance_date', [$filters['start_date'], $filters['end_date']]);
        }
        
        return $query->get();
    }

    private function getGradeReportData($instansiId, $filters)
    {
        $query = DB::table('student_grades')->where('instansi_id', $instansiId);
        
        if (isset($filters['class_id'])) {
            $query->whereHas('student', function($q) use ($filters) {
                $q->where('class_room_id', $filters['class_id']);
            });
        }
        
        return $query->get();
    }

    /**
     * Generate SPP report
     */
    public function generateSppReport(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'class_id' => 'nullable|exists:class_rooms,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:paid,unpaid,overdue'
        ]);

        $query = DB::table('spp')
            ->leftJoin('students', 'spp.student_id', '=', 'students.id')
            ->leftJoin('class_rooms', 'students.class_room_id', '=', 'class_rooms.id')
            ->where('spp.instansi_id', $instansiId);

        if ($request->filled('class_id')) {
            $query->where('students.class_room_id', $request->class_id);
        }

        if ($request->filled('status')) {
            $query->where('spp.status', $request->status);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('spp.due_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('spp.due_date', '<=', $request->end_date);
        }

        $sppData = $query->select('spp.*', 'students.name as student_name', 'class_rooms.name as class_name')
            ->orderBy('spp.due_date', 'desc')
            ->get();

        // Calculate SPP statistics
        $stats = [
            'total_spp' => $sppData->count(),
            'paid' => $sppData->where('status', 'paid')->count(),
            'unpaid' => $sppData->where('status', 'unpaid')->count(),
            'overdue' => $sppData->where('status', 'overdue')->count(),
            'total_amount' => $sppData->sum('amount'),
            'paid_amount' => $sppData->where('status', 'paid')->sum('amount'),
        ];

        return view('tenant.report.spp', [
            'title' => 'Laporan SPP',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => tenant_route('tenant.report.index')],
                ['name' => 'Laporan SPP', 'url' => null]
            ],
            'sppData' => $sppData,
            'stats' => $stats,
            'filters' => $request->all()
        ]);
    }

    /**
     * Generate budget report
     */
    public function generateBudgetReport(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'nullable|exists:budget_categories,id'
        ]);

        $query = DB::table('budgets')
            ->leftJoin('budget_categories', 'budgets.budget_category_id', '=', 'budget_categories.id')
            ->where('budgets.instansi_id', $instansiId);

        if ($request->filled('category_id')) {
            $query->where('budgets.budget_category_id', $request->category_id);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('budgets.start_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('budgets.end_date', '<=', $request->end_date);
        }

        $budgets = $query->select('budgets.*', 'budget_categories.name as category_name')
            ->orderBy('budgets.start_date', 'desc')
            ->get();

        // Calculate budget statistics
        $stats = [
            'total_budget' => $budgets->sum('amount'),
            'budget_count' => $budgets->count(),
            'active_budgets' => $budgets->where('is_active', true)->count(),
        ];

        return view('tenant.report.budget', [
            'title' => 'Laporan Anggaran',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Laporan', 'url' => tenant_route('tenant.report.index')],
                ['name' => 'Laporan Anggaran', 'url' => null]
            ],
            'budgets' => $budgets,
            'stats' => $stats,
            'filters' => $request->all()
        ]);
    }

    /**
     * Export report to Excel
     */
    public function exportExcel(Request $request)
    {
        $instansiId = $this->getInstansiId();
        $reportType = $request->get('type', 'students');
        
        // This would typically use an Excel library like Laravel Excel
        // For now, we'll just return a view that can be exported as Excel
        
        return view('tenant.report.excel.' . $reportType, [
            'title' => 'Laporan Excel',
            'data' => $this->getReportData($reportType, $instansiId, $request->all())
        ]);
    }

    /**
     * Custom reports builder
     */
    public function customReports(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $customReports = DB::table('custom_reports')
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.report.custom', [
            'title' => 'Laporan Kustom',
            'page-title' => 'Laporan Kustom',
            'customReports' => $customReports
        ]);
    }

    /**
     * Create custom report
     */
    public function createCustomReport(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'report_type' => 'required|in:academic,financial,attendance,other',
            'query' => 'nullable|string|max:5000',
            'columns' => 'required|array',
            'filters' => 'nullable|json'
        ]);

        try {
            DB::beginTransaction();

            DB::table('custom_reports')->insert([
                'instansi_id' => $instansiId,
                'name' => $request->name,
                'description' => $request->description,
                'report_type' => $request->report_type,
                'query' => $request->query,
                'columns' => json_encode($request->columns),
                'filters' => $request->filters,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return redirect()->route('tenant.report.custom')
                ->with('success', 'Laporan kustom berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Scheduled reports
     */
    public function scheduledReports(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $scheduledReports = DB::table('scheduled_reports')
            ->where('instansi_id', $instansiId)
            ->orderBy('next_run', 'asc')
            ->paginate(20);

        return view('tenant.report.scheduled', [
            'title' => 'Laporan Terjadwal',
            'page-title' => 'Laporan Terjadwal',
            'scheduledReports' => $scheduledReports
        ]);
    }

    /**
     * Create scheduled report
     */
    public function createScheduledReport(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'report_id' => 'required|exists:custom_reports,id',
            'schedule_type' => 'required|in:daily,weekly,monthly',
            'schedule_day' => 'nullable|integer|min:1|max:31',
            'schedule_time' => 'required|date_format:H:i',
            'recipient_emails' => 'required|array',
            'recipient_emails.*' => 'email'
        ]);

        try {
            DB::beginTransaction();

            // Calculate next run date
            $nextRun = $this->calculateNextRun($request->schedule_type, $request->schedule_day, $request->schedule_time);

            DB::table('scheduled_reports')->insert([
                'instansi_id' => $instansiId,
                'report_id' => $request->report_id,
                'schedule_type' => $request->schedule_type,
                'schedule_day' => $request->schedule_day,
                'schedule_time' => $request->schedule_time,
                'recipient_emails' => json_encode($request->recipient_emails),
                'next_run' => $nextRun,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return redirect()->route('tenant.report.scheduled')
                ->with('success', 'Laporan terjadwal berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Send email report
     */
    public function sendEmailReport(Request $request, $reportId)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'recipient_emails' => 'required|array',
            'recipient_emails.*' => 'email',
            'subject' => 'required|string|max:255',
            'message' => 'nullable|string|max:2000'
        ]);

        try {
            $report = DB::table('custom_reports')
                ->where('id', $reportId)
                ->where('instansi_id', $instansiId)
                ->first();

            if (!$report) {
                return redirect()->back()->with('error', 'Laporan tidak ditemukan');
            }

            // Generate report data
            $reportData = $this->generateReportData($report);

            // Send email (implement email sending logic here)
            foreach ($request->recipient_emails as $email) {
                // Mail::to($email)->send(new ReportEmail($report, $reportData, $request->subject, $request->message));
            }

            return redirect()->back()->with('success', 'Laporan berhasil dikirim via email');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Calculate next run date
     */
    private function calculateNextRun($scheduleType, $scheduleDay, $scheduleTime)
    {
        $now = now();
        $time = \Carbon\Carbon::parse($scheduleTime);

        switch ($scheduleType) {
            case 'daily':
                $nextRun = $now->copy()->setTimeFromTimeString($time->format('H:i:s'));
                if ($nextRun->isPast()) {
                    $nextRun->addDay();
                }
                break;
            case 'weekly':
                $nextRun = $now->copy()->next($scheduleDay)->setTimeFromTimeString($time->format('H:i:s'));
                break;
            case 'monthly':
                $nextRun = $now->copy()->day($scheduleDay)->setTimeFromTimeString($time->format('H:i:s'));
                if ($nextRun->isPast()) {
                    $nextRun->addMonth();
                }
                break;
            default:
                $nextRun = $now->copy()->addDay();
        }

        return $nextRun;
    }

    /**
     * Generate report data
     */
    private function generateReportData($report)
    {
        // Implement report data generation based on report query
        return [];
    }
}