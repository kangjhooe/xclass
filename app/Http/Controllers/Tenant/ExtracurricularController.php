<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\ExtracurricularActivity;
use App\Models\Tenant\ExtracurricularParticipant;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExtracurricularController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        $stats = [
            'total_activities' => ExtracurricularActivity::where('instansi_id', $instansiId)->count(),
            'active_activities' => ExtracurricularActivity::where('instansi_id', $instansiId)->where('status', 'active')->count(),
            'total_participants' => ExtracurricularParticipant::where('instansi_id', $instansiId)->count(),
            'this_month_activities' => ExtracurricularActivity::where('instansi_id', $instansiId)
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        $recentActivities = ExtracurricularActivity::with(['teacher', 'participants'])
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.extracurricular.index', [
            'title' => 'Ekstrakurikuler',
            'page-title' => 'Sistem Ekstrakurikuler',
            'stats' => $stats,
            'recentActivities' => $recentActivities
        ]);
    }

    /**
     * Display activities management
     */
    public function activities()
    {
        $activities = ExtracurricularActivity::with(['teacher', 'participants'])
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.extracurricular.activities', [
            'title' => 'Kegiatan',
            'page-title' => 'Manajemen Kegiatan Ekstrakurikuler',
            'activities' => $activities
        ]);
    }

    /**
     * Display participants management
     */
    public function participants()
    {
        $participants = ExtracurricularParticipant::with(['activity', 'student'])
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.extracurricular.participants', [
            'title' => 'Peserta',
            'page-title' => 'Manajemen Peserta Ekstrakurikuler',
            'participants' => $participants
        ]);
    }

    /**
     * Show the form for creating a new activity.
     */
    public function createActivity()
    {
        $teachers = Teacher::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.extracurricular.create-activity', [
            'title' => 'Tambah Kegiatan',
            'page-title' => 'Tambah Kegiatan Ekstrakurikuler',
            'teachers' => $teachers
        ]);
    }

    /**
     * Store a newly created activity in storage.
     */
    public function storeActivity(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:100',
            'teacher_id' => 'required|exists:teachers,id',
            'schedule' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'requirements' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            DB::beginTransaction();

            ExtracurricularActivity::create([
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'teacher_id' => $request->teacher_id,
                'schedule' => $request->schedule,
                'location' => $request->location,
                'max_participants' => $request->max_participants,
                'requirements' => $request->requirements,
                'status' => $request->status,
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->route('tenant.extracurricular.activities')->with('success', 'Kegiatan berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show the form for editing the specified activity.
     */
    public function editActivity(string $id)
    {
        $activity = ExtracurricularActivity::where('instansi_id', $instansiId)
            ->findOrFail($id);

        $teachers = Teacher::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.extracurricular.edit-activity', [
            'title' => 'Edit Kegiatan',
            'page-title' => 'Edit Kegiatan Ekstrakurikuler',
            'activity' => $activity,
            'teachers' => $teachers
        ]);
    }

    /**
     * Update the specified activity in storage.
     */
    public function updateActivity(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:100',
            'teacher_id' => 'required|exists:teachers,id',
            'schedule' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'requirements' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            DB::beginTransaction();

            $activity = ExtracurricularActivity::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $activity->update([
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'teacher_id' => $request->teacher_id,
                'schedule' => $request->schedule,
                'location' => $request->location,
                'max_participants' => $request->max_participants,
                'requirements' => $request->requirements,
                'status' => $request->status
            ]);

            DB::commit();
            return redirect()->route('tenant.extracurricular.activities')->with('success', 'Kegiatan berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified activity from storage.
     */
    public function destroyActivity(string $id)
    {
        try {
            DB::beginTransaction();

            $activity = ExtracurricularActivity::where('instansi_id', $instansiId)
                ->findOrFail($id);

            // Delete related participants
            $activity->participants()->delete();
            $activity->delete();

            DB::commit();
            return redirect()->route('tenant.extracurricular.activities')->with('success', 'Kegiatan berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Add participant to activity
     */
    public function addParticipant(Request $request, string $activityId)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'join_date' => 'required|date',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $activity = ExtracurricularActivity::where('instansi_id', $instansiId)
                ->findOrFail($activityId);

            // Check if student is already a participant
            $existingParticipant = ExtracurricularParticipant::where('activity_id', $activityId)
                ->where('student_id', $request->student_id)
                ->first();

            if ($existingParticipant) {
                return redirect()->back()->with('error', 'Siswa sudah terdaftar dalam kegiatan ini');
            }

            // Check if activity is full
            if ($activity->participants()->count() >= $activity->max_participants) {
                return redirect()->back()->with('error', 'Kegiatan sudah penuh');
            }

            ExtracurricularParticipant::create([
                'activity_id' => $activityId,
                'student_id' => $request->student_id,
                'join_date' => $request->join_date,
                'status' => 'active',
                'notes' => $request->notes,
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Peserta berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove participant from activity
     */
    public function removeParticipant(string $participantId)
    {
        try {
            DB::beginTransaction();

            $participant = ExtracurricularParticipant::where('instansi_id', $instansiId)
                ->findOrFail($participantId);

            $participant->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Peserta berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
