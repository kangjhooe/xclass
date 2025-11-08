<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Grade;
use App\Models\Tenant\Student;
use App\Models\Tenant\Subject;
use App\Models\Tenant\Teacher;
use App\Http\Requests\Tenant\GradeRequest;
use Illuminate\Http\Request;

class GradeController extends BaseTenantController
{
    /**
     * Display a listing of grades
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Grade::class);

        $tenant = $this->getCurrentTenant();
        
        $query = Grade::where('instansi_id', $tenant->id);

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan mata pelajaran
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->get('subject_id'));
        }

        // Filter berdasarkan semester
        if ($request->filled('semester')) {
            $query->where('semester', $request->get('semester'));
        }

        $grades = $query->with(['student', 'subject', 'teacher'])->paginate(20);
        $subjects = Subject::where('instansi_id', $tenant->id)->active()->get();

        return view('tenant.grades.index', compact('grades', 'subjects'));
    }

    /**
     * Show the form for creating a new grade
     */
    public function create(Request $request)
    {
        $this->authorize('create', Grade::class);

        $tenant = $this->getCurrentTenant();
        
        $students = Student::where('instansi_id', $tenant->id)->active()->get();
        $subjects = Subject::where('instansi_id', $tenant->id)->active()->get();
        $teachers = Teacher::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.grades.create', compact('students', 'subjects', 'teachers'));
    }

    /**
     * Store a newly created grade
     */
    public function store(GradeRequest $request)
    {
        $this->authorize('create', Grade::class);

        $tenant = $this->getCurrentTenant();

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'assignment_type' => 'required|string|max:50',
            'score' => 'required|numeric|min:0|max:100',
            'max_score' => 'required|numeric|min:1',
            'semester' => 'required|string|max:20',
            'academic_year' => 'required|string|max:20',
            'notes' => 'nullable|string|max:255',
        ]);

        try {
            // Verify related models belong to tenant
            Student::where('instansi_id', $tenant->id)->findOrFail($request->student_id);
            Subject::where('instansi_id', $tenant->id)->findOrFail($request->subject_id);
            Teacher::where('instansi_id', $tenant->id)->findOrFail($request->teacher_id);

            $data = $this->prepareTenantData($validated);

            Grade::create($data);

            return redirect()->route('tenant.grades.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Nilai berhasil ditambahkan');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan nilai');
        }
    }

    /**
     * Display the specified grade
     */
    public function show($grade)
    {
        $gradeModel = $this->resolveModel(Grade::class, $grade, [
            'student',
            'subject',
            'teacher'
        ]);
        
        $this->authorize('view', $gradeModel);
        
        return view('tenant.grades.show', ['grade' => $gradeModel]);
    }

    /**
     * Show the form for editing the specified grade
     */
    public function edit($grade)
    {
        $gradeModel = $this->resolveModel(Grade::class, $grade);
        $this->authorize('update', $gradeModel);
        
        $tenant = $this->getCurrentTenant();
        
        $students = Student::where('instansi_id', $tenant->id)->active()->get();
        $subjects = Subject::where('instansi_id', $tenant->id)->active()->get();
        $teachers = Teacher::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.grades.edit', ['grade' => $gradeModel, 'students' => $students, 'subjects' => $subjects, 'teachers' => $teachers]);
    }

    /**
     * Update the specified grade
     */
    public function update(GradeRequest $request, $grade)
    {
        $gradeModel = $this->resolveModel(Grade::class, $grade);
        $this->authorize('update', $gradeModel);

        $tenant = $this->getCurrentTenant();

        $validated = $request->validated();

        try {
            // Verify related models belong to tenant
            Student::where('instansi_id', $tenant->id)->findOrFail($request->student_id);
            Subject::where('instansi_id', $tenant->id)->findOrFail($request->subject_id);
            Teacher::where('instansi_id', $tenant->id)->findOrFail($request->teacher_id);

            $allowedFields = [
                'student_id',
                'subject_id',
                'teacher_id',
                'assignment_type',
                'score',
                'max_score',
                'semester',
                'academic_year',
                'notes',
            ];

            $data = $this->getAllowedFields($request, $allowedFields);

            $gradeModel->update($data);

            return redirect()->route('tenant.grades.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data nilai berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui nilai');
        }
    }

    /**
     * Remove the specified grade
     */
    public function destroy($grade)
    {
        $gradeModel = $this->resolveModel(Grade::class, $grade);
        $this->authorize('delete', $gradeModel);

        try {
            $gradeModel->delete();

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.grades.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Nilai berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus nilai');
        }
    }

    /**
     * Show grade report by student
     */
    public function report(Request $request)
    {
        $this->authorize('viewAny', Grade::class);

        $tenant = $this->getCurrentTenant();
        
        $studentId = $request->get('student_id');
        $semester = $request->get('semester');
        $academicYear = $request->get('academic_year');
        
        $query = Grade::where('instansi_id', $tenant->id);
        
        if ($studentId) {
            // Verify student belongs to tenant
            $student = Student::where('instansi_id', $tenant->id)
                ->findOrFail($studentId);
            $query->where('student_id', $studentId);
        }
        
        if ($semester) {
            $query->where('semester', $semester);
        }
        
        if ($academicYear) {
            $query->where('academic_year', $academicYear);
        }
        
        $grades = $query->with(['student', 'subject', 'teacher'])
            ->get()
            ->groupBy('student_id');
            
        $students = Student::where('instansi_id', $tenant->id)->active()->get();
        
        return view('tenant.grades.report', compact('grades', 'students', 'studentId', 'semester', 'academicYear'));
    }
}
