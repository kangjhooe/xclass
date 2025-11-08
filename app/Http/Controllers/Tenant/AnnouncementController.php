<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $query = Announcement::where('instansi_id', $tenant->id)
            ->with(['author']);
        
        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        
        // Search by title or content
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        
        $announcements = $query->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return view('tenant.announcements.index', compact('announcements'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('tenant.announcements.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:draft,published,archived',
            'target_audience' => 'required|array',
            'target_audience.*' => 'in:all,teachers,students,parents',
            'publish_at' => 'nullable|date|after_or_equal:now',
        ]);
        
        $announcement = Announcement::create([
            'instansi_id' => $tenant->id,
            'author_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'priority' => $request->priority,
            'status' => $request->status,
            'target_audience' => $request->target_audience,
            'publish_at' => $request->publish_at ?? now(),
        ]);
        
        return redirect()->route('tenant.announcements.index')
            ->with('success', 'Pengumuman berhasil dibuat');
    }

    /**
     * Display the specified resource.
     */
    public function show(Announcement $announcement)
    {
        $announcement->load(['author']);
        
        return view('tenant.announcements.show', compact('announcement'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Announcement $announcement)
    {
        return view('tenant.announcements.edit', compact('announcement'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:draft,published,archived',
            'target_audience' => 'required|array',
            'target_audience.*' => 'in:all,teachers,students,parents',
            'publish_at' => 'nullable|date|after_or_equal:now',
        ]);
        
        $announcement->update([
            'title' => $request->title,
            'content' => $request->content,
            'priority' => $request->priority,
            'status' => $request->status,
            'target_audience' => $request->target_audience,
            'publish_at' => $request->publish_at ?? $announcement->publish_at,
        ]);
        
        return redirect()->route('tenant.announcements.index')
            ->with('success', 'Pengumuman berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        
        return redirect()->route('tenant.announcements.index')
            ->with('success', 'Pengumuman berhasil dihapus');
    }

    /**
     * Show public announcements
     */
    public function public()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $announcements = Announcement::where('instansi_id', $tenant->id)
            ->where('status', 'published')
            ->where('publish_at', '<=', now())
            ->with(['author'])
            ->orderBy('priority', 'desc')
            ->orderBy('publish_at', 'desc')
            ->paginate(10);
        
        return view('tenant.announcements.public', compact('announcements'));
    }
}
