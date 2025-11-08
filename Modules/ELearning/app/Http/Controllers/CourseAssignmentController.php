<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseAssignment;
use Modules\ELearning\app\Models\CourseAssignmentSubmission;
use Modules\ELearning\Services\GradeIntegrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CourseAssignmentController extends Controller
{
    protected $gradeService;

    public function __construct(GradeIntegrationService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    public function index(Course $course)
    {
        $assignments = $course->assignments()->orderBy('due_date', 'desc')->get();
        
        return view('elearning::assignments.index', [
            'title' => 'Tugas Kursus',
            'course' => $course,
            'assignments' => $assignments,
        ]);
    }

    public function create(Course $course)
    {
        return view('elearning::assignments.create', [
            'title' => 'Buat Tugas',
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'max_score' => 'required|numeric|min:0|max:100',
            'weight' => 'required|numeric|min:0|max:1',
            'due_date' => 'nullable|date|after:now',
            'allow_late_submission' => 'boolean',
            'max_attempts' => 'required|integer|min:1|max:10',
            'allowed_file_types' => 'nullable|array',
            'max_file_size_mb' => 'nullable|integer|min:1|max:100',
            'send_to_gradebook' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $assignment = CourseAssignment::create([
                'course_id' => $course->id,
                'instansi_id' => $course->instansi_id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'instructions' => $validated['instructions'],
                'max_score' => $validated['max_score'],
                'weight' => $validated['weight'],
                'due_date' => $validated['due_date'],
                'allow_late_submission' => $request->boolean('allow_late_submission', false),
                'max_attempts' => $validated['max_attempts'],
                'allowed_file_types' => $validated['allowed_file_types'] ?? [],
                'max_file_size_mb' => $validated['max_file_size_mb'] ?? 10,
                'send_to_gradebook' => $request->boolean('send_to_gradebook', true),
                'is_published' => true,
                'publish_date' => now(),
            ]);

            DB::commit();

            return redirect()->route('tenant.elearning.assignments.index', $course)
                ->with('success', 'Tugas berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Course $course, CourseAssignment $assignment)
    {
        $assignment->load('submissions');
        
        // Get student submission if logged in as student
        $studentSubmission = null;
        if (Auth::check() && Auth::user()->hasRole('student')) {
            $student = Auth::user()->student;
            if ($student) {
                $studentSubmission = $assignment->getStudentSubmission($student->id);
            }
        }

        return view('elearning::assignments.show', [
            'title' => $assignment->title,
            'course' => $course,
            'assignment' => $assignment,
            'studentSubmission' => $studentSubmission,
        ]);
    }

    public function edit(Course $course, CourseAssignment $assignment)
    {
        return view('elearning::assignments.edit', [
            'title' => 'Edit Tugas',
            'course' => $course,
            'assignment' => $assignment,
        ]);
    }

    public function update(Request $request, Course $course, CourseAssignment $assignment)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'max_score' => 'required|numeric|min:0|max:100',
            'weight' => 'required|numeric|min:0|max:1',
            'due_date' => 'nullable|date',
            'allow_late_submission' => 'boolean',
            'max_attempts' => 'required|integer|min:1|max:10',
            'allowed_file_types' => 'nullable|array',
            'max_file_size_mb' => 'nullable|integer|min:1|max:100',
            'send_to_gradebook' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $assignment->update($validated);

            DB::commit();

            return redirect()->route('tenant.elearning.assignments.index', $course)
                ->with('success', 'Tugas berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course, CourseAssignment $assignment)
    {
        try {
            $assignment->delete();
            return redirect()->route('tenant.elearning.assignments.index', $course)
                ->with('success', 'Tugas berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function submit(Request $request, Course $course, CourseAssignment $assignment)
    {
        $validated = $request->validate([
            'submission_text' => 'nullable|string',
            'files' => 'nullable|array|max:10',
            'files.*' => 'file|max:' . ($assignment->max_file_size_mb * 1024),
        ]);

        try {
            $student = Auth::user()->student;
            if (!$student) {
                return redirect()->back()->with('error', 'Anda bukan siswa');
            }

            DB::beginTransaction();

            // Check attempts
            $existingSubmissions = $assignment->submissions()
                ->where('student_id', $student->id)
                ->whereIn('status', ['submitted', 'graded', 'returned'])
                ->count();

            if ($existingSubmissions >= $assignment->max_attempts) {
                return redirect()->back()->with('error', 'Anda telah mencapai batas maksimal pengiriman');
            }

            // Handle file uploads
            $attachedFiles = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $attachedFiles[] = $file->store('courses/assignments/submissions', 'public');
                }
            }

            $submission = CourseAssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'student_id' => $student->id,
                'instansi_id' => $course->instansi_id,
                'submission_text' => $validated['submission_text'],
                'attached_files' => $attachedFiles,
                'status' => 'submitted',
                'is_late' => $assignment->isOverdue(),
                'attempt_number' => $existingSubmissions + 1,
            ]);

            $submission->markAsSubmitted();

            DB::commit();

            return redirect()->route('tenant.elearning.assignments.show', [$course, $assignment])
                ->with('success', 'Tugas berhasil dikirim');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function submissions(Course $course, CourseAssignment $assignment)
    {
        $submissions = $assignment->submissions()
            ->with('student')
            ->orderBy('submitted_at', 'desc')
            ->paginate(20);

        return view('elearning::assignments.submissions', [
            'title' => 'Daftar Pengumpulan',
            'course' => $course,
            'assignment' => $assignment,
            'submissions' => $submissions,
        ]);
    }

    public function grade(Request $request, Course $course, CourseAssignment $assignment, CourseAssignmentSubmission $submission)
    {
        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:' . $assignment->max_score,
            'feedback' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $submission->grade(
                $validated['score'],
                $validated['feedback'],
                Auth::id()
            );

            DB::commit();

            return redirect()->route('tenant.elearning.assignments.submissions', [$course, $assignment])
                ->with('success', 'Nilai berhasil diberikan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}

