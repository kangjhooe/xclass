<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\DisciplinaryAction;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DisciplineController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        $stats = [
            'total_actions' => DisciplinaryAction::where('instansi_id', $instansiId)->count(),
            'this_month_actions' => DisciplinaryAction::where('instansi_id', $instansiId)
                ->whereMonth('created_at', now()->month)
                ->count(),
            'warning_actions' => DisciplinaryAction::where('instansi_id', $instansiId)
                ->where('sanction_type', 'warning')
                ->count(),
            'serious_actions' => DisciplinaryAction::where('instansi_id', $instansiId)
                ->whereIn('sanction_type', ['suspension', 'expulsion'])
                ->count(),
        ];

        $recentActions = DisciplinaryAction::with(['student', 'reporter'])
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.discipline.index', [
            'title' => 'Kedisiplinan',
            'page-title' => 'Sistem Kedisiplinan',
            'stats' => $stats,
            'recentActions' => $recentActions
        ]);
    }

    /**
     * Display actions management
     */
    public function actions()
    {
        $instansiId = $this->getInstansiId();
        
        $actions = DisciplinaryAction::with(['student', 'reporter'])
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.discipline.actions', [
            'title' => 'Tindakan Disiplin',
            'page-title' => 'Manajemen Tindakan Disiplin',
            'actions' => $actions
        ]);
    }

    /**
     * Show the form for creating a new action.
     */
    public function createAction()
    {
        $instansiId = $this->getInstansiId();
        
        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        $users = \App\Models\User::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.discipline.create-action', [
            'title' => 'Tambah Tindakan Disiplin',
            'page-title' => 'Tambah Tindakan Disiplin',
            'students' => $students,
            'users' => $users
        ]);
    }

    /**
     * Store a newly created action in storage.
     */
    public function storeAction(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'reported_by' => 'required|exists:users,id',
            'sanction_type' => 'required|in:warning,reprimand,detention,suspension,expulsion,community_service',
            'violation_type' => 'required|in:minor,moderate,major,severe',
            'violation_category' => 'required|in:academic,behavior,attendance,dress_code,safety,other',
            'description' => 'required|string|max:1000',
            'violation_date' => 'required|date',
            'severity_level' => 'required|in:low,medium,high,critical',
            'status' => 'required|in:pending,approved,active,completed,cancelled',
            'sanction_description' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            DisciplinaryAction::create([
                'student_id' => $request->student_id,
                'reported_by' => $request->reported_by,
                'sanction_type' => $request->sanction_type,
                'violation_type' => $request->violation_type,
                'violation_category' => $request->violation_category,
                'description' => $request->description,
                'violation_date' => $request->violation_date,
                'severity_level' => $request->severity_level,
                'status' => $request->status,
                'sanction_description' => $request->sanction_description,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->to(tenant_route('discipline.actions'))->with('success', 'Tindakan disiplin berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show the form for editing the specified action.
     */
    public function editAction(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $action = DisciplinaryAction::where('instansi_id', $instansiId)
            ->findOrFail($id);

        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        $users = \App\Models\User::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.discipline.edit-action', [
            'title' => 'Edit Tindakan Disiplin',
            'page-title' => 'Edit Tindakan Disiplin',
            'action' => $action,
            'students' => $students,
            'users' => $users
        ]);
    }

    /**
     * Update the specified action in storage.
     */
    public function updateAction(Request $request, string $id)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'reported_by' => 'required|exists:users,id',
            'sanction_type' => 'required|in:warning,reprimand,detention,suspension,expulsion,community_service',
            'violation_type' => 'required|in:minor,moderate,major,severe',
            'violation_category' => 'required|in:academic,behavior,attendance,dress_code,safety,other',
            'description' => 'required|string|max:1000',
            'violation_date' => 'required|date',
            'severity_level' => 'required|in:low,medium,high,critical',
            'status' => 'required|in:pending,approved,active,completed,cancelled',
            'sanction_description' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            $action = DisciplinaryAction::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $action->update([
                'student_id' => $request->student_id,
                'reported_by' => $request->reported_by,
                'sanction_type' => $request->sanction_type,
                'violation_type' => $request->violation_type,
                'violation_category' => $request->violation_category,
                'description' => $request->description,
                'violation_date' => $request->violation_date,
                'severity_level' => $request->severity_level,
                'status' => $request->status,
                'sanction_description' => $request->sanction_description,
                'notes' => $request->notes
            ]);

            DB::commit();
            return redirect()->to(tenant_route('discipline.actions'))->with('success', 'Tindakan disiplin berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified action from storage.
     */
    public function destroyAction(string $id)
    {
        try {
            DB::beginTransaction();

            $action = DisciplinaryAction::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $action->delete();

            DB::commit();
            return redirect()->to(tenant_route('discipline.actions'))->with('success', 'Tindakan disiplin berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Get student discipline history
     */
    public function getStudentHistory(Student $student)
    {
        $instansiId = $this->getInstansiId();
        
        $actions = DisciplinaryAction::with(['reporter'])
            ->where('instansi_id', $instansiId)
            ->where('student_id', $student->id)
            ->orderBy('violation_date', 'desc')
            ->get();

        return response()->json($actions);
    }

    /**
     * Update action status
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,active,completed,cancelled'
        ]);

        try {
            $action = DisciplinaryAction::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $action->update(['status' => $request->status]);

            return redirect()->back()->with('success', 'Status tindakan disiplin berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Violation tracking dashboard
     */
    public function violationTracking(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        // Get violation statistics by category
        $violationsByCategory = DisciplinaryAction::where('instansi_id', $instansiId)
            ->select('violation_category', DB::raw('count(*) as total'))
            ->groupBy('violation_category')
            ->get();

        // Get violations by severity
        $violationsBySeverity = DisciplinaryAction::where('instansi_id', $instansiId)
            ->select('severity_level', DB::raw('count(*) as total'))
            ->groupBy('severity_level')
            ->get();

        // Get top violating students
        $topViolators = DisciplinaryAction::where('instansi_id', $instansiId)
            ->select('student_id', DB::raw('count(*) as violation_count'))
            ->groupBy('student_id')
            ->orderBy('violation_count', 'desc')
            ->limit(10)
            ->with('student')
            ->get();

        // Recent violations
        $recentViolations = DisciplinaryAction::with(['student', 'reporter'])
            ->where('instansi_id', $instansiId)
            ->orderBy('violation_date', 'desc')
            ->limit(20)
            ->get();

        return view('tenant.discipline.violation-tracking', [
            'title' => 'Tracking Pelanggaran',
            'page-title' => 'Tracking Pelanggaran Disiplin',
            'violationsByCategory' => $violationsByCategory,
            'violationsBySeverity' => $violationsBySeverity,
            'topViolators' => $topViolators,
            'recentViolations' => $recentViolations
        ]);
    }

    /**
     * Sanction management dashboard
     */
    public function sanctionManagement(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DisciplinaryAction::with(['student'])
            ->where('instansi_id', $instansiId);

        // Filter by sanction type
        if ($request->filled('sanction_type')) {
            $query->where('sanction_type', $request->sanction_type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $actions = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get sanction statistics
        $sanctionStats = DisciplinaryAction::where('instansi_id', $instansiId)
            ->select('sanction_type', 'status', DB::raw('count(*) as total'))
            ->groupBy('sanction_type', 'status')
            ->get();

        return view('tenant.discipline.sanction-management', [
            'title' => 'Manajemen Sanksi',
            'page-title' => 'Manajemen Sanksi Disiplin',
            'actions' => $actions,
            'sanctionStats' => $sanctionStats
        ]);
    }

    /**
     * Apply sanction to action
     */
    public function applySanction(Request $request, string $id)
    {
        $request->validate([
            'sanction_type' => 'required|in:warning,reprimand,detention,suspension,expulsion,community_service',
            'sanction_description' => 'required|string|max:1000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            $action = DisciplinaryAction::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $action->update([
                'sanction_type' => $request->sanction_type,
                'sanction_description' => $request->sanction_description,
                'sanction_start_date' => $request->start_date,
                'sanction_end_date' => $request->end_date,
                'status' => 'active',
                'notes' => ($action->notes ? $action->notes . "\n\n" : '') . 'Sanksi: ' . $request->notes
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Sanksi berhasil diterapkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Generate discipline report
     */
    public function generateReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'report_type' => 'required|in:summary,detailed,by_student,by_category'
        ]);

        $instansiId = $this->getInstansiId();
        
        $query = DisciplinaryAction::with(['student', 'reporter'])
            ->where('instansi_id', $instansiId)
            ->whereBetween('violation_date', [$request->start_date, $request->end_date]);

        $actions = $query->get();

        // Generate report data based on type
        $reportData = [];
        switch ($request->report_type) {
            case 'summary':
                $reportData = [
                    'total_violations' => $actions->count(),
                    'by_category' => $actions->groupBy('violation_category')->map->count(),
                    'by_severity' => $actions->groupBy('severity_level')->map->count(),
                    'by_sanction' => $actions->groupBy('sanction_type')->map->count(),
                ];
                break;
            case 'by_student':
                $reportData = $actions->groupBy('student_id')->map(function($group) {
                    return [
                        'student' => $group->first()->student,
                        'violations' => $group->count(),
                        'actions' => $group
                    ];
                });
                break;
            case 'by_category':
                $reportData = $actions->groupBy('violation_category');
                break;
            default:
                $reportData = $actions;
        }

        return view('tenant.discipline.report', [
            'title' => 'Laporan Kedisiplinan',
            'page-title' => 'Laporan Kedisiplinan',
            'reportData' => $reportData,
            'reportType' => $request->report_type,
            'startDate' => $request->start_date,
            'endDate' => $request->end_date
        ]);
    }

    /**
     * Export discipline report
     */
    public function exportReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'format' => 'required|in:excel,pdf'
        ]);

        $instansiId = $this->getInstansiId();
        
        $actions = DisciplinaryAction::with(['student', 'reporter'])
            ->where('instansi_id', $instansiId)
            ->whereBetween('violation_date', [$request->start_date, $request->end_date])
            ->get();

        if ($request->format === 'pdf') {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('tenant.discipline.export-pdf', [
                'actions' => $actions,
                'startDate' => $request->start_date,
                'endDate' => $request->end_date
            ]);
            return $pdf->download('laporan_kedisiplinan_' . date('Y-m-d') . '.pdf');
        }

        // Excel export would go here
        return response()->json([
            'success' => true,
            'message' => 'Export Excel akan segera dibuat',
            'count' => $actions->count()
        ]);
    }
}
