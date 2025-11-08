<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseVideo;
use Modules\ELearning\app\Models\CourseProgress;
use Modules\ELearning\app\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CourseVideoController extends Controller
{
    public function index(Course $course)
    {
        $videos = $course->videos()->orderBy('order')->get();
        
        return view('elearning::videos.index', [
            'title' => 'Video Pembelajaran',
            'course' => $course,
            'videos' => $videos,
        ]);
    }

    public function create(Course $course)
    {
        return view('elearning::videos.create', [
            'title' => 'Tambah Video',
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'source' => 'required|in:youtube,vimeo,self_hosted,other',
            'video_url' => 'nullable|url',
            'video_id' => 'nullable|string',
            'file' => 'nullable|file|mimes:mp4,avi,mov,wmv|max:102400',
            'thumbnail' => 'nullable|image|max:2048',
            'duration_seconds' => 'nullable|integer|min:0',
            'chapter' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'allow_download' => 'boolean',
            'has_subtitle' => 'boolean',
            'subtitle_file' => 'nullable|file|mimes:vtt,srt|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $videoData = [
                'course_id' => $course->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'source' => $validated['source'],
                'chapter' => $validated['chapter'],
                'order' => $validated['order'] ?? 0,
                'allow_download' => $request->boolean('allow_download', false),
                'has_subtitle' => $request->boolean('has_subtitle', false),
                'duration_seconds' => $validated['duration_seconds'],
                'is_published' => true,
                'publish_date' => now(),
            ];

            if ($validated['source'] === 'youtube' || $validated['source'] === 'vimeo') {
                $videoData['video_url'] = $validated['video_url'];
                $videoData['video_id'] = $validated['video_id'];
            } elseif ($validated['source'] === 'self_hosted' && $request->hasFile('file')) {
                $file = $request->file('file');
                $videoData['file_path'] = $file->store('courses/videos', 'public');
            }

            if ($request->hasFile('thumbnail')) {
                $videoData['thumbnail'] = $request->file('thumbnail')->store('courses/videos/thumbnails', 'public');
            }

            if ($request->hasFile('subtitle_file')) {
                $videoData['subtitle_file'] = $request->file('subtitle_file')->store('courses/videos/subtitles', 'public');
            }

            CourseVideo::create($videoData);

            DB::commit();

            return redirect()->route('tenant.elearning.videos.index', $course)
                ->with('success', 'Video berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Course $course, CourseVideo $video)
    {
        $video->load('course');
        
        // Get student progress if logged in as student
        $progress = null;
        if (Auth::check() && Auth::user()->hasRole('student')) {
            $student = Auth::user()->student;
            if ($student) {
                $enrollment = CourseEnrollment::where('course_id', $course->id)
                    ->where('student_id', $student->id)
                    ->first();
                
                if ($enrollment) {
                    $progress = CourseProgress::where('enrollment_id', $enrollment->id)
                        ->where('progressable_type', CourseVideo::class)
                        ->where('progressable_id', $video->id)
                        ->first();
                }
            }
        }

        return view('elearning::videos.show', [
            'title' => $video->title,
            'course' => $course,
            'video' => $video,
            'progress' => $progress,
        ]);
    }

    public function edit(Course $course, CourseVideo $video)
    {
        return view('elearning::videos.edit', [
            'title' => 'Edit Video',
            'course' => $course,
            'video' => $video,
        ]);
    }

    public function update(Request $request, Course $course, CourseVideo $video)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'source' => 'required|in:youtube,vimeo,self_hosted,other',
            'video_url' => 'nullable|url',
            'video_id' => 'nullable|string',
            'file' => 'nullable|file|mimes:mp4,avi,mov,wmv|max:102400',
            'thumbnail' => 'nullable|image|max:2048',
            'duration_seconds' => 'nullable|integer|min:0',
            'chapter' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'allow_download' => 'boolean',
            'has_subtitle' => 'boolean',
            'subtitle_file' => 'nullable|file|mimes:vtt,srt|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $video->title = $validated['title'];
            $video->description = $validated['description'];
            $video->source = $validated['source'];
            $video->chapter = $validated['chapter'];
            $video->order = $validated['order'] ?? $video->order;
            $video->allow_download = $request->boolean('allow_download', $video->allow_download);
            $video->has_subtitle = $request->boolean('has_subtitle', $video->has_subtitle);
            $video->duration_seconds = $validated['duration_seconds'];

            if ($validated['source'] === 'youtube' || $validated['source'] === 'vimeo') {
                $video->video_url = $validated['video_url'];
                $video->video_id = $validated['video_id'];
            } elseif ($validated['source'] === 'self_hosted' && $request->hasFile('file')) {
                if ($video->file_path) {
                    Storage::disk('public')->delete($video->file_path);
                }
                $file = $request->file('file');
                $video->file_path = $file->store('courses/videos', 'public');
            }

            if ($request->hasFile('thumbnail')) {
                if ($video->thumbnail) {
                    Storage::disk('public')->delete($video->thumbnail);
                }
                $video->thumbnail = $request->file('thumbnail')->store('courses/videos/thumbnails', 'public');
            }

            if ($request->hasFile('subtitle_file')) {
                if ($video->subtitle_file) {
                    Storage::disk('public')->delete($video->subtitle_file);
                }
                $video->subtitle_file = $request->file('subtitle_file')->store('courses/videos/subtitles', 'public');
            }

            $video->save();

            DB::commit();

            return redirect()->route('tenant.elearning.videos.index', $course)
                ->with('success', 'Video berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course, CourseVideo $video)
    {
        try {
            if ($video->file_path) {
                Storage::disk('public')->delete($video->file_path);
            }
            if ($video->thumbnail) {
                Storage::disk('public')->delete($video->thumbnail);
            }
            if ($video->subtitle_file) {
                Storage::disk('public')->delete($video->subtitle_file);
            }
            $video->delete();
            return redirect()->route('tenant.elearning.videos.index', $course)
                ->with('success', 'Video berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function updateProgress(Request $request, Course $course, CourseVideo $video)
    {
        $request->validate([
            'progress_percentage' => 'required|numeric|min:0|max:100',
            'time_spent_seconds' => 'nullable|integer|min:0',
            'last_position' => 'nullable|integer|min:0',
        ]);

        try {
            $student = Auth::user()->student;
            if (!$student) {
                return response()->json(['error' => 'Anda bukan siswa'], 403);
            }

            $enrollment = CourseEnrollment::where('course_id', $course->id)
                ->where('student_id', $student->id)
                ->first();

            if (!$enrollment) {
                return response()->json(['error' => 'Anda belum terdaftar di kursus ini'], 403);
            }

            $progress = CourseProgress::updateOrCreate(
                [
                    'enrollment_id' => $enrollment->id,
                    'progressable_type' => CourseVideo::class,
                    'progressable_id' => $video->id,
                ],
                [
                    'course_id' => $course->id,
                    'student_id' => $student->id,
                    'progress_percentage' => $request->progress_percentage,
                    'time_spent_seconds' => $request->time_spent_seconds ?? 0,
                    'last_position' => $request->last_position,
                    'started_at' => now(),
                ]
            );

            if ($request->progress_percentage >= 100) {
                $progress->markAsCompleted();
            } else {
                $enrollment->updateProgress();
            }

            return response()->json(['success' => true, 'progress' => $progress]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

