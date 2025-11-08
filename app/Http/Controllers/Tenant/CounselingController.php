<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\CounselingSession;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use App\Core\Services\TenantService;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CounselingController extends Controller
{
    use HasInstansiId;

    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        $stats = [
            'total_sessions' => CounselingSession::where('instansi_id', $instansiId)->count(),
            'active_sessions' => CounselingSession::where('instansi_id', $instansiId)->where('status', 'in_progress')->count(),
            'completed_sessions' => CounselingSession::where('instansi_id', $instansiId)->where('status', 'completed')->count(),
            'this_month_sessions' => CounselingSession::where('instansi_id', $instansiId)
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        $recentSessions = CounselingSession::with(['student', 'counselor'])
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.counseling.index', [
            'title' => 'Bimbingan Konseling',
            'page-title' => 'Sistem Bimbingan Konseling',
            'stats' => $stats,
            'recentSessions' => $recentSessions
        ]);
    }

    /**
     * Display sessions management
     */
    public function sessions()
    {
        $instansiId = $this->getInstansiId();
        
        $sessions = CounselingSession::with([
            'student' => function($query) use ($instansiId) {
                $query->where('instansi_id', $instansiId)
                      ->with('classRoom');
            },
            'counselor' => function($query) use ($instansiId) {
                $query->where('instansi_id', $instansiId);
            }
        ])
        ->where('instansi_id', $instansiId)
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return view('tenant.counseling.sessions', [
            'title' => 'Sesi Konseling',
            'page-title' => 'Manajemen Sesi Konseling',
            'sessions' => $sessions
        ]);
    }

    /**
     * Display students management
     */
    public function students()
    {
        $instansiId = $this->getInstansiId();
        
        $students = Student::with([
            'classRoom',
            'counselingSessions' => function($query) use ($instansiId) {
                $query->where('instansi_id', $instansiId)
                      ->with('counselor')
                      ->orderBy('session_date', 'desc');
            }
        ])
        ->where('instansi_id', $instansiId)
        ->where('is_active', true)
        ->orderBy('name')
        ->paginate(20);

        return view('tenant.counseling.students', [
            'title' => 'Siswa',
            'page-title' => 'Manajemen Siswa Konseling',
            'students' => $students
        ]);
    }

    /**
     * Show the form for creating a new session.
     */
    public function createSession()
    {
        $instansiId = $this->getInstansiId();
        
        if (!$instansiId) {
            return redirect()->back()->with('error', 'Instansi tidak ditemukan. Silakan login ulang.');
        }
        
        // Get students - remove is_active filter to show all students
        $students = Student::where('instansi_id', $instansiId)
            ->with('classRoom')
            ->orderBy('name')
            ->get();

        // Get counselors - remove is_active filter
        $counselors = Teacher::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.counseling.create-session', [
            'title' => 'Tambah Sesi Konseling',
            'page-title' => 'Tambah Sesi Konseling',
            'students' => $students,
            'counselors' => $counselors
        ]);
    }

    /**
     * Store a newly created session in storage.
     */
    public function storeSession(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'counselor_id' => 'required|exists:teachers,id',
            'session_date' => 'required|date',
            'session_type' => 'required|in:individual,group,family,crisis',
            'category' => 'required|in:academic,behavioral,emotional,social,career,personal',
            'description' => 'required|string|max:2000',
            'title' => 'nullable|string|max:255',
            'goals' => 'nullable|string|max:2000',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled,no_show',
            'confidentiality_level' => 'nullable|in:low,medium,high',
            'notes' => 'nullable|string|max:2000'
        ]);

        try {
            DB::beginTransaction();

            CounselingSession::create([
                'student_id' => $request->student_id,
                'counselor_id' => $request->counselor_id,
                'session_date' => $request->session_date,
                'session_type' => $request->session_type,
                'category' => $request->category,
                'title' => $request->title,
                'description' => $request->description,
                'goals' => $request->goals ? json_encode([$request->goals]) : null,
                'status' => $request->status,
                'confidentiality_level' => $request->confidentiality_level ?? 'medium',
                'notes' => $request->notes,
                'created_by' => auth()->id(),
                'instansi_id' => $this->getInstansiId()
            ]);

            DB::commit();
            return redirect()->to(tenant_route('counseling.sessions'))->with('success', 'Sesi konseling berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show the form for editing the specified session.
     */
    public function editSession(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $session = CounselingSession::where('instansi_id', $instansiId)
            ->with(['student', 'counselor'])
            ->findOrFail($id);

        // Get students - remove is_active filter
        $students = Student::where('instansi_id', $instansiId)
            ->with('classRoom')
            ->orderBy('name')
            ->get();

        // Get counselors - remove is_active filter
        $counselors = Teacher::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.counseling.edit-session', [
            'title' => 'Edit Sesi Konseling',
            'page-title' => 'Edit Sesi Konseling',
            'session' => $session,
            'students' => $students,
            'counselors' => $counselors
        ]);
    }

    /**
     * Update the specified session in storage.
     */
    public function updateSession(Request $request, string $id)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'counselor_id' => 'required|exists:teachers,id',
            'session_date' => 'required|date',
            'session_type' => 'required|in:individual,group,family,crisis',
            'category' => 'required|in:academic,behavioral,emotional,social,career,personal',
            'description' => 'required|string|max:2000',
            'title' => 'nullable|string|max:255',
            'goals' => 'nullable|string|max:2000',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled,no_show',
            'confidentiality_level' => 'nullable|in:low,medium,high',
            'notes' => 'nullable|string|max:2000'
        ]);

        try {
            DB::beginTransaction();

            $session = CounselingSession::where('instansi_id', $this->getInstansiId())
                ->findOrFail($id);

            $session->update([
                'student_id' => $request->student_id,
                'counselor_id' => $request->counselor_id,
                'session_date' => $request->session_date,
                'session_type' => $request->session_type,
                'category' => $request->category,
                'title' => $request->title,
                'description' => $request->description,
                'goals' => $request->goals ? json_encode([$request->goals]) : null,
                'status' => $request->status,
                'confidentiality_level' => $request->confidentiality_level ?? 'medium',
                'notes' => $request->notes
            ]);

            DB::commit();
            return redirect()->to(tenant_route('counseling.sessions'))->with('success', 'Sesi konseling berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified session from storage.
     */
    public function destroySession(string $id)
    {
        try {
            DB::beginTransaction();

            $session = CounselingSession::where('instansi_id', $this->getInstansiId())
                ->findOrFail($id);

            $session->delete();

            DB::commit();
            return redirect()->to(tenant_route('counseling.sessions'))->with('success', 'Sesi konseling berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Add follow-up note to session
     */
    public function addFollowUp(Request $request, string $id)
    {
        $request->validate([
            'follow_up_note' => 'required|string|max:1000',
            'follow_up_date' => 'nullable|date|after:today',
            'follow_up_required' => 'nullable|boolean'
        ]);

        try {
            DB::beginTransaction();

            $session = CounselingSession::where('instansi_id', $this->getInstansiId())
                ->findOrFail($id);

            $session->update([
                'notes' => ($session->notes ? $session->notes . "\n\n" : '') . 'Follow-up: ' . $request->follow_up_note,
                'follow_up_date' => $request->follow_up_date,
                'follow_up_required' => $request->follow_up_required ?? true,
                'status' => 'completed'
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Catatan follow-up berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Get student counseling history
     */
    public function getStudentHistory(Student $student)
    {
        $sessions = CounselingSession::with(['counselor'])
            ->where('instansi_id', $this->getInstansiId())
            ->where('student_id', $student->id)
            ->orderBy('session_date', 'desc')
            ->get();

        return response()->json($sessions);
    }

    /**
     * Show appointment calendar/schedule
     */
    public function calendar(Request $request)
    {
        $instansiId = $this->getInstansiId();
        $counselorId = $request->get('counselor_id');
        $date = $request->get('date', now()->format('Y-m-d'));

        $query = CounselingSession::with(['student', 'counselor'])
            ->where('instansi_id', $instansiId)
            ->whereDate('session_date', $date);

        if ($counselorId) {
            $query->where('counselor_id', $counselorId);
        }

        $sessions = $query->orderBy('session_date')->get();

        $counselors = Teacher::where('instansi_id', $instansiId)->orderBy('name')->get();

        return view('tenant.counseling.calendar', [
            'title' => 'Kalender Konseling',
            'page-title' => 'Kalender Appointment',
            'sessions' => $sessions,
            'counselors' => $counselors,
            'selectedDate' => $date,
            'selectedCounselorId' => $counselorId
        ]);
    }

    /**
     * Check counselor availability
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'counselor_id' => 'required|exists:teachers,id',
            'session_date' => 'required|date',
            'duration' => 'nullable|integer|min:15|max:120'
        ]);

        $instansiId = $this->getInstansiId();
        $date = $request->session_date;
        $duration = $request->duration ?? 60; // Default 60 minutes

        // Check existing sessions at that time
        $conflicts = CounselingSession::where('instansi_id', $instansiId)
            ->where('counselor_id', $request->counselor_id)
            ->where('status', '!=', CounselingSession::STATUS_CANCELLED)
            ->whereDate('session_date', $date)
            ->whereTime('session_date', '>=', date('H:i:s', strtotime($request->session_date)))
            ->whereTime('session_date', '<=', date('H:i:s', strtotime($request->session_date . ' + ' . $duration . ' minutes')))
            ->exists();

        return response()->json([
            'available' => !$conflicts,
            'message' => $conflicts ? 'Konselor tidak tersedia pada waktu tersebut' : 'Konselor tersedia'
        ]);
    }

    /**
     * Add session notes
     */
    public function addSessionNotes(Request $request, string $id)
    {
        $request->validate([
            'session_notes' => 'required|string|max:5000',
            'interventions' => 'nullable|array',
            'outcomes' => 'nullable|array',
            'issues' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            $session = CounselingSession::where('instansi_id', $this->getInstansiId())
                ->findOrFail($id);

            $session->update([
                'notes' => $request->session_notes,
                'interventions' => $request->interventions,
                'outcomes' => $request->outcomes,
                'issues' => $request->issues,
                'status' => CounselingSession::STATUS_COMPLETED
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Catatan sesi berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show follow-up tracking dashboard
     */
    public function followUpTracking()
    {
        $instansiId = $this->getInstansiId();

        $pendingFollowUps = CounselingSession::with(['student', 'counselor'])
            ->where('instansi_id', $instansiId)
            ->where('follow_up_required', true)
            ->whereNotNull('follow_up_date')
            ->where('follow_up_date', '>=', now()->toDateString())
            ->orderBy('follow_up_date')
            ->get();

        $overdueFollowUps = CounselingSession::with(['student', 'counselor'])
            ->where('instansi_id', $instansiId)
            ->where('follow_up_required', true)
            ->whereNotNull('follow_up_date')
            ->where('follow_up_date', '<', now()->toDateString())
            ->orderBy('follow_up_date')
            ->get();

        return view('tenant.counseling.follow-up-tracking', [
            'title' => 'Tracking Follow-up',
            'page-title' => 'Tracking Follow-up Konseling',
            'pendingFollowUps' => $pendingFollowUps,
            'overdueFollowUps' => $overdueFollowUps
        ]);
    }

    /**
     * Mark follow-up as completed
     */
    public function completeFollowUp(Request $request, string $id)
    {
        $request->validate([
            'follow_up_result' => 'required|string|max:2000'
        ]);

        try {
            DB::beginTransaction();

            $session = CounselingSession::where('instansi_id', $this->getInstansiId())
                ->findOrFail($id);

            $session->update([
                'follow_up_required' => false,
                'notes' => ($session->notes ? $session->notes . "\n\n" : '') . 
                          'Follow-up Completed: ' . $request->follow_up_result
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Follow-up berhasil ditandai sebagai selesai');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
