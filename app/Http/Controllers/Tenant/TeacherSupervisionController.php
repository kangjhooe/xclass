<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\TeacherSupervision;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TeacherSupervisionController extends BaseTenantController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tenant = $this->getCurrentTenant();
        
        $query = TeacherSupervision::with(['teacher', 'supervisor', 'classRoom', 'subject'])
            ->where('instansi_id', $tenant->id);

        // Filter by teacher
        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        // Filter by supervisor
        if ($request->filled('supervisor_id')) {
            $query->where('supervisor_id', $request->supervisor_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by academic year
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        // Filter by semester
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('supervision_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('supervision_date', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('teacher', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('supervisor', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $supervisions = $query->orderBy('supervision_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Get filters data
        $teachers = Teacher::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Get academic years
        $academicYears = TeacherSupervision::where('instansi_id', $tenant->id)
            ->distinct()
            ->pluck('academic_year')
            ->filter()
            ->sort()
            ->values();

        return view('tenant.teacher-supervisions.index', [
            'title' => 'Supervisi Guru',
            'page-title' => 'Supervisi Guru',
            'supervisions' => $supervisions,
            'teachers' => $teachers,
            'academicYears' => $academicYears,
            'filters' => $request->all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tenant = $this->getCurrentTenant();
        
        $teachers = Teacher::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $classRooms = ClassRoom::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $subjects = Subject::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Get current academic year (you may want to adjust this logic)
        $currentAcademicYear = date('Y') . '/' . (date('Y') + 1);
        $currentSemester = date('m') >= 7 ? 1 : 2;

        return view('tenant.teacher-supervisions.create', [
            'title' => 'Tambah Supervisi',
            'page-title' => 'Tambah Supervisi Guru',
            'teachers' => $teachers,
            'classRooms' => $classRooms,
            'subjects' => $subjects,
            'currentAcademicYear' => $currentAcademicYear,
            'currentSemester' => $currentSemester,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'supervisor_id' => 'required|exists:teachers,id',
            'class_room_id' => 'nullable|exists:class_rooms,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'supervision_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'supervision_type' => 'required|in:akademik,administratif,kepribadian,sosial',
            'supervision_method' => 'required|in:observasi_kelas,observasi_non_kelas,wawancara,dokumentasi,kombinasi',
            'preparation_score' => 'nullable|numeric|min:0|max:100',
            'preparation_notes' => 'nullable|string|max:1000',
            'implementation_score' => 'nullable|numeric|min:0|max:100',
            'implementation_notes' => 'nullable|string|max:1000',
            'classroom_management_score' => 'nullable|numeric|min:0|max:100',
            'classroom_management_notes' => 'nullable|string|max:1000',
            'student_interaction_score' => 'nullable|numeric|min:0|max:100',
            'student_interaction_notes' => 'nullable|string|max:1000',
            'assessment_score' => 'nullable|numeric|min:0|max:100',
            'assessment_notes' => 'nullable|string|max:1000',
            'strengths' => 'nullable|string',
            'weaknesses' => 'nullable|string',
            'follow_up_plan' => 'nullable|string',
            'follow_up_date' => 'nullable|date',
            'follow_up_status' => 'nullable|in:belum,sedang,selesai,tidak_perlu',
            'documentation' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:draft,completed,archived',
            'academic_year' => 'nullable|string',
            'semester' => 'nullable|integer|min:1|max:2',
        ]);

        try {
            return $this->transaction(function() use ($validated, $request) {
                $tenant = $this->getCurrentTenant();
                
                // Calculate overall score
                $overallScore = null;
                $scores = array_filter([
                    $validated['preparation_score'] ?? null,
                    $validated['implementation_score'] ?? null,
                    $validated['classroom_management_score'] ?? null,
                    $validated['student_interaction_score'] ?? null,
                    $validated['assessment_score'] ?? null,
                ]);

                if (!empty($scores)) {
                    $overallScore = round(array_sum($scores) / count($scores), 2);
                }

                // Get overall rating from score
                $overallRating = null;
                if ($overallScore !== null) {
                    $supervision = new TeacherSupervision();
                    $overallRating = $supervision->getOverallRatingFromScore($overallScore);
                }

                $data = $this->prepareTenantData(array_merge($validated, [
                    'overall_score' => $overallScore,
                    'overall_rating' => $overallRating,
                    'status' => $validated['status'] ?? TeacherSupervision::STATUS_DRAFT,
                    'follow_up_status' => $validated['follow_up_status'] ?? TeacherSupervision::FOLLOW_UP_BELUM,
                ]));

                $supervision = TeacherSupervision::create($data);

                return redirect()->route('tenant.teacher-supervisions.show', [
                    'tenant' => $tenant->npsn,
                    'teacher_supervision' => $supervision->id
                ])->with('success', 'Supervisi berhasil ditambahkan');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan supervisi');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(TeacherSupervision $teacherSupervision)
    {
        $this->ensureTenantAccess($teacherSupervision);
        
        $teacherSupervision->load(['teacher', 'supervisor', 'classRoom', 'subject']);

        return view('tenant.teacher-supervisions.show', [
            'title' => 'Detail Supervisi',
            'page-title' => 'Detail Supervisi Guru',
            'supervision' => $teacherSupervision,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TeacherSupervision $teacherSupervision)
    {
        $this->ensureTenantAccess($teacherSupervision);
        
        $tenant = $this->getCurrentTenant();
        
        $teachers = Teacher::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $classRooms = ClassRoom::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $subjects = Subject::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return view('tenant.teacher-supervisions.edit', [
            'title' => 'Edit Supervisi',
            'page-title' => 'Edit Supervisi Guru',
            'supervision' => $teacherSupervision,
            'teachers' => $teachers,
            'classRooms' => $classRooms,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TeacherSupervision $teacherSupervision)
    {
        $this->ensureTenantAccess($teacherSupervision);

        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'supervisor_id' => 'required|exists:teachers,id',
            'class_room_id' => 'nullable|exists:class_rooms,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'supervision_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'supervision_type' => 'required|in:akademik,administratif,kepribadian,sosial',
            'supervision_method' => 'required|in:observasi_kelas,observasi_non_kelas,wawancara,dokumentasi,kombinasi',
            'preparation_score' => 'nullable|numeric|min:0|max:100',
            'preparation_notes' => 'nullable|string|max:1000',
            'implementation_score' => 'nullable|numeric|min:0|max:100',
            'implementation_notes' => 'nullable|string|max:1000',
            'classroom_management_score' => 'nullable|numeric|min:0|max:100',
            'classroom_management_notes' => 'nullable|string|max:1000',
            'student_interaction_score' => 'nullable|numeric|min:0|max:100',
            'student_interaction_notes' => 'nullable|string|max:1000',
            'assessment_score' => 'nullable|numeric|min:0|max:100',
            'assessment_notes' => 'nullable|string|max:1000',
            'strengths' => 'nullable|string',
            'weaknesses' => 'nullable|string',
            'follow_up_plan' => 'nullable|string',
            'follow_up_date' => 'nullable|date',
            'follow_up_status' => 'nullable|in:belum,sedang,selesai,tidak_perlu',
            'documentation' => 'nullable|string',
            'notes' => 'nullable|string',
            'teacher_response' => 'nullable|string',
            'status' => 'nullable|in:draft,completed,archived',
            'academic_year' => 'nullable|string',
            'semester' => 'nullable|integer|min:1|max:2',
        ]);

        try {
            return $this->transaction(function() use ($validated, $teacherSupervision) {
                // Calculate overall score
                $overallScore = null;
                $scores = array_filter([
                    $validated['preparation_score'] ?? null,
                    $validated['implementation_score'] ?? null,
                    $validated['classroom_management_score'] ?? null,
                    $validated['student_interaction_score'] ?? null,
                    $validated['assessment_score'] ?? null,
                ]);

                if (!empty($scores)) {
                    $overallScore = round(array_sum($scores) / count($scores), 2);
                }

                // Get overall rating from score
                $overallRating = null;
                if ($overallScore !== null) {
                    $overallRating = $teacherSupervision->getOverallRatingFromScore($overallScore);
                }

                $teacherSupervision->update(array_merge($validated, [
                    'overall_score' => $overallScore,
                    'overall_rating' => $overallRating,
                ]));

                return redirect()->route('tenant.teacher-supervisions.show', [
                    'tenant' => $this->getCurrentTenant()->npsn,
                    'teacher_supervision' => $teacherSupervision->id
                ])->with('success', 'Supervisi berhasil diperbarui');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui supervisi');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TeacherSupervision $teacherSupervision)
    {
        $this->ensureTenantAccess($teacherSupervision);

        try {
            return $this->transaction(function() use ($teacherSupervision) {
                $teacherSupervision->delete();
                
                return redirect()->route('tenant.teacher-supervisions.index', [
                    'tenant' => $this->getCurrentTenant()->npsn
                ])->with('success', 'Supervisi berhasil dihapus');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus supervisi');
        }
    }

    /**
     * Confirm supervision by teacher
     */
    public function confirm(TeacherSupervision $teacherSupervision)
    {
        $this->ensureTenantAccess($teacherSupervision);

        try {
            $teacherSupervision->update([
                'is_confirmed' => true,
            ]);

            return redirect()->back()->with('success', 'Supervisi berhasil dikonfirmasi');
        } catch (\Exception $e) {
            return $this->handleException($e, 'mengonfirmasi supervisi');
        }
    }

    /**
     * Add teacher response
     */
    public function addResponse(Request $request, TeacherSupervision $teacherSupervision)
    {
        $this->ensureTenantAccess($teacherSupervision);

        $validated = $request->validate([
            'teacher_response' => 'required|string|max:2000',
        ]);

        try {
            $teacherSupervision->update([
                'teacher_response' => $validated['teacher_response'],
            ]);

            return redirect()->back()->with('success', 'Tanggapan berhasil ditambahkan');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menambahkan tanggapan');
        }
    }
}
