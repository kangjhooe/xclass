<?php

namespace Modules\PublicPage\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\Menu;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Menu::where('instansi_id', tenant('id'));

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('url', 'like', '%' . $request->search . '%')
                  ->orWhere('icon', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status == '1');
        }

        // Parent filter
        if ($request->has('parent') && $request->parent !== '') {
            if ($request->parent == 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent);
            }
        }

        // Target filter
        if ($request->has('target') && $request->target) {
            $query->where('target', $request->target);
        }

        // View mode: tree or flat
        $viewMode = $request->get('view_mode', 'tree');
        
        if ($viewMode === 'tree') {
            $menus = $query->with('children')
                          ->root()
                          ->orderBy('order')
                          ->get();
        } else {
            // Flat view with pagination
            $sortBy = $request->get('sort_by', 'order');
            $sortOrder = $request->get('sort_order', 'asc');
            
            $allowedSorts = ['order', 'name', 'created_at'];
            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('order', 'asc');
            }

            $perPage = $request->get('per_page', 15);
            $menus = $query->with('parent')->paginate($perPage)->appends($request->query());
        }

        // Get statistics
        $stats = [
            'total' => Menu::where('instansi_id', tenant('id'))->count(),
            'active' => Menu::where('instansi_id', tenant('id'))->where('is_active', true)->count(),
            'inactive' => Menu::where('instansi_id', tenant('id'))->where('is_active', false)->count(),
            'root' => Menu::where('instansi_id', tenant('id'))->whereNull('parent_id')->count(),
            'children' => Menu::where('instansi_id', tenant('id'))->whereNotNull('parent_id')->count(),
        ];

        // Get root menus for filter
        $rootMenus = Menu::where('instansi_id', tenant('id'))
            ->root()
            ->orderBy('name')
            ->get();

        return view('publicpage::admin.menu.index', compact('menus', 'stats', 'rootMenus', 'viewMode'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentMenus = Menu::where('instansi_id', tenant('id'))
                          ->root()
                          ->orderBy('name')
                          ->get();

        return view('publicpage::admin.menu.create', compact('parentMenus'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'icon' => 'nullable|string|max:100',
            'parent_id' => 'nullable|exists:menus,id',
            'order' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'target' => 'nullable|in:_self,_blank',
        ]);

        $data = $request->all();
        $data['instansi_id'] = tenant('id');
        $data['is_active'] = $request->has('is_active');
        $data['target'] = $request->target ?? '_self';

        // Set order if not provided
        if (empty($data['order'])) {
            $maxOrder = Menu::where('instansi_id', tenant('id'))
                ->where('parent_id', $data['parent_id'] ?? null)
                ->max('order') ?? 0;
            $data['order'] = $maxOrder + 1;
        }

        Menu::create($data);

        return redirect()->route('tenant.admin.menu.index')
                        ->with('success', 'Menu berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $menu = Menu::where('instansi_id', tenant('id'))->findOrFail($id);
        $parentMenus = Menu::where('instansi_id', tenant('id'))
                          ->root()
                          ->where('id', '!=', $id)
                          ->orderBy('name')
                          ->get();

        return view('publicpage::admin.menu.edit', compact('menu', 'parentMenus'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::where('instansi_id', tenant('id'))->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'icon' => 'nullable|string|max:100',
            'parent_id' => 'nullable|exists:menus,id',
            'order' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'target' => 'nullable|in:_self,_blank',
        ]);

        $data = $request->all();
        $data['is_active'] = $request->has('is_active');
        $data['target'] = $request->target ?? '_self';

        // Prevent setting parent to itself or its children
        if ($data['parent_id'] == $id) {
            return redirect()->route('tenant.admin.menu.edit', $id)
                ->with('error', 'Menu tidak dapat menjadi parent dari dirinya sendiri.');
        }

        // Check if parent is a child of this menu (prevent circular reference)
        if ($data['parent_id']) {
            $parent = Menu::find($data['parent_id']);
            if ($parent && $parent->parent_id == $id) {
                return redirect()->route('tenant.admin.menu.edit', $id)
                    ->with('error', 'Menu tidak dapat menjadi parent dari menu yang merupakan child-nya.');
            }
        }

        $menu->update($data);

        return redirect()->route('tenant.admin.menu.index')
                        ->with('success', 'Menu berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $menu = Menu::where('instansi_id', tenant('id'))->findOrFail($id);

        // Check if menu has children
        if ($menu->children()->count() > 0) {
            return redirect()->route('tenant.admin.menu.index')
                            ->with('error', 'Tidak dapat menghapus menu yang memiliki submenu. Hapus submenu terlebih dahulu.');
        }

        $menu->delete();

        return redirect()->route('tenant.admin.menu.index')
                        ->with('success', 'Menu berhasil dihapus.');
    }

    /**
     * Update menu order (drag & drop)
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'menus' => 'required|array',
            'menus.*.id' => 'required|exists:menus,id',
            'menus.*.order' => 'required|integer|min:0',
            'menus.*.parent_id' => 'nullable|exists:menus,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->menus as $menuData) {
                Menu::where('id', $menuData['id'])
                    ->where('instansi_id', tenant('id'))
                    ->update([
                        'order' => $menuData['order'],
                        'parent_id' => $menuData['parent_id'] ?? null
                    ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Urutan menu berhasil diperbarui.'
        ]);
    }

    /**
     * Bulk actions on menus
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,activate,deactivate',
            'ids' => 'required|array',
            'ids.*' => 'exists:menus,id'
        ]);

        $menus = Menu::where('instansi_id', tenant('id'))
            ->whereIn('id', $request->ids)
            ->get();

        $action = $request->action;
        $count = 0;

        switch ($action) {
            case 'delete':
                foreach ($menus as $item) {
                    // Check if menu has children
                    if ($item->children()->count() > 0) {
                        continue; // Skip menus with children
                    }
                    $item->delete();
                    $count++;
                }
                $message = "{$count} menu berhasil dihapus.";
                if ($count < count($menus)) {
                    $message .= " Beberapa menu tidak dapat dihapus karena memiliki submenu.";
                }
                break;

            case 'activate':
                foreach ($menus as $item) {
                    $item->update(['is_active' => true]);
                    $count++;
                }
                $message = "{$count} menu berhasil diaktifkan.";
                break;

            case 'deactivate':
                foreach ($menus as $item) {
                    $item->update(['is_active' => false]);
                    $count++;
                }
                $message = "{$count} menu berhasil dinonaktifkan.";
                break;
        }

        return redirect()->route('tenant.admin.menu.index')
            ->with('success', $message);
    }

    /**
     * Quick toggle status (AJAX)
     */
    public function toggleStatus($id)
    {
        $menu = Menu::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $menu->update(['is_active' => !$menu->is_active]);

        return response()->json([
            'success' => true,
            'is_active' => $menu->is_active,
            'message' => 'Status menu berhasil diubah.'
        ]);
    }

    /**
     * Duplicate/Clone menu
     */
    public function duplicate($id)
    {
        $menu = Menu::where('instansi_id', tenant('id'))->findOrFail($id);
        
        $newMenu = $menu->replicate();
        $newMenu->name = $menu->name . ' (Copy)';
        $newMenu->order = (Menu::where('instansi_id', tenant('id'))
            ->where('parent_id', $menu->parent_id)
            ->max('order') ?? 0) + 1;
        $newMenu->is_active = false;
        $newMenu->save();

        return redirect()->route('tenant.admin.menu.edit', $newMenu->id)
            ->with('success', 'Menu berhasil diduplikasi. Silakan edit sesuai kebutuhan.');
    }

    /**
     * Export menus to CSV
     */
    public function export(Request $request)
    {
        $query = Menu::where('instansi_id', tenant('id'));

        // Apply same filters as index
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('url', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status == '1');
        }

        $menus = $query->with('parent')->get();

        $filename = 'menu-export-' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($menus) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Header
            fputcsv($file, ['ID', 'Nama', 'URL', 'Icon', 'Parent', 'Urutan', 'Status', 'Target', 'Dibuat']);

            // Data
            foreach ($menus as $item) {
                fputcsv($file, [
                    $item->id,
                    $item->name,
                    $item->url,
                    $item->icon ?? '-',
                    $item->parent ? $item->parent->name : 'Root',
                    $item->order,
                    $item->is_active ? 'Aktif' : 'Tidak Aktif',
                    $item->target ?? '_self',
                    $item->created_at->format('d-m-Y H:i')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistics()
    {
        $tenantId = tenant('id');
        
        $stats = [
            'total' => Menu::where('instansi_id', $tenantId)->count(),
            'active' => Menu::where('instansi_id', $tenantId)->where('is_active', true)->count(),
            'inactive' => Menu::where('instansi_id', $tenantId)->where('is_active', false)->count(),
            'root' => Menu::where('instansi_id', $tenantId)->whereNull('parent_id')->count(),
            'children' => Menu::where('instansi_id', $tenantId)->whereNotNull('parent_id')->count(),
            'this_month' => Menu::where('instansi_id', $tenantId)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return response()->json($stats);
    }
}
