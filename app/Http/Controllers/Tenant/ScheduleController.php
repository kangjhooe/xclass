<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Schedule;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Subject;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\AcademicYear;
use App\Http\Requests\Tenant\ScheduleRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends BaseTenantController
{
    /**
     * Display a listing of schedules
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Schedule::class);

        $tenant = $this->getCurrentTenant();
        $instansiId = Auth::user()->instansi_id;
        
        // Get current active academic year
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        $query = Schedule::where('instansi_id', $tenant->id);

        // Filter berdasarkan tahun pelajaran aktif (untuk guru dan siswa)
        // Admin bisa lihat semua tahun pelajaran
        if ($currentAcademicYear && Auth::user()->role !== 'school_admin') {
            $query->where('academic_year', $currentAcademicYear->year_name);
        } elseif ($currentAcademicYear && Auth::user()->role === 'school_admin' && $request->filled('academic_year')) {
            // Admin bisa filter tahun pelajaran tertentu
            $academicYear = AcademicYear::find($request->academic_year);
            if ($academicYear && $academicYear->instansi_id == $tenant->id) {
                $query->where('academic_year', $academicYear->year_name);
            }
        } elseif ($currentAcademicYear && Auth::user()->role === 'school_admin') {
            // Default admin lihat tahun pelajaran aktif
            $query->where('academic_year', $currentAcademicYear->year_name);
        }

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('day', 'like', "%{$search}%")
                  ->orWhere('start_time', 'like', "%{$search}%")
                  ->orWhere('time_start', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan kelas
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->get('class_id'));
        }

        // Filter berdasarkan mata pelajaran
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->get('subject_id'));
        }

        $schedules = $query->with(['classRoom', 'subject', 'teacher'])->paginate(20);
        
        // Get classes for current academic year
        $classesQuery = ClassRoom::where('instansi_id', $tenant->id)->active();
        if ($currentAcademicYear) {
            $classesQuery->where('academic_year', $currentAcademicYear->year_name);
        }
        $classes = $classesQuery->get();
        
        $subjects = Subject::where('instansi_id', $tenant->id)->active()->get();
        
        // Get academic years for admin filter
        $academicYears = Auth::user()->role === 'school_admin' 
            ? AcademicYear::where('instansi_id', $instansiId)->get()
            : collect([$currentAcademicYear])->filter();

        return view('tenant.schedules.index', compact('schedules', 'classes', 'subjects', 'currentAcademicYear', 'academicYears'));
    }

    /**
     * Show the form for creating a new schedule
     */
    public function create()
    {
        $this->authorize('create', Schedule::class);

        $tenant = $this->getCurrentTenant();
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);
        
        // Get classes for current academic year
        $classesQuery = ClassRoom::where('instansi_id', $tenant->id)->active();
        if ($currentAcademicYear) {
            $classesQuery->where('academic_year', $currentAcademicYear->year_name);
        }
        $classes = $classesQuery->get();
        
        $subjects = Subject::where('instansi_id', $tenant->id)->active()->get();
        $teachers = Teacher::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.schedules.create', compact('classes', 'subjects', 'teachers', 'currentAcademicYear'));
    }

    /**
     * Store a newly created schedule
     */
    public function store(ScheduleRequest $request)
    {
        $this->authorize('create', Schedule::class);

        $tenant = $this->getCurrentTenant();
        $instansiId = Auth::user()->instansi_id;
        $currentAcademicYear = AcademicYear::getCurrent($instansiId);

        $validated = $request->validated();

        if (!$currentAcademicYear) {
            return redirect()->back()
                ->with('error', 'Tidak ada tahun pelajaran yang aktif. Silakan aktifkan tahun pelajaran terlebih dahulu.')
                ->withInput();
        }

        try {
            $data = $this->prepareTenantData($validated);
            $data['academic_year'] = $currentAcademicYear->year_name;
            $data['is_active'] = true;
            
            // Handle both field names for compatibility
            if (isset($data['time_start'])) {
                $data['start_time'] = $data['time_start'];
                unset($data['time_start']);
            }
            if (isset($data['time_end'])) {
                $data['end_time'] = $data['time_end'];
                unset($data['time_end']);
            }

            Schedule::create($data);

            return redirect()->route('tenant.schedules.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Jadwal berhasil ditambahkan');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan jadwal');
        }
    }

    /**
     * Display the specified schedule
     */
    public function show($schedule)
    {
        $scheduleModel = $this->resolveModel(Schedule::class, $schedule, [
            'classRoom',
            'subject',
            'teacher',
            'attendances'
        ]);
        
        $this->authorize('view', $scheduleModel);
        
        return view('tenant.schedules.show', ['schedule' => $scheduleModel]);
    }

    /**
     * Show the form for editing the specified schedule
     */
    public function edit($schedule)
    {
        $scheduleModel = $this->resolveModel(Schedule::class, $schedule);
        $this->authorize('update', $scheduleModel);
        
        $tenant = $this->getCurrentTenant();
        $classes = ClassRoom::where('instansi_id', $tenant->id)->active()->get();
        $subjects = Subject::where('instansi_id', $tenant->id)->active()->get();
        $teachers = Teacher::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.schedules.edit', ['schedule' => $scheduleModel, 'classes' => $classes, 'subjects' => $subjects, 'teachers' => $teachers]);
    }

    /**
     * Update the specified schedule
     */
    public function update(ScheduleRequest $request, $schedule)
    {
        $scheduleModel = $this->resolveModel(Schedule::class, $schedule);
        $this->authorize('update', $scheduleModel);

        $validated = $request->validated();

        try {
            $allowedFields = [
                'class_id',
                'subject_id',
                'teacher_id',
                'day',
                'start_time',
                'time_start',
                'end_time',
                'time_end',
                'room',
                'academic_year',
            ];

            $data = $this->getAllowedFields($request, $allowedFields);
            
            // Handle both field names for compatibility
            if (isset($data['time_start'])) {
                $data['start_time'] = $data['time_start'];
                unset($data['time_start']);
            }
            if (isset($data['time_end'])) {
                $data['end_time'] = $data['time_end'];
                unset($data['time_end']);
            }

            $scheduleModel->update($data);

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.schedules.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data jadwal berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui jadwal');
        }
    }

    /**
     * Remove the specified schedule
     */
    public function destroy($schedule)
    {
        $scheduleModel = $this->resolveModel(Schedule::class, $schedule);
        $this->authorize('delete', $scheduleModel);

        try {
            // Check for related records before deletion
            $issues = $this->checkRelationsBeforeDelete($scheduleModel, [
                'attendances' => 'Jadwal masih memiliki :count data absensi. Hapus data absensi terlebih dahulu.',
            ]);

            if (!empty($issues)) {
                return redirect()->back()
                    ->with('error', implode(' ', $issues));
            }

            $scheduleModel->delete();

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.schedules.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Jadwal berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus jadwal');
        }
    }

    /**
     * Show weekly schedule
     */
    public function weekly(Request $request)
    {
        $this->authorize('viewAny', Schedule::class);

        $tenant = $this->getCurrentTenant();
        
        $classId = $request->get('class_id');
        $academicYear = $request->get('academic_year', date('Y'));
        
        $query = Schedule::where('instansi_id', $tenant->id)
            ->where('academic_year', $academicYear);
            
        if ($classId) {
            $query->where('class_id', $classId);
        }
        
        $schedules = $query->with(['classRoom', 'subject', 'teacher'])->get();
        $classes = ClassRoom::where('instansi_id', $tenant->id)->active()->get();
        
        // Group schedules by day
        $weeklySchedule = $schedules->groupBy('day');
        
        return view('tenant.schedules.weekly', compact('weeklySchedule', 'classes', 'classId', 'academicYear'));
    }
}
