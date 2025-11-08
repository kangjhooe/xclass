<?php

namespace App\Http\Controllers\PublicPage\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\Menu;
use App\Core\Services\TenantService;

class MenuController extends Controller
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
        $menus = Menu::where('instansi_id', $tenant->id)->orderBy('order')->paginate(10);
        return view('publicpage::admin.menus.index', compact('menus'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('publicpage::admin.menus.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:menus,slug,NULL,id,instansi_id,' . $tenant->id,
            'url' => 'required|string|max:255',
            'type' => 'required|in:page,link,dropdown',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
            'is_external' => 'boolean',
        ]);

        Menu::create(array_merge($request->all(), ['instansi_id' => $tenant->id]));

        return redirect()->route('tenant.public-page.menus.index')->with('success', 'Menu created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Menu $menu)
    {
        // Ensure the menu belongs to the current tenant
        if ($menu->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }
        return view('publicpage::admin.menus.edit', compact('menu'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Menu $menu)
    {
        // Ensure the menu belongs to the current tenant
        if ($menu->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }

        $tenant = $this->tenantService->getCurrentTenant();
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:menus,slug,' . $menu->id . ',id,instansi_id,' . $tenant->id,
            'url' => 'required|string|max:255',
            'type' => 'required|in:page,link,dropdown',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
            'is_external' => 'boolean',
        ]);

        $menu->update($request->all());

        return redirect()->route('tenant.public-page.menus.index')->with('success', 'Menu updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu)
    {
        // Ensure the menu belongs to the current tenant
        if ($menu->instansi_id !== $this->tenantService->getCurrentTenant()->id) {
            abort(403);
        }
        $menu->delete();
        return redirect()->route('tenant.public-page.menus.index')->with('success', 'Menu deleted successfully.');
    }
}
