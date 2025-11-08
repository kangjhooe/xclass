<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseForum;
use Modules\ELearning\app\Models\CourseForumPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CourseForumController extends Controller
{
    public function index(Course $course)
    {
        $forums = $course->forums()->withCount('allPosts')->get();
        
        return view('elearning::forums.index', [
            'title' => 'Forum Diskusi',
            'course' => $course,
            'forums' => $forums,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $maxOrder = $course->forums()->max('order') ?? 0;

            CourseForum::create([
                'course_id' => $course->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'order' => $maxOrder + 1,
            ]);

            DB::commit();

            return redirect()->route('tenant.elearning.forums.index', $course)
                ->with('success', 'Forum berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Course $course, CourseForum $forum)
    {
        $forum->load('posts.user', 'posts.student', 'posts.teacher');
        
        return view('elearning::forums.show', [
            'title' => $forum->title,
            'course' => $course,
            'forum' => $forum,
        ]);
    }

    public function edit(Course $course, CourseForum $forum)
    {
        return view('elearning::forums.edit', [
            'title' => 'Edit Forum',
            'course' => $course,
            'forum' => $forum,
        ]);
    }

    public function update(Request $request, Course $course, CourseForum $forum)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $forum->update($validated);

            return redirect()->route('tenant.elearning.forums.index', $course)
                ->with('success', 'Forum berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course, CourseForum $forum)
    {
        try {
            $forum->delete();
            return redirect()->route('tenant.elearning.forums.index', $course)
                ->with('success', 'Forum berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function storePost(Request $request, Course $course, CourseForum $forum)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $student = $user->student;
            $teacher = $user->teacher;

            $attachments = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $attachments[] = $file->store('courses/forums/attachments', 'public');
                }
            }

            $post = CourseForumPost::create([
                'forum_id' => $forum->id,
                'user_id' => $user->id,
                'student_id' => $student?->id,
                'teacher_id' => $teacher?->id,
                'title' => $validated['title'],
                'content' => $validated['content'],
                'attachments' => $attachments,
            ]);

            $forum->increment('replies_count');
            $forum->update(['last_reply_at' => now()]);

            DB::commit();

            return redirect()->route('tenant.elearning.forums.show', [$course, $forum])
                ->with('success', 'Post berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function reply(Request $request, Course $course, CourseForumPost $post)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $student = $user->student;
            $teacher = $user->teacher;

            $attachments = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $attachments[] = $file->store('courses/forums/attachments', 'public');
                }
            }

            $reply = CourseForumPost::create([
                'forum_id' => $post->forum_id,
                'parent_id' => $post->id,
                'user_id' => $user->id,
                'student_id' => $student?->id,
                'teacher_id' => $teacher?->id,
                'content' => $validated['content'],
                'attachments' => $attachments,
            ]);

            $post->updateRepliesCount();
            $post->forum->increment('replies_count');
            $post->forum->update(['last_reply_at' => now()]);

            DB::commit();

            return redirect()->route('tenant.elearning.forums.show', [$course, $post->forum])
                ->with('success', 'Balasan berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }
}

