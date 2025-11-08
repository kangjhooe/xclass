<?php

namespace App\Http\Controllers\PublicPage\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\Gallery;
use App\Core\Services\TenantService;

class GalleryController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $galleries = Gallery::where('instansi_id', $tenant->id)->orderBy('order')->paginate(12);
        return view('publicpage::admin.gallery.index', compact('galleries'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('publicpage::admin.gallery.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file_type' => 'required|in:image,video',
            'file' => 'required_if:file_type,image|nullable|file|max:10240', // Max 10MB
            'video_url' => 'required_if:file_type,video|nullable|url',
            'alt_text' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|string',
        ]);

        $filePath = null;
        $thumbnailPath = null;

        if ($request->file_type === 'image' && $request->hasFile('file')) {
            $filePath = $request->file('file')->store('public/gallery_images');
            $filePath = str_replace('public/', 'storage/', $filePath);
        } elseif ($request->file_type === 'video' && $request->filled('video_url')) {
            $filePath = $request->video_url;
            // You might want to implement logic to get video thumbnail here
        }

        Gallery::create(array_merge($request->except(['file', 'video_url']), [
            'instansi_id' => $tenant->id,
            'file_path' => $filePath,
            'thumbnail_path' => $thumbnailPath,
            'tags' => $request->tags ? explode(',', $request->tags) : null,
        ]));

        return redirect()->route('tenant.public-page.gallery.index')->with('success', 'Gallery item created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Gallery $gallery)
    {
        // Ensure the gallery item belongs to the current tenant
        if ($gallery->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }
        return view('publicpage::admin.gallery.edit', compact('gallery'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Gallery $gallery)
    {
        // Ensure the gallery item belongs to the current tenant
        if ($gallery->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }

        $tenant = $this->tenantService->getCurrentTenant();
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file_type' => 'required|in:image,video',
            'file' => 'nullable|file|max:10240', // Max 10MB
            'video_url' => 'nullable|url',
            'alt_text' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|string',
        ]);

        $filePath = $gallery->file_path;
        $thumbnailPath = $gallery->thumbnail_path;

        if ($request->file_type === 'image') {
            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($gallery->file_path && $gallery->file_type === 'image') {
                    \Storage::delete(str_replace('storage/', 'public/', $gallery->file_path));
                }
                $filePath = $request->file('file')->store('public/gallery_images');
                $filePath = str_replace('public/', 'storage/', $filePath);
            }
        } elseif ($request->file_type === 'video') {
            $filePath = $request->video_url;
            // You might want to implement logic to get video thumbnail here
        }

        $gallery->update(array_merge($request->except(['file', 'video_url']), [
            'file_path' => $filePath,
            'thumbnail_path' => $thumbnailPath,
            'tags' => $request->tags ? explode(',', $request->tags) : null,
        ]));

        return redirect()->route('tenant.public-page.gallery.index')->with('success', 'Gallery item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Gallery $gallery)
    {
        // Ensure the gallery item belongs to the current tenant
        if ($gallery->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }
        // Delete file if it's an image
        if ($gallery->file_type === 'image' && $gallery->file_path) {
            \Storage::delete(str_replace('storage/', 'public/', $gallery->file_path));
        }
        $gallery->delete();
        return redirect()->route('tenant.public-page.gallery.index')->with('success', 'Gallery item deleted successfully.');
    }
}
