<?php

namespace Modules\ELearning\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ELearning\app\Models\Course;
use Modules\ELearning\app\Models\CourseMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CourseMaterialController extends Controller
{
    public function index(Course $course)
    {
        $materials = $course->materials()->orderBy('order')->get();
        
        return view('elearning::materials.index', [
            'title' => 'Materi Kursus',
            'course' => $course,
            'materials' => $materials,
        ]);
    }

    public function create(Course $course)
    {
        return view('elearning::materials.create', [
            'title' => 'Tambah Materi',
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type' => 'required|in:text,pdf,powerpoint,image,link,document',
            'file' => 'nullable|file|max:10240',
            'external_url' => 'nullable|url',
            'chapter' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'allow_download' => 'boolean',
            'is_published' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $materialData = [
                'course_id' => $course->id,
                'title' => $validated['title'],
                'content' => $validated['content'],
                'type' => $validated['type'],
                'chapter' => $validated['chapter'],
                'order' => $validated['order'] ?? 0,
                'allow_download' => $request->boolean('allow_download', true),
                'is_published' => $request->boolean('is_published', true),
                'publish_date' => now(),
            ];

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $materialData['file_path'] = $file->store('courses/materials', 'public');
                $materialData['file_name'] = $file->getClientOriginalName();
                $materialData['file_size'] = $file->getSize();
            }

            if ($validated['type'] === 'link' && $validated['external_url']) {
                $materialData['external_url'] = $validated['external_url'];
            }

            CourseMaterial::create($materialData);

            DB::commit();

            return redirect()->route('tenant.elearning.materials.index', $course)
                ->with('success', 'Materi berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Course $course, CourseMaterial $material)
    {
        return view('elearning::materials.show', [
            'title' => $material->title,
            'course' => $course,
            'material' => $material,
        ]);
    }

    public function edit(Course $course, CourseMaterial $material)
    {
        return view('elearning::materials.edit', [
            'title' => 'Edit Materi',
            'course' => $course,
            'material' => $material,
        ]);
    }

    public function update(Request $request, Course $course, CourseMaterial $material)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type' => 'required|in:text,pdf,powerpoint,image,link,document',
            'file' => 'nullable|file|max:10240',
            'external_url' => 'nullable|url',
            'chapter' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'allow_download' => 'boolean',
            'is_published' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $material->title = $validated['title'];
            $material->content = $validated['content'];
            $material->type = $validated['type'];
            $material->chapter = $validated['chapter'];
            $material->order = $validated['order'] ?? $material->order;
            $material->allow_download = $request->boolean('allow_download', $material->allow_download);
            $material->is_published = $request->boolean('is_published', $material->is_published);

            if ($request->hasFile('file')) {
                if ($material->file_path) {
                    Storage::disk('public')->delete($material->file_path);
                }
                $file = $request->file('file');
                $material->file_path = $file->store('courses/materials', 'public');
                $material->file_name = $file->getClientOriginalName();
                $material->file_size = $file->getSize();
            }

            if ($validated['type'] === 'link' && $validated['external_url']) {
                $material->external_url = $validated['external_url'];
            }

            $material->save();

            DB::commit();

            return redirect()->route('tenant.elearning.materials.index', $course)
                ->with('success', 'Materi berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course, CourseMaterial $material)
    {
        try {
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
            }
            $material->delete();
            return redirect()->route('tenant.elearning.materials.index', $course)
                ->with('success', 'Materi berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}

