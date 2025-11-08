<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Staff;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use App\Exports\TeacherExport;
use App\Exports\StudentExport;
use App\Exports\StaffExport;
use App\Exports\ClassRoomExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DataPokokController extends BaseTenantController
{
    /**
     * Display dashboard for Data Pokok
     */
    public function index()
    {
        // Check module access
        $this->authorize('viewAny', \App\Models\Tenant\ClassRoom::class); // Using ClassRoom policy as proxy

        $tenant = $this->getCurrentTenant();
        
        // Get statistics
        $stats = [
            'teachers' => Teacher::where('instansi_id', $tenant->id)->count(),
            'students' => Student::where('instansi_id', $tenant->id)->count(),
            'staff' => Staff::where('instansi_id', $tenant->id)->count(),
            'classes' => ClassRoom::where('instansi_id', $tenant->id)->count(),
        ];

        // Get recent activities
        $recentTeachers = Teacher::where('instansi_id', $tenant->id)
            ->latest()
            ->limit(5)
            ->get();

        $recentStudents = Student::where('instansi_id', $tenant->id)
            ->latest()
            ->limit(5)
            ->get();

        $recentStaff = Staff::where('instansi_id', $tenant->id)
            ->latest()
            ->limit(5)
            ->get();

        return view('tenant.data-pokok.index', compact('stats', 'recentTeachers', 'recentStudents', 'recentStaff'));
    }

    /**
     * Export all data pokok to Excel
     */
    public function export(Request $request): BinaryFileResponse
    {
        // Check export permission
        $this->authorize('export', \App\Models\Tenant\ClassRoom::class); // Using ClassRoom policy as proxy

        $tenant = $this->getCurrentTenant();
        
        $type = $request->get('type', 'all');
        $filename = "data-pokok-{$type}-" . now()->format('Y-m-d_H-i-s') . ".xlsx";
        
        try {
            switch ($type) {
                case 'teachers':
                    $data = Teacher::where('instansi_id', $tenant->id)->get();
                    return Excel::download(new TeacherExport($data), $filename);
                    
                case 'students':
                    $data = Student::where('instansi_id', $tenant->id)->get();
                    return Excel::download(new StudentExport($data), $filename);
                    
                case 'staff':
                    $data = Staff::where('instansi_id', $tenant->id)->get();
                    return Excel::download(new StaffExport($data), $filename);
                    
                case 'classes':
                    $data = ClassRoom::where('instansi_id', $tenant->id)->get();
                    return Excel::download(new ClassRoomExport($data), $filename);
                    
                default:
                    // Export all data - create multiple sheets
                    $teachers = Teacher::where('instansi_id', $tenant->id)->get();
                    $students = Student::where('instansi_id', $tenant->id)->get();
                    $staff = Staff::where('instansi_id', $tenant->id)->get();
                    $classes = ClassRoom::where('instansi_id', $tenant->id)->get();
                    
                    // Create multiple sheets export
                    return Excel::download([
                        'Guru' => new TeacherExport($teachers),
                        'Siswa' => new StudentExport($students),
                        'Staf' => new StaffExport($staff),
                        'Kelas' => new ClassRoomExport($classes),
                    ], $filename);
            }
        } catch (\Exception $e) {
            \Log::error('Export Data Pokok Error: ' . $e->getMessage());
            abort(500, 'Terjadi kesalahan saat mengekspor data: ' . $e->getMessage());
        }
    }

    /**
     * Search across all data pokok
     */
    public function search(Request $request)
    {
        // Check module access
        $this->authorize('viewAny', \App\Models\Tenant\ClassRoom::class); // Using ClassRoom policy as proxy

        $tenant = $this->getCurrentTenant();
        $search = $request->get('q', '');
        
        if (empty($search)) {
            return response()->json(['results' => []]);
        }

        try {
            $results = [];

            // Search teachers
            $teachers = Teacher::where('instansi_id', $tenant->id)
                ->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('employee_number', 'like', "%{$search}%")
                      ->orWhere('nip', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->limit(10)
                ->get(['id', 'name', 'employee_number', 'email']);

            foreach ($teachers as $teacher) {
                $results[] = [
                    'type' => 'teacher',
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'detail' => $teacher->employee_number,
                    'url' => route('tenant.teachers.show', ['tenant' => $tenant->npsn, 'teacher' => $teacher->id]),
                ];
            }

            // Search students
            $students = Student::where('instansi_id', $tenant->id)
                ->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('student_number', 'like', "%{$search}%")
                      ->orWhere('nisn', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->limit(10)
                ->get(['id', 'name', 'student_number', 'nisn']);

            foreach ($students as $student) {
                $results[] = [
                    'type' => 'student',
                    'id' => $student->id,
                    'name' => $student->name,
                    'detail' => $student->student_number ?? $student->nisn,
                    'url' => route('tenant.students.show', ['tenant' => $tenant->npsn, 'student' => $student->id]),
                ];
            }

            // Search staff
            $staff = Staff::where('instansi_id', $tenant->id)
                ->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('employee_number', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->limit(10)
                ->get(['id', 'name', 'employee_number', 'email']);

            foreach ($staff as $s) {
                $results[] = [
                    'type' => 'staff',
                    'id' => $s->id,
                    'name' => $s->name,
                    'detail' => $s->employee_number ?? $s->email,
                    'url' => route('tenant.data-pokok.non-teaching-staff.show', ['tenant' => $tenant->npsn, 'nonTeachingStaff' => $s->id]),
                ];
            }

            // Search classes
            $classes = ClassRoom::where('instansi_id', $tenant->id)
                ->where('name', 'like', "%{$search}%")
                ->limit(10)
                ->get(['id', 'name', 'level']);

            foreach ($classes as $class) {
                $results[] = [
                    'type' => 'class',
                    'id' => $class->id,
                    'name' => $class->name,
                    'detail' => $class->level,
                    'url' => route('tenant.classes.show', ['tenant' => $tenant->npsn, 'class' => $class->id]),
                ];
            }

            return response()->json(['results' => $results]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Terjadi kesalahan saat mencari data: ' . $e->getMessage()
            ], 500);
        }
    }
}
