<?php

namespace App\Http\Controllers\PublicPage\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\News;
use App\Core\Services\TenantService;
use Illuminate\Support\Str;

class NewsController extends Controller
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
        $news = News::where('instansi_id', $tenant->id)->orderBy('published_at', 'desc')->paginate(10);
        return view('publicpage::admin.news.index', compact('news'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('publicpage::admin.news.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'featured_image' => 'nullable|image|max:2048', // Max 2MB
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        $slug = Str::slug($request->title);
        $imagePath = null;

        if ($request->hasFile('featured_image')) {
            $imagePath = $request->file('featured_image')->store('public/news_images');
            $imagePath = str_replace('public/', 'storage/', $imagePath);
        }

        News::create(array_merge($request->all(), [
            'instansi_id' => $tenant->id,
            'slug' => $slug,
            'featured_image' => $imagePath,
            'author_id' => auth()->id(),
        ]));

        return redirect()->route('tenant.public-page.news.index')->with('success', 'News created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(News $news)
    {
        // Ensure the news belongs to the current tenant
        if ($news->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }
        return view('publicpage::admin.news.edit', compact('news'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, News $news)
    {
        // Ensure the news belongs to the current tenant
        if ($news->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }

        $tenant = $this->tenantService->getCurrentTenant();
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'featured_image' => 'nullable|image|max:2048', // Max 2MB
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        $slug = Str::slug($request->title);
        $imagePath = $news->featured_image;

        if ($request->hasFile('featured_image')) {
            // Delete old image if exists
            if ($news->featured_image) {
                \Storage::delete(str_replace('storage/', 'public/', $news->featured_image));
            }
            $imagePath = $request->file('featured_image')->store('public/news_images');
            $imagePath = str_replace('public/', 'storage/', $imagePath);
        }

        $news->update(array_merge($request->all(), [
            'slug' => $slug,
            'featured_image' => $imagePath,
        ]));

        return redirect()->route('tenant.public-page.news.index')->with('success', 'News updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(News $news)
    {
        // Ensure the news belongs to the current tenant
        if ($news->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }
        // Delete image if exists
        if ($news->featured_image) {
            \Storage::delete(str_replace('storage/', 'public/', $news->featured_image));
        }
        $news->delete();
        return redirect()->route('tenant.public-page.news.index')->with('success', 'News deleted successfully.');
    }
}
