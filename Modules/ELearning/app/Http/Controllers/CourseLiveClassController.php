<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseLiveClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseLiveClassController extends Controller
{
    public function index(Course $course)
    {
        $liveClasses = $course->liveClasses()->orderBy('scheduled_at', 'desc')->get();
        
        return view('elearning::live-classes.index', [
            'title' => 'Kelas Virtual',
            'course' => $course,
            'liveClasses' => $liveClasses,
        ]);
    }

    public function create(Course $course)
    {
        return view('elearning::live-classes.create', [
            'title' => 'Buat Kelas Virtual',
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'platform' => 'required|in:zoom,google_meet,jitsi,microsoft_teams,other',
            'meeting_url' => 'nullable|url',
            'meeting_id' => 'nullable|string',
            'meeting_password' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'record_meeting' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            CourseLiveClass::create([
                'course_id' => $course->id,
                'instansi_id' => $course->instansi_id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'platform' => $validated['platform'],
                'meeting_url' => $validated['meeting_url'],
                'meeting_id' => $validated['meeting_id'],
                'meeting_password' => $validated['meeting_password'],
                'scheduled_at' => $validated['scheduled_at'],
                'duration_minutes' => $validated['duration_minutes'],
                'record_meeting' => $request->boolean('record_meeting', false),
                'status' => 'scheduled',
            ]);

            DB::commit();

            return redirect()->route('tenant.elearning.live-classes.index', $course)
                ->with('success', 'Kelas virtual berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Course $course, CourseLiveClass $liveClass)
    {
        return view('elearning::live-classes.show', [
            'title' => $liveClass->title,
            'course' => $course,
            'liveClass' => $liveClass,
        ]);
    }

    public function edit(Course $course, CourseLiveClass $liveClass)
    {
        return view('elearning::live-classes.edit', [
            'title' => 'Edit Kelas Virtual',
            'course' => $course,
            'liveClass' => $liveClass,
        ]);
    }

    public function update(Request $request, Course $course, CourseLiveClass $liveClass)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'platform' => 'required|in:zoom,google_meet,jitsi,microsoft_teams,other',
            'meeting_url' => 'nullable|url',
            'meeting_id' => 'nullable|string',
            'meeting_password' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'record_meeting' => 'boolean',
            'status' => 'required|in:scheduled,live,completed,cancelled',
        ]);

        try {
            $liveClass->update($validated);

            return redirect()->route('tenant.elearning.live-classes.index', $course)
                ->with('success', 'Kelas virtual berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course, CourseLiveClass $liveClass)
    {
        try {
            $liveClass->delete();
            return redirect()->route('tenant.elearning.live-classes.index', $course)
                ->with('success', 'Kelas virtual berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}

