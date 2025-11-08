<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Attendance;
use App\Models\Tenant\Schedule;
use App\Models\Tenant\Student;
use App\Models\Tenant\AcademicYear;
use App\Http\Requests\Tenant\AttendanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AttendanceController extends BaseTenantController
{
    /**
     * Display a listing of attendance records
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Attendance::class);

        $tenant = $this->getCurrentTenant();
        $instansiId = Auth::user()->instansi_id;
        
        // Get current active academic year
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        $query = Attendance::where('instansi_id', $tenant->id);

        // Filter berdasarkan tahun pelajaran aktif (untuk guru dan siswa)
        // Admin bisa lihat semua tahun pelajaran
        if ($currentAcademicYear && Auth::user()->role !== 'school_admin') {
            $query->whereHas('schedule', function($q) use ($currentAcademicYear) {
                $q->where('academic_year', $currentAcademicYear->year_name);
            });
        } elseif ($currentAcademicYear && Auth::user()->role === 'school_admin' && $request->filled('academic_year')) {
            // Admin bisa filter tahun pelajaran tertentu
            $academicYear = AcademicYear::find($request->academic_year);
            if ($academicYear && $academicYear->instansi_id == $tenant->id) {
                $query->whereHas('schedule', function($q) use ($academicYear) {
                    $q->where('academic_year', $academicYear->year_name);
                });
            }
        }

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan tanggal
        if ($request->filled('date_from')) {
            $query->whereDate('attendance_date', '>=', $request->get('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('attendance_date', '<=', $request->get('date_to'));
        }

        // Filter berdasarkan status kehadiran
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $attendances = $query->with(['student', 'schedule.subject', 'teacher'])->paginate(20);

        // Get academic years for admin filter
        $academicYears = Auth::user()->role === 'school_admin' 
            ? AcademicYear::where('instansi_id', $instansiId)->get()
            : collect([$currentAcademicYear])->filter();

        return view('tenant.attendances.index', compact('attendances', 'currentAcademicYear', 'academicYears'));
    }

    /**
     * Show the form for creating a new attendance record
     */
    public function create(Request $request)
    {
        $this->authorize('create', Attendance::class);

        $tenant = $this->getCurrentTenant();
        
        $scheduleId = $request->get('schedule_id');
        $schedule = null;
        $students = collect();
        
        if ($scheduleId) {
            $schedule = Schedule::where('instansi_id', $tenant->id)
                ->with(['classRoom.students', 'subject', 'teacher'])
                ->find($scheduleId);
                
            if ($schedule) {
                $students = $schedule->classRoom->students;
            }
        }
        
        // Get current active academic year
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        $schedulesQuery = Schedule::where('instansi_id', $tenant->id)
            ->with(['classRoom', 'subject'])
            ->active();
            
        // Filter by active academic year
        if ($currentAcademicYear) {
            $schedulesQuery->where('academic_year', $currentAcademicYear->year_name);
        }
        
        $schedules = $schedulesQuery->get();

        return view('tenant.attendances.create', compact('schedule', 'students', 'schedules'));
    }

    /**
     * Store a newly created attendance record
     */
    public function store(Request $request)
    {
        $this->authorize('create', Attendance::class);

        $tenant = $this->getCurrentTenant();

        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'attendance_date' => 'required|date',
            'students' => 'required|array',
            'students.*.student_id' => 'required|exists:students,id',
            'students.*.status' => 'required|in:present,absent,late,excused',
            'students.*.notes' => 'nullable|string|max:255',
        ]);

        try {
            return $this->transaction(function () use ($validated, $request, $tenant) {
                // Verify schedule belongs to tenant
                $schedule = Schedule::where('instansi_id', $tenant->id)
                    ->findOrFail($request->schedule_id);

                foreach ($request->students as $studentData) {
                    // Verify student belongs to tenant
                    $student = Student::where('instansi_id', $tenant->id)
                        ->findOrFail($studentData['student_id']);

                    Attendance::updateOrCreate(
                        [
                            'instansi_id' => $tenant->id,
                            'schedule_id' => $request->schedule_id,
                            'student_id' => $studentData['student_id'],
                            'attendance_date' => $request->attendance_date,
                        ],
                        [
                            'npsn' => $tenant->npsn,
                            'teacher_id' => $schedule->teacher_id,
                            'status' => $studentData['status'],
                            'notes' => $studentData['notes'] ?? null,
                        ]
                    );
                }

                return redirect()->route('tenant.attendances.index', ['tenant' => $tenant->npsn])
                    ->with('success', 'Data kehadiran berhasil disimpan');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan data kehadiran');
        }
    }

    /**
     * Display the specified attendance record
     */
    public function show($attendance)
    {
        $attendanceModel = $this->resolveModel(Attendance::class, $attendance, [
            'student',
            'schedule.subject',
            'teacher'
        ]);
        
        $this->authorize('view', $attendanceModel);
        
        return view('tenant.attendances.show', ['attendance' => $attendanceModel]);
    }

    /**
     * Show the form for editing the specified attendance record
     */
    public function edit($attendance)
    {
        $attendanceModel = $this->resolveModel(Attendance::class, $attendance, [
            'student',
            'schedule.subject',
            'teacher'
        ]);
        $this->authorize('update', $attendanceModel);
        
        return view('tenant.attendances.edit', ['attendance' => $attendanceModel]);
    }

    /**
     * Update the specified attendance record
     */
    public function update(AttendanceRequest $request, $attendance)
    {
        $attendanceModel = $this->resolveModel(Attendance::class, $attendance);
        $this->authorize('update', $attendanceModel);

        $validated = $request->validated();

        try {
            $allowedFields = ['status', 'notes'];
            $data = $this->getAllowedFields($request, $allowedFields);

            $attendanceModel->update($data);

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.attendances.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data kehadiran berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui data kehadiran');
        }
    }

    /**
     * Remove the specified attendance record
     */
    public function destroy($attendance)
    {
        $attendanceModel = $this->resolveModel(Attendance::class, $attendance);
        $this->authorize('delete', $attendanceModel);

        try {
            $attendanceModel->delete();

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.attendances.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data kehadiran berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus data kehadiran');
        }
    }

    /**
     * Show attendance summary by student
     */
    public function summary(Request $request)
    {
        $this->authorize('viewAny', Attendance::class);

        $tenant = $this->getCurrentTenant();
        
        $studentId = $request->get('student_id');
        $dateFrom = $request->get('date_from', date('Y-m-01'));
        $dateTo = $request->get('date_to', date('Y-m-t'));
        
        $query = Attendance::where('instansi_id', $tenant->id)
            ->whereBetween('attendance_date', [$dateFrom, $dateTo]);
            
        if ($studentId) {
            // Verify student belongs to tenant
            $student = Student::where('instansi_id', $tenant->id)
                ->findOrFail($studentId);
            $query->where('student_id', $studentId);
        }
        
        $attendances = $query->with(['student', 'schedule.subject'])
            ->get()
            ->groupBy('student_id');
            
        $students = Student::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.attendances.summary', compact('attendances', 'students', 'studentId', 'dateFrom', 'dateTo'));
    }
}
