<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseQuiz;
use Modules\ELearning\app\Models\CourseQuizQuestion;
use Modules\ELearning\app\Models\CourseQuizAttempt;
use Modules\ELearning\Services\GradeIntegrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CourseQuizController extends Controller
{
    protected $gradeService;

    public function __construct(GradeIntegrationService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    public function index(Course $course)
    {
        $quizzes = $course->quizzes()->orderBy('created_at', 'desc')->get();
        
        return view('elearning::quizzes.index', [
            'title' => 'Quiz Kursus',
            'course' => $course,
            'quizzes' => $quizzes,
        ]);
    }

    public function create(Course $course)
    {
        return view('elearning::quizzes.create', [
            'title' => 'Buat Quiz',
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'time_limit_minutes' => 'nullable|integer|min:1',
            'max_score' => 'required|numeric|min:0|max:100',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'max_attempts' => 'required|integer|min:1|max:10',
            'show_answers_after_submit' => 'boolean',
            'show_correct_answers' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'send_to_gradebook' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after:available_from',
        ]);

        try {
            DB::beginTransaction();

            $quiz = CourseQuiz::create([
                'course_id' => $course->id,
                'instansi_id' => $course->instansi_id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'instructions' => $validated['instructions'],
                'time_limit_minutes' => $validated['time_limit_minutes'],
                'max_score' => $validated['max_score'],
                'passing_score' => $validated['passing_score'],
                'max_attempts' => $validated['max_attempts'],
                'show_answers_after_submit' => $request->boolean('show_answers_after_submit', true),
                'show_correct_answers' => $request->boolean('show_correct_answers', true),
                'randomize_questions' => $request->boolean('randomize_questions', false),
                'randomize_answers' => $request->boolean('randomize_answers', false),
                'send_to_gradebook' => $request->boolean('send_to_gradebook', false),
                'available_from' => $validated['available_from'],
                'available_until' => $validated['available_until'],
                'is_published' => true,
            ]);

            DB::commit();

            return redirect()->route('tenant.elearning.quizzes.index', $course)
                ->with('success', 'Quiz berhasil dibuat. Silakan tambahkan pertanyaan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Course $course, CourseQuiz $quiz)
    {
        $quiz->load('questions');
        
        // Get student attempts if logged in as student
        $studentAttempts = null;
        if (Auth::check() && Auth::user()->hasRole('student')) {
            $student = Auth::user()->student;
            if ($student) {
                $studentAttempts = $quiz->getStudentAttempts($student->id)->get();
            }
        }

        return view('elearning::quizzes.show', [
            'title' => $quiz->title,
            'course' => $course,
            'quiz' => $quiz,
            'studentAttempts' => $studentAttempts,
        ]);
    }

    public function edit(Course $course, CourseQuiz $quiz)
    {
        return view('elearning::quizzes.edit', [
            'title' => 'Edit Quiz',
            'course' => $course,
            'quiz' => $quiz,
        ]);
    }

    public function update(Request $request, Course $course, CourseQuiz $quiz)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'time_limit_minutes' => 'nullable|integer|min:1',
            'max_score' => 'required|numeric|min:0|max:100',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'max_attempts' => 'required|integer|min:1|max:10',
            'show_answers_after_submit' => 'boolean',
            'show_correct_answers' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'send_to_gradebook' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after:available_from',
        ]);

        try {
            DB::beginTransaction();

            $quiz->update($validated);

            DB::commit();

            return redirect()->route('tenant.elearning.quizzes.index', $course)
                ->with('success', 'Quiz berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course, CourseQuiz $quiz)
    {
        try {
            $quiz->delete();
            return redirect()->route('tenant.elearning.quizzes.index', $course)
                ->with('success', 'Quiz berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function start(Course $course, CourseQuiz $quiz)
    {
        try {
            $student = Auth::user()->student;
            if (!$student) {
                return redirect()->back()->with('error', 'Anda bukan siswa');
            }

            if (!$quiz->isAvailable()) {
                return redirect()->back()->with('error', 'Quiz tidak tersedia saat ini');
            }

            if (!$quiz->canStudentTake($student->id)) {
                return redirect()->back()->with('error', 'Anda telah mencapai batas maksimal percobaan');
            }

            DB::beginTransaction();

            $attempt = CourseQuizAttempt::create([
                'quiz_id' => $quiz->id,
                'student_id' => $student->id,
                'instansi_id' => $course->instansi_id,
                'started_at' => now(),
                'status' => 'in_progress',
                'answers' => [],
            ]);

            DB::commit();

            return redirect()->route('tenant.elearning.quizzes.take', [$course, $quiz, $attempt]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function take(Course $course, CourseQuiz $quiz, CourseQuizAttempt $attempt)
    {
        if (!$attempt->isInProgress() || $attempt->isTimedOut()) {
            return redirect()->route('tenant.elearning.quizzes.show', [$course, $quiz])
                ->with('error', 'Attempt tidak dapat diakses');
        }

        $questionOrder = $quiz->generateRandomQuestionOrder();
        $questions = CourseQuizQuestion::whereIn('id', $questionOrder)
            ->orderByRaw('FIELD(id, ' . implode(',', $questionOrder) . ')')
            ->get();

        return view('elearning::quizzes.take', [
            'title' => 'Mengerjakan Quiz',
            'course' => $course,
            'quiz' => $quiz,
            'attempt' => $attempt,
            'questions' => $questions,
        ]);
    }

    public function submit(Request $request, Course $course, CourseQuiz $quiz, CourseQuizAttempt $attempt)
    {
        $request->validate([
            'answers' => 'required|array',
        ]);

        try {
            if (!$attempt->isInProgress()) {
                return response()->json(['error' => 'Attempt tidak dapat disubmit'], 400);
            }

            DB::beginTransaction();

            $attempt->answers = $request->answers;
            $attempt->submit();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Quiz berhasil disubmit',
                'redirect' => route('tenant.elearning.quizzes.results', [$course, $quiz, $attempt])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function results(Course $course, CourseQuiz $quiz, CourseQuizAttempt $attempt)
    {
        $attempt->load('quiz.questions');

        return view('elearning::quizzes.results', [
            'title' => 'Hasil Quiz',
            'course' => $course,
            'quiz' => $quiz,
            'attempt' => $attempt,
        ]);
    }

    public function attempts(Course $course, CourseQuiz $quiz)
    {
        $attempts = $quiz->attempts()
            ->with('student')
            ->orderBy('submitted_at', 'desc')
            ->paginate(20);

        return view('elearning::quizzes.attempts', [
            'title' => 'Daftar Attempt',
            'course' => $course,
            'quiz' => $quiz,
            'attempts' => $attempts,
        ]);
    }
}

