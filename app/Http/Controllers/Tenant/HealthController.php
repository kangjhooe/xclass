<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\HealthRecord;
use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HealthController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get health statistics
        $stats = [
            'total_records' => HealthRecord::where('instansi_id', $instansiId)->count(),
            'this_month_records' => HealthRecord::where('instansi_id', $instansiId)
                ->whereMonth('checkup_date', now()->month)
                ->whereYear('checkup_date', now()->year)
                ->count(),
            'healthy_students' => HealthRecord::where('instansi_id', $instansiId)
                ->where('health_status', 'healthy')
                ->distinct('student_id')
                ->count(),
            'sick_students' => HealthRecord::where('instansi_id', $instansiId)
                ->where('health_status', 'sick')
                ->distinct('student_id')
                ->count()
        ];

        // Get recent health records
        $recentRecords = HealthRecord::where('instansi_id', $instansiId)
            ->with(['student', 'student.classRoom'])
            ->orderBy('checkup_date', 'desc')
            ->limit(10)
            ->get();

        return view('tenant.health.index', [
            'title' => 'Kesehatan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Kesehatan', 'url' => null]
            ],
            'stats' => $stats,
            'recentRecords' => $recentRecords
        ]);
    }

    /**
     * Display records management
     */
    public function records(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = HealthRecord::where('instansi_id', $instansiId)
            ->with(['student', 'student.classRoom']);

        // Filter by student
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by health status
        if ($request->filled('health_status')) {
            $query->where('health_status', $request->health_status);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('checkup_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('checkup_date', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        $records = $query->orderBy('checkup_date', 'desc')->paginate(20);
        
        $students = Student::where('instansi_id', $instansiId)->get();
        $classRooms = ClassRoom::where('instansi_id', $instansiId)->get();

        return view('tenant.health.records', [
            'title' => 'Rekam Medis',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Kesehatan', 'url' => route('tenant.health.index')],
                ['name' => 'Rekam Medis', 'url' => null]
            ],
            'records' => $records,
            'students' => $students,
            'classRooms' => $classRooms
        ]);
    }

    /**
     * Show the form for creating a new record.
     */
    public function createRecord()
    {
        $instansiId = $this->getInstansiId();
        
        $students = Student::where('instansi_id', $instansiId)->get();
        $classRooms = ClassRoom::where('instansi_id', $instansiId)->get();

        return view('tenant.health.records.create', [
            'title' => 'Tambah Rekam Medis',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Kesehatan', 'url' => route('tenant.health.index')],
                ['name' => 'Rekam Medis', 'url' => route('tenant.health.records')],
                ['name' => 'Tambah Rekam Medis', 'url' => null]
            ],
            'students' => $students,
            'classRooms' => $classRooms
        ]);
    }

    /**
     * Store a newly created record in storage.
     */
    public function storeRecord(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'checkup_date' => 'required|date',
            'health_status' => 'required|in:healthy,sick,recovering',
            'height' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'blood_pressure' => 'nullable|string|max:20',
            'temperature' => 'nullable|numeric|min:0',
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'medication' => 'nullable|string',
            'notes' => 'nullable|string',
            'follow_up_date' => 'nullable|date|after:checkup_date'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            HealthRecord::create([
                'instansi_id' => $instansiId,
                'student_id' => $request->student_id,
                'checkup_date' => $request->checkup_date,
                'health_status' => $request->health_status,
                'height' => $request->height,
                'weight' => $request->weight,
                'blood_pressure' => $request->blood_pressure,
                'temperature' => $request->temperature,
                'symptoms' => $request->symptoms,
                'diagnosis' => $request->diagnosis,
                'treatment' => $request->treatment,
                'medication' => $request->medication,
                'notes' => $request->notes,
                'follow_up_date' => $request->follow_up_date
            ]);

            DB::commit();

            return redirect()->route('tenant.health.records')
                ->with('success', 'Rekam medis berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified record.
     */
    public function editRecord(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $record = HealthRecord::where('instansi_id', $instansiId)
            ->with(['student'])
            ->findOrFail($id);
            
        $students = Student::where('instansi_id', $instansiId)->get();
        $classRooms = ClassRoom::where('instansi_id', $instansiId)->get();

        return view('tenant.health.records.edit', [
            'title' => 'Edit Rekam Medis',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Kesehatan', 'url' => route('tenant.health.index')],
                ['name' => 'Rekam Medis', 'url' => route('tenant.health.records')],
                ['name' => 'Edit Rekam Medis', 'url' => null]
            ],
            'record' => $record,
            'students' => $students,
            'classRooms' => $classRooms
        ]);
    }

    /**
     * Update the specified record in storage.
     */
    public function updateRecord(Request $request, string $id)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'checkup_date' => 'required|date',
            'health_status' => 'required|in:healthy,sick,recovering',
            'height' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'blood_pressure' => 'nullable|string|max:20',
            'temperature' => 'nullable|numeric|min:0',
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'medication' => 'nullable|string',
            'notes' => 'nullable|string',
            'follow_up_date' => 'nullable|date|after:checkup_date'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $record = HealthRecord::where('instansi_id', $instansiId)->findOrFail($id);
            
            $record->update([
                'student_id' => $request->student_id,
                'checkup_date' => $request->checkup_date,
                'health_status' => $request->health_status,
                'height' => $request->height,
                'weight' => $request->weight,
                'blood_pressure' => $request->blood_pressure,
                'temperature' => $request->temperature,
                'symptoms' => $request->symptoms,
                'diagnosis' => $request->diagnosis,
                'treatment' => $request->treatment,
                'medication' => $request->medication,
                'notes' => $request->notes,
                'follow_up_date' => $request->follow_up_date
            ]);

            DB::commit();

            return redirect()->route('tenant.health.records')
                ->with('success', 'Rekam medis berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified record.
     */
    public function showRecord(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $record = HealthRecord::where('instansi_id', $instansiId)
            ->with(['student', 'student.classRoom'])
            ->findOrFail($id);

        return view('tenant.health.records.show', [
            'title' => 'Detail Rekam Medis',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Kesehatan', 'url' => route('tenant.health.index')],
                ['name' => 'Rekam Medis', 'url' => route('tenant.health.records')],
                ['name' => 'Detail Rekam Medis', 'url' => null]
            ],
            'record' => $record
        ]);
    }

    /**
     * Remove the specified record from storage.
     */
    public function destroyRecord(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $record = HealthRecord::where('instansi_id', $instansiId)->findOrFail($id);
            $record->delete();

            return redirect()->route('tenant.health.records')
                ->with('success', 'Rekam medis berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Get student health history
     */
    public function getStudentHistory(Student $student)
    {
        $instansiId = $this->getInstansiId();
        
        $records = HealthRecord::where('instansi_id', $instansiId)
            ->where('student_id', $student->id)
            ->orderBy('checkup_date', 'desc')
            ->get();

        return response()->json($records);
    }

    /**
     * Export health records
     */
    public function exportRecords(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = HealthRecord::where('instansi_id', $instansiId)
            ->with(['student', 'student.classRoom']);

        // Apply filters
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->filled('health_status')) {
            $query->where('health_status', $request->health_status);
        }
        if ($request->filled('start_date')) {
            $query->whereDate('checkup_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('checkup_date', '<=', $request->end_date);
        }

        $records = $query->orderBy('checkup_date', 'desc')->get();

        $filename = "data-rekam-medis-" . now()->format('Y-m-d_H-i-s') . ".xlsx";
        
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\HealthRecordExport($records),
            $filename
        );
    }

    /**
     * Health check schedule management
     */
    public function schedule(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('health_check_schedules')
            ->where('instansi_id', $instansiId);

        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('scheduled_date', $request->date);
        }

        // Filter by class
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $schedules = $query->orderBy('scheduled_date', 'asc')
            ->paginate(20);

        $classes = ClassRoom::where('instansi_id', $instansiId)->get();

        return view('tenant.health.schedule', [
            'title' => 'Jadwal Pemeriksaan Kesehatan',
            'page-title' => 'Jadwal Pemeriksaan Kesehatan',
            'schedules' => $schedules,
            'classes' => $classes
        ]);
    }

    /**
     * Create health check schedule
     */
    public function createSchedule(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:class_rooms,id',
            'scheduled_date' => 'required|date',
            'checkup_type' => 'required|in:routine,immunization,special,annual',
            'description' => 'nullable|string|max:1000',
            'responsible_person' => 'nullable|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            // Create schedule
            $scheduleId = DB::table('health_check_schedules')->insertGetId([
                'instansi_id' => $instansiId,
                'class_id' => $request->class_id,
                'scheduled_date' => $request->scheduled_date,
                'checkup_type' => $request->checkup_type,
                'description' => $request->description,
                'responsible_person' => $request->responsible_person,
                'status' => 'scheduled',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Get students in class
            $students = Student::where('instansi_id', $instansiId)
                ->where('class_id', $request->class_id)
                ->get();

            // Create individual student schedules
            foreach ($students as $student) {
                DB::table('student_health_schedules')->insert([
                    'schedule_id' => $scheduleId,
                    'student_id' => $student->id,
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();
            return redirect()->route('tenant.health.schedule')
                ->with('success', 'Jadwal pemeriksaan kesehatan berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Vaccination tracking
     */
    public function vaccinationTracking(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('vaccination_records')
            ->where('instansi_id', $instansiId)
            ->join('students', 'vaccination_records.student_id', '=', 'students.id')
            ->select('vaccination_records.*', 'students.name as student_name', 'students.student_number');

        // Filter by vaccine type
        if ($request->filled('vaccine_type')) {
            $query->where('vaccine_type', $request->vaccine_type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $vaccinations = $query->orderBy('vaccination_date', 'desc')->paginate(20);

        // Get vaccination statistics
        $stats = [
            'total_vaccinations' => DB::table('vaccination_records')->where('instansi_id', $instansiId)->count(),
            'completed' => DB::table('vaccination_records')->where('instansi_id', $instansiId)->where('status', 'completed')->count(),
            'pending' => DB::table('vaccination_records')->where('instansi_id', $instansiId)->where('status', 'pending')->count(),
            'overdue' => DB::table('vaccination_records')->where('instansi_id', $instansiId)
                ->where('status', 'pending')
                ->where('scheduled_date', '<', now()->toDateString())
                ->count()
        ];

        return view('tenant.health.vaccination-tracking', [
            'title' => 'Tracking Vaksinasi',
            'page-title' => 'Tracking Vaksinasi Siswa',
            'vaccinations' => $vaccinations,
            'stats' => $stats
        ]);
    }

    /**
     * Record vaccination
     */
    public function recordVaccination(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'vaccine_type' => 'required|string|max:255',
            'vaccination_date' => 'required|date',
            'dose_number' => 'required|integer|min:1',
            'batch_number' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'next_dose_date' => 'nullable|date|after:vaccination_date',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            DB::table('vaccination_records')->insert([
                'instansi_id' => $instansiId,
                'student_id' => $request->student_id,
                'vaccine_type' => $request->vaccine_type,
                'vaccination_date' => $request->vaccination_date,
                'dose_number' => $request->dose_number,
                'batch_number' => $request->batch_number,
                'manufacturer' => $request->manufacturer,
                'next_dose_date' => $request->next_dose_date,
                'status' => 'completed',
                'notes' => $request->notes,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return redirect()->route('tenant.health.vaccination-tracking')
                ->with('success', 'Data vaksinasi berhasil direkam');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Schedule vaccination for students
     */
    public function scheduleVaccination(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'vaccine_type' => 'required|string|max:255',
            'scheduled_date' => 'required|date',
            'dose_number' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $created = 0;
            foreach ($request->student_ids as $studentId) {
                DB::table('vaccination_records')->insert([
                    'instansi_id' => $instansiId,
                    'student_id' => $studentId,
                    'vaccine_type' => $request->vaccine_type,
                    'scheduled_date' => $request->scheduled_date,
                    'dose_number' => $request->dose_number,
                    'status' => 'pending',
                    'notes' => $request->notes,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $created++;
            }

            DB::commit();
            return redirect()->route('tenant.health.vaccination-tracking')
                ->with('success', "Berhasil menjadwalkan {$created} vaksinasi");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }
}
