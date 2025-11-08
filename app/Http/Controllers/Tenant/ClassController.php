<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;
use App\Models\Tenant\Room;
use App\Http\Requests\Tenant\ClassRoomRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClassController extends BaseTenantController
{
    /**
     * Display a listing of classes
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', ClassRoom::class);

        $tenant = $this->getCurrentTenant();
        
        $query = ClassRoom::where('instansi_id', $tenant->id);

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('level', 'like', "%{$search}%");
            });
        }

        $classes = $query->with(['homeroomTeacher', 'students', 'room'])->paginate(20);
        
        // Get teachers for homeroom teacher dropdown
        $teachers = Teacher::where('instansi_id', $tenant->id)->active()->orderBy('name')->get();

        return view('tenant.classes.index', compact('classes', 'teachers'));
    }

    /**
     * Show the form for creating a new class
     */
    public function create()
    {
        $this->authorize('create', ClassRoom::class);

        $tenant = $this->getCurrentTenant();
        $teachers = Teacher::where('instansi_id', $tenant->id)->active()->get();
        $rooms = Room::where('instansi_id', $tenant->id)
            ->where('type', 'classroom')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
        
        return view('tenant.classes.create', compact('teachers', 'rooms'));
    }

    /**
     * Store a newly created class
     */
    public function store(ClassRoomRequest $request)
    {
        $this->authorize('create', ClassRoom::class);

        $validated = $request->validated();

        try {
            // Prepare data with tenant info and only allowed fields
            $data = $this->prepareTenantData($validated);
            $data['is_active'] = $request->boolean('is_active', true);

            ClassRoom::create($data);

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.classes.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Kelas berhasil ditambahkan');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan kelas');
        }
    }

    /**
     * Display the specified class
     */
    public function show(ClassRoom $class)
    {
        // Ensure tenant access
        $this->ensureTenantAccess($class);
        
        $classRoom = $class->load([
            'homeroomTeacher',
            'students',
            'teachers',
            'schedules',
            'room'
        ]);

        $this->authorize('view', $classRoom);
        
        // Get teachers for homeroom teacher dropdown
        $tenant = $this->getCurrentTenant();
        $teachers = Teacher::where('instansi_id', $tenant->id)->active()->orderBy('name')->get();
        
        return view('tenant.classes.show', ['class' => $classRoom, 'teachers' => $teachers]);
    }

    /**
     * Show the form for editing the specified class
     */
    public function edit($class)
    {
        $classRoom = $this->resolveModel(ClassRoom::class, $class);
        $this->authorize('update', $classRoom);
        
        $tenant = $this->getCurrentTenant();
        $teachers = Teacher::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.classes.edit', compact('classRoom', 'teachers'));
    }

    /**
     * Update the specified class
     */
    public function update(ClassRoomRequest $request, $class)
    {
        $classRoom = $this->resolveModel(ClassRoom::class, $class);
        $this->authorize('update', $classRoom);

        $validated = $request->validated();

        try {
            // Only update allowed fields, prevent mass assignment
            $allowedFields = [
                'name',
                'level',
                'room_number',
                'capacity',
                'homeroom_teacher_id',
                'academic_year',
                'is_active',
            ];

            $data = $this->getAllowedFields($request, $allowedFields);
            if ($request->has('is_active')) {
                $data['is_active'] = $request->boolean('is_active');
            }

            $classRoom->update($data);

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.classes.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data kelas berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui kelas');
        }
    }

    /**
     * Remove the specified class
     */
    public function destroy($class)
    {
        $classRoom = $this->resolveModel(ClassRoom::class, $class);
        $this->authorize('delete', $classRoom);

        try {
            // Check for related records before deletion
            $issues = $this->checkRelationsBeforeDelete($classRoom, [
                'students' => 'Kelas masih memiliki :count siswa. Pindahkan siswa terlebih dahulu sebelum menghapus kelas.',
                'schedules' => 'Kelas masih memiliki :count jadwal. Hapus jadwal terlebih dahulu sebelum menghapus kelas.',
            ]);

            if (!empty($issues)) {
                return redirect()->back()
                    ->with('error', implode(' ', $issues));
            }

            $classRoom->delete();

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.classes.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Kelas berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus kelas');
        }
    }

    /**
     * Show students in this class
     */
    public function students($class)
    {
        $classRoom = $this->resolveModel(ClassRoom::class, $class, ['students']);
        $this->authorize('view', $classRoom);
        
        return view('tenant.classes.students', ['class' => $classRoom]);
    }

    /**
     * Show schedules for this class
     */
    public function schedules($class)
    {
        $classRoom = $this->resolveModel(ClassRoom::class, $class, [
            'schedules.subject',
            'schedules.teacher'
        ]);
        $this->authorize('view', $classRoom);
        
        return view('tenant.classes.schedules', ['class' => $classRoom]);
    }

    /**
     * Add students to class
     */
    public function addStudents(Request $request, $class)
    {
        // Handle both model instance and ID
        if (is_numeric($class) || is_string($class)) {
            $classRoom = $this->resolveModel(ClassRoom::class, $class);
        } elseif ($class instanceof ClassRoom) {
            $this->ensureTenantAccess($class);
            $classRoom = $class;
        } else {
            throw new \InvalidArgumentException('Invalid class parameter');
        }
        
        $this->authorize('update', $classRoom);

        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        try {
            $tenant = $this->getCurrentTenant();
            
            // Update students to this class
            Student::where('instansi_id', $tenant->id)
                ->whereIn('id', $request->student_ids)
                ->update(['class_id' => $classRoom->id]);

            return redirect()->route('tenant.classes.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Siswa berhasil ditambahkan ke kelas');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menambahkan siswa: ' . $e->getMessage());
        }
    }

    /**
     * Set homeroom teacher for class
     */
    public function setHomeroomTeacher(Request $request, $class)
    {
        // Handle both model instance and ID
        if (is_numeric($class) || is_string($class)) {
            $classRoom = $this->resolveModel(ClassRoom::class, $class);
        } elseif ($class instanceof ClassRoom) {
            $this->ensureTenantAccess($class);
            $classRoom = $class;
        } else {
            throw new \InvalidArgumentException('Invalid class parameter');
        }
        
        $this->authorize('update', $classRoom);

        $request->validate([
            'homeroom_teacher_id' => 'nullable|exists:teachers,id',
        ]);

        try {
            $tenant = $this->getCurrentTenant();
            
            // Verify teacher belongs to tenant
            if ($request->homeroom_teacher_id) {
                $teacher = Teacher::where('instansi_id', $tenant->id)
                    ->findOrFail($request->homeroom_teacher_id);
            }

            $classRoom->update([
                'homeroom_teacher_id' => $request->homeroom_teacher_id
            ]);

            $message = $request->homeroom_teacher_id 
                ? 'Wali kelas berhasil ditetapkan' 
                : 'Wali kelas berhasil dihapus';

            return redirect()->route('tenant.classes.index', ['tenant' => $tenant->npsn])
                ->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menetapkan wali kelas: ' . $e->getMessage());
        }
    }

    /**
     * Get students not in any class or in other classes (for add students modal)
     */
    public function getAvailableStudents(Request $request, $class)
    {
        try {
            // Handle both model instance and ID
            if (is_numeric($class) || is_string($class)) {
                // Ensure it's not NPSN (8 digits)
                if (is_string($class) && preg_match('/^\d{8}$/', $class)) {
                    Log::warning('getAvailableStudents received NPSN instead of class ID', [
                        'value' => $class,
                        'url' => $request->fullUrl()
                    ]);
                    throw new \InvalidArgumentException('Invalid class parameter: received NPSN instead of class ID');
                }
                $classRoom = $this->resolveModel(ClassRoom::class, $class);
            } elseif ($class instanceof ClassRoom) {
                $this->ensureTenantAccess($class);
                $classRoom = $class;
            } else {
                throw new \InvalidArgumentException('Invalid class parameter');
            }
            
            $this->authorize('view', $classRoom);

            $tenant = $this->getCurrentTenant();
            $search = $request->get('search', '');

            $query = Student::where('instansi_id', $tenant->id)
                ->where('is_active', true)
                ->where(function($q) use ($classRoom) {
                    $q->whereNull('class_id')
                      ->orWhere('class_id', '!=', $classRoom->id);
                });

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nis', 'like', "%{$search}%")
                      ->orWhere('nisn', 'like', "%{$search}%");
                });
            }

            // Load students with their class relationship
            $students = $query->with('classRoom')
                ->orderBy('name')
                ->limit(50)
                ->get();

            // Map to response format
            $result = $students->map(function($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nis' => $student->nis ?? null,
                    'nisn' => $student->nisn ?? null,
                    'class_id' => $student->class_id,
                    'class_name' => $student->classRoom ? $student->classRoom->name : null,
                ];
            });

            return response()->json($result->values());
        } catch (\Exception $e) {
            Log::error('Error getting available students', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'class_id' => $class,
            ]);

            return response()->json([
                'error' => 'Gagal memuat data siswa',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
