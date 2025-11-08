<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CourseResourceController extends Controller
{
    public function index(Course $course)
    {
        $resources = $course->resources()->orderBy('created_at', 'desc')->get();
        
        return view('elearning::resources.index', [
            'title' => 'Resource Library',
            'course' => $course,
            'resources' => $resources,
        ]);
    }

    public function create(Course $course)
    {
        return view('elearning::resources.create', [
            'title' => 'Tambah Resource',
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:ebook,video,link,template,other',
            'file' => 'nullable|file|max:10240',
            'external_url' => 'nullable|url',
            'category' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $resourceData = [
                'course_id' => $course->id,
                'instansi_id' => $course->instansi_id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'type' => $validated['type'],
                'category' => $validated['category'],
                'is_public' => false,
            ];

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $resourceData['file_path'] = $file->store('courses/resources', 'public');
                $resourceData['file_name'] = $file->getClientOriginalName();
            }

            if ($validated['type'] === 'link' && $validated['external_url']) {
                $resourceData['external_url'] = $validated['external_url'];
            }

            CourseResource::create($resourceData);

            DB::commit();

            return redirect()->route('tenant.elearning.resources.index', $course)
                ->with('success', 'Resource berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Course $course, CourseResource $resource)
    {
        return view('elearning::resources.show', [
            'title' => $resource->title,
            'course' => $course,
            'resource' => $resource,
        ]);
    }

    public function destroy(Course $course, CourseResource $resource)
    {
        try {
            if ($resource->file_path) {
                Storage::disk('public')->delete($resource->file_path);
            }
            $resource->delete();
            return redirect()->route('tenant.elearning.resources.index', $course)
                ->with('success', 'Resource berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function download(Course $course, CourseResource $resource)
    {
        if (!$resource->file_path) {
            return redirect()->back()->with('error', 'File tidak tersedia');
        }

        $resource->incrementDownloads();

        return Storage::disk('public')->download($resource->file_path, $resource->file_name);
    }
}

