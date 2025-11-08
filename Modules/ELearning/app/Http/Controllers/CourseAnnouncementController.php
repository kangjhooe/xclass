<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CourseAnnouncementController extends Controller
{
    public function index(Course $course)
    {
        $announcements = $course->announcements()
            ->published()
            ->orderBy('is_important', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return view('elearning::announcements.index', [
            'title' => 'Pengumuman',
            'course' => $course,
            'announcements' => $announcements,
        ]);
    }

    public function create(Course $course)
    {
        return view('elearning::announcements.create', [
            'title' => 'Buat Pengumuman',
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_important' => 'boolean',
            'send_notification' => 'boolean',
            'publish_date' => 'nullable|date',
            'expires_at' => 'nullable|date|after:publish_date',
        ]);

        try {
            DB::beginTransaction();

            CourseAnnouncement::create([
                'course_id' => $course->id,
                'created_by' => Auth::id(),
                'title' => $validated['title'],
                'content' => $validated['content'],
                'is_important' => $request->boolean('is_important', false),
                'send_notification' => $request->boolean('send_notification', true),
                'publish_date' => $validated['publish_date'] ?? now(),
                'expires_at' => $validated['expires_at'],
            ]);

            DB::commit();

            return redirect()->route('tenant.elearning.announcements.index', $course)
                ->with('success', 'Pengumuman berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Course $course, CourseAnnouncement $announcement)
    {
        return view('elearning::announcements.show', [
            'title' => $announcement->title,
            'course' => $course,
            'announcement' => $announcement,
        ]);
    }

    public function edit(Course $course, CourseAnnouncement $announcement)
    {
        return view('elearning::announcements.edit', [
            'title' => 'Edit Pengumuman',
            'course' => $course,
            'announcement' => $announcement,
        ]);
    }

    public function update(Request $request, Course $course, CourseAnnouncement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_important' => 'boolean',
            'send_notification' => 'boolean',
            'publish_date' => 'nullable|date',
            'expires_at' => 'nullable|date|after:publish_date',
        ]);

        try {
            $announcement->update($validated);

            return redirect()->route('tenant.elearning.announcements.index', $course)
                ->with('success', 'Pengumuman berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course, CourseAnnouncement $announcement)
    {
        try {
            $announcement->delete();
            return redirect()->route('tenant.elearning.announcements.index', $course)
                ->with('success', 'Pengumuman berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}

