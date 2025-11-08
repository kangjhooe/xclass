<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\Services\CourseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    protected $courseService;

    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    /**
     * Display a listing of courses
     */
    public function index(Request $request)
    {
        $query = Course::with(['teacher', 'subject', 'enrollments']);

        // Filter by teacher
        if (Auth::user()->hasRole('teacher') && Auth::user()->teacher) {
            $query->forTeacher(Auth::user()->teacher->id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by published
        if ($request->filled('published')) {
            $query->where('is_published', $request->published);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $courses = $query->orderBy('created_at', 'desc')->paginate(12);

        return view('elearning::courses.index', [
            'title' => 'Manajemen Kursus',
            'courses' => $courses,
        ]);
    }

    /**
     * Show the form for creating a new course
     */
    public function create()
    {
        $subjects = \App\Models\Tenant\Subject::where('instansi_id', tenant('id'))->get();
        $teachers = \App\Models\Tenant\Teacher::where('instansi_id', tenant('id'))->get();

        return view('elearning::courses.create', [
            'title' => 'Buat Kursus Baru',
            'subjects' => $subjects,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created course
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'description' => 'nullable|string',
            'syllabus' => 'nullable|string',
            'level' => 'required|in:pemula,menengah,lanjutan',
            'category' => 'nullable|string|max:255',
            'duration_hours' => 'nullable|integer|min:0',
            'max_students' => 'nullable|integer|min:1',
            'thumbnail' => 'nullable|image|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $validated['instansi_id'] = tenant('id');
            $validated['created_by'] = Auth::id();
            $validated['status'] = 'draft';

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                $validated['thumbnail'] = $request->file('thumbnail')->store('courses/thumbnails', 'public');
            }

            $course = Course::create($validated);

            DB::commit();

            return redirect()->route('tenant.elearning.courses.index')
                ->with('success', 'Kursus berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified course
     */
    public function show(Course $course)
    {
        $course->load([
            'teacher', 
            'subject', 
            'materials', 
            'videos', 
            'assignments', 
            'quizzes', 
            'forums', 
            'announcements',
            'enrollments'
        ]);

        return view('elearning::courses.show', [
            'title' => $course->title,
            'course' => $course,
        ]);
    }

    /**
     * Show the form for editing the specified course
     */
    public function edit(Course $course)
    {
        $subjects = \App\Models\Tenant\Subject::where('instansi_id', tenant('id'))->get();
        $teachers = \App\Models\Tenant\Teacher::where('instansi_id', tenant('id'))->get();

        return view('elearning::courses.edit', [
            'title' => 'Edit Kursus',
            'course' => $course,
            'subjects' => $subjects,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Update the specified course
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'description' => 'nullable|string',
            'syllabus' => 'nullable|string',
            'level' => 'required|in:pemula,menengah,lanjutan',
            'category' => 'nullable|string|max:255',
            'duration_hours' => 'nullable|integer|min:0',
            'max_students' => 'nullable|integer|min:1',
            'thumbnail' => 'nullable|image|max:2048',
            'status' => 'required|in:draft,published,archived',
        ]);

        try {
            DB::beginTransaction();

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                if ($course->thumbnail) {
                    Storage::disk('public')->delete($course->thumbnail);
                }
                $validated['thumbnail'] = $request->file('thumbnail')->store('courses/thumbnails', 'public');
            }

            $course->update($validated);

            DB::commit();

            return redirect()->route('tenant.elearning.courses.index')
                ->with('success', 'Kursus berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified course
     */
    public function destroy(Course $course)
    {
        try {
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }
            $course->delete();
            return redirect()->route('tenant.elearning.courses.index')
                ->with('success', 'Kursus berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Publish/Unpublish course
     */
    public function togglePublish(Course $course)
    {
        $course->update([
            'is_published' => !$course->is_published,
            'status' => $course->is_published ? 'published' : 'draft',
        ]);

        return redirect()->back()->with('success', 'Status kursus berhasil diperbarui');
    }
}

