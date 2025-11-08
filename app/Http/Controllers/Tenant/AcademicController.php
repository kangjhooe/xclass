<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\Curriculum;
use App\Models\Tenant\Syllabus;
use App\Models\Tenant\Subject;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AcademicController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get academic statistics
        $stats = [
            'total_curriculums' => Curriculum::where('instansi_id', $instansiId)->count(),
            'active_curriculums' => Curriculum::where('instansi_id', $instansiId)->where('is_active', true)->count(),
            'total_syllabi' => Syllabus::where('instansi_id', $instansiId)->count(),
            'total_subjects' => Subject::where('instansi_id', $instansiId)->count()
        ];

        // Get recent curriculums
        $recentCurriculums = Curriculum::where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent syllabi
        $recentSyllabi = Syllabus::where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.academic.index', [
            'title' => 'Akademik',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => null]
            ],
            'stats' => $stats,
            'recentCurriculums' => $recentCurriculums,
            'recentSyllabi' => $recentSyllabi
        ]);
    }

    /**
     * Display curriculum management
     */
    public function curriculum(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Curriculum::where('instansi_id', $instansiId);

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status == 'active') {
                $query->where('is_active', true);
            } elseif ($request->status == 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $curriculums = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('tenant.academic.curriculum', [
            'title' => 'Kurikulum',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => route('tenant.academic.index')],
                ['name' => 'Kurikulum', 'url' => null]
            ],
            'curriculums' => $curriculums
        ]);
    }

    /**
     * Display syllabus management
     */
    public function syllabus(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Syllabus::where('instansi_id', $instansiId)
            ->with(['subject', 'classRoom', 'academicYear']);

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by class
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filter by academic year
        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->academic_year_id);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $syllabi = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get filter options
        $subjects = Subject::where('instansi_id', $instansiId)->get();
        $classes = ClassRoom::where('instansi_id', $instansiId)->get();
        $academicYears = AcademicYear::where('instansi_id', $instansiId)->get();

        return view('tenant.academic.syllabus', [
            'title' => 'Silabus',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => route('tenant.academic.index')],
                ['name' => 'Silabus', 'url' => null]
            ],
            'syllabi' => $syllabi,
            'subjects' => $subjects,
            'classes' => $classes,
            'academicYears' => $academicYears
        ]);
    }

    /**
     * Show the form for creating a new curriculum.
     */
    public function createCurriculum()
    {
        return view('tenant.academic.curriculum.create', [
            'title' => 'Tambah Kurikulum',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => route('tenant.academic.index')],
                ['name' => 'Kurikulum', 'url' => route('tenant.academic.curriculum')],
                ['name' => 'Tambah Kurikulum', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created curriculum in storage.
     */
    public function storeCurriculum(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            // If this curriculum is set as active, deactivate others
            if ($request->has('is_active') && $request->is_active) {
                Curriculum::where('instansi_id', $instansiId)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }
            
            $curriculum = Curriculum::create([
                'instansi_id' => $instansiId,
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->has('is_active') ? $request->is_active : false,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date
            ]);

            DB::commit();

            return redirect()->route('tenant.academic.curriculum')
                ->with('success', 'Kurikulum berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new syllabus.
     */
    public function createSyllabus()
    {
        $instansiId = $this->getInstansiId();
        
        $subjects = Subject::where('instansi_id', $instansiId)->get();
        $classes = ClassRoom::where('instansi_id', $instansiId)->get();
        $academicYears = AcademicYear::where('instansi_id', $instansiId)->get();

        return view('tenant.academic.syllabus.create', [
            'title' => 'Tambah Silabus',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => route('tenant.academic.index')],
                ['name' => 'Silabus', 'url' => route('tenant.academic.syllabus')],
                ['name' => 'Tambah Silabus', 'url' => null]
            ],
            'subjects' => $subjects,
            'classes' => $classes,
            'academicYears' => $academicYears
        ]);
    }

    /**
     * Store a newly created syllabus in storage.
     */
    public function storeSyllabus(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:class_rooms,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'objectives' => 'nullable|string',
            'materials' => 'nullable|string',
            'activities' => 'nullable|string',
            'assessment' => 'nullable|string',
            'resources' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $syllabus = Syllabus::create([
                'instansi_id' => $instansiId,
                'title' => $request->title,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'class_id' => $request->class_id,
                'academic_year_id' => $request->academic_year_id,
                'objectives' => $request->objectives,
                'materials' => $request->materials,
                'activities' => $request->activities,
                'assessment' => $request->assessment,
                'resources' => $request->resources
            ]);

            DB::commit();

            return redirect()->route('tenant.academic.syllabus')
                ->with('success', 'Silabus berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified curriculum.
     */
    public function showCurriculum(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $curriculum = Curriculum::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.academic.curriculum.show', [
            'title' => 'Detail Kurikulum',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => route('tenant.academic.index')],
                ['name' => 'Kurikulum', 'url' => route('tenant.academic.curriculum')],
                ['name' => 'Detail Kurikulum', 'url' => null]
            ],
            'curriculum' => $curriculum
        ]);
    }

    /**
     * Show the specified syllabus.
     */
    public function showSyllabus(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $syllabus = Syllabus::where('instansi_id', $instansiId)
            ->with(['subject', 'classRoom', 'academicYear'])
            ->findOrFail($id);

        return view('tenant.academic.syllabus.show', [
            'title' => 'Detail Silabus',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => route('tenant.academic.index')],
                ['name' => 'Silabus', 'url' => route('tenant.academic.syllabus')],
                ['name' => 'Detail Silabus', 'url' => null]
            ],
            'syllabus' => $syllabus
        ]);
    }

    /**
     * Show the form for editing the specified curriculum.
     */
    public function editCurriculum(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $curriculum = Curriculum::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.academic.curriculum.edit', [
            'title' => 'Edit Kurikulum',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => route('tenant.academic.index')],
                ['name' => 'Kurikulum', 'url' => route('tenant.academic.curriculum')],
                ['name' => 'Edit Kurikulum', 'url' => null]
            ],
            'curriculum' => $curriculum
        ]);
    }

    /**
     * Show the form for editing the specified syllabus.
     */
    public function editSyllabus(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $syllabus = Syllabus::where('instansi_id', $instansiId)->findOrFail($id);
        $subjects = Subject::where('instansi_id', $instansiId)->get();
        $classes = ClassRoom::where('instansi_id', $instansiId)->get();
        $academicYears = AcademicYear::where('instansi_id', $instansiId)->get();

        return view('tenant.academic.syllabus.edit', [
            'title' => 'Edit Silabus',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Akademik', 'url' => route('tenant.academic.index')],
                ['name' => 'Silabus', 'url' => route('tenant.academic.syllabus')],
                ['name' => 'Edit Silabus', 'url' => null]
            ],
            'syllabus' => $syllabus,
            'subjects' => $subjects,
            'classes' => $classes,
            'academicYears' => $academicYears
        ]);
    }

    /**
     * Update the specified curriculum in storage.
     */
    public function updateCurriculum(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $curriculum = Curriculum::where('instansi_id', $instansiId)->findOrFail($id);
            
            // If this curriculum is set as active, deactivate others
            if ($request->has('is_active') && $request->is_active) {
                Curriculum::where('instansi_id', $instansiId)
                    ->where('is_active', true)
                    ->where('id', '!=', $id)
                    ->update(['is_active' => false]);
            }
            
            $curriculum->update([
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->has('is_active') ? $request->is_active : false,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date
            ]);

            DB::commit();

            return redirect()->route('tenant.academic.curriculum')
                ->with('success', 'Kurikulum berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified syllabus in storage.
     */
    public function updateSyllabus(Request $request, string $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:class_rooms,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'objectives' => 'nullable|string',
            'materials' => 'nullable|string',
            'activities' => 'nullable|string',
            'assessment' => 'nullable|string',
            'resources' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $syllabus = Syllabus::where('instansi_id', $instansiId)->findOrFail($id);
            
            $syllabus->update([
                'title' => $request->title,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'class_id' => $request->class_id,
                'academic_year_id' => $request->academic_year_id,
                'objectives' => $request->objectives,
                'materials' => $request->materials,
                'activities' => $request->activities,
                'assessment' => $request->assessment,
                'resources' => $request->resources
            ]);

            DB::commit();

            return redirect()->route('tenant.academic.syllabus')
                ->with('success', 'Silabus berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified curriculum from storage.
     */
    public function destroyCurriculum(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $curriculum = Curriculum::where('instansi_id', $instansiId)->findOrFail($id);
            $curriculum->delete();

            return redirect()->route('tenant.academic.curriculum')
                ->with('success', 'Kurikulum berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified syllabus from storage.
     */
    public function destroySyllabus(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $syllabus = Syllabus::where('instansi_id', $instansiId)->findOrFail($id);
            $syllabus->delete();

            return redirect()->route('tenant.academic.syllabus')
                ->with('success', 'Silabus berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Lesson planning
     */
    public function lessonPlanning(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('lesson_plans')
            ->join('subjects', 'lesson_plans.subject_id', '=', 'subjects.id')
            ->join('class_rooms', 'lesson_plans.class_id', '=', 'class_rooms.id')
            ->where('subjects.instansi_id', $instansiId)
            ->select('lesson_plans.*', 'subjects.name as subject_name', 'class_rooms.name as class_name');

        // Filter by class
        if ($request->filled('class_id')) {
            $query->where('lesson_plans.class_id', $request->class_id);
        }

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->where('lesson_plans.subject_id', $request->subject_id);
        }

        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('lesson_date', $request->date);
        }

        $plans = $query->orderBy('lesson_date', 'desc')->paginate(20);

        $classes = ClassRoom::where('instansi_id', $instansiId)->get();
        $subjects = Subject::where('instansi_id', $instansiId)->get();

        return view('tenant.academic.lesson-planning', [
            'title' => 'Rencana Pembelajaran',
            'page-title' => 'Rencana Pembelajaran',
            'plans' => $plans,
            'classes' => $classes,
            'subjects' => $subjects
        ]);
    }

    /**
     * Create lesson plan
     */
    public function createLessonPlan(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:class_rooms,id',
            'lesson_date' => 'required|date',
            'topic' => 'required|string|max:255',
            'objectives' => 'required|string|max:1000',
            'materials' => 'nullable|string|max:1000',
            'activities' => 'required|string|max:2000',
            'assessment' => 'nullable|string|max:1000',
            'homework' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            DB::table('lesson_plans')->insert([
                'subject_id' => $request->subject_id,
                'class_id' => $request->class_id,
                'lesson_date' => $request->lesson_date,
                'topic' => $request->topic,
                'objectives' => $request->objectives,
                'materials' => $request->materials,
                'activities' => $request->activities,
                'assessment' => $request->assessment,
                'homework' => $request->homework,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return redirect()->route('tenant.academic.lesson-planning')
                ->with('success', 'Rencana pembelajaran berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }
}
