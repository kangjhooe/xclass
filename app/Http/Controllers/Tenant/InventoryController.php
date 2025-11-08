<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\InventoryItem;
use App\Models\Tenant\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stats = [
            'total_items' => InventoryItem::where('instansi_id', $instansiId)->count(),
            'low_stock_items' => InventoryItem::where('instansi_id', $instansiId)->whereColumn('quantity', '<=', 'min_quantity')->count(),
            'out_of_stock_items' => InventoryItem::where('instansi_id', $instansiId)->where('quantity', 0)->count(),
            'total_value' => InventoryItem::where('instansi_id', $instansiId)->sum(DB::raw('quantity * unit_price')),
        ];

        $recentMovements = InventoryMovement::with('item')
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.inventory.index', [
            'title' => 'Inventori',
            'page-title' => 'Sistem Inventori',
            'stats' => $stats,
            'recentMovements' => $recentMovements
        ]);
    }

    /**
     * Display items management
     */
    public function items()
    {
        $items = InventoryItem::where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.inventory.items', [
            'title' => 'Barang',
            'page-title' => 'Manajemen Barang',
            'items' => $items
        ]);
    }

    /**
     * Display movements management
     */
    public function movements()
    {
        $movements = InventoryMovement::with('item')
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.inventory.movements', [
            'title' => 'Pergerakan Barang',
            'page-title' => 'Pergerakan Barang',
            'movements' => $movements
        ]);
    }

    /**
     * Show the form for creating a new item.
     */
    public function createItem()
    {
        return view('tenant.inventory.create-item', [
            'title' => 'Tambah Barang',
            'page-title' => 'Tambah Data Barang'
        ]);
    }

    /**
     * Store a newly created item in storage.
     */
    public function storeItem(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:100',
            'unit' => 'required|string|max:50',
            'quantity' => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            $item = InventoryItem::create([
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'unit' => $request->unit,
                'quantity' => $request->quantity,
                'min_quantity' => $request->min_quantity,
                'unit_price' => $request->unit_price,
                'supplier' => $request->supplier,
                'location' => $request->location,
                'instansi_id' => $instansiId
            ]);

            // Create initial movement record
            InventoryMovement::create([
                'item_id' => $item->id,
                'type' => 'in',
                'quantity' => $request->quantity,
                'reason' => 'Initial Stock',
                'notes' => 'Stok awal barang',
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->route('tenant.inventory.items')->with('success', 'Barang berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show the form for editing the specified item.
     */
    public function editItem(string $id)
    {
        $item = InventoryItem::where('instansi_id', $instansiId)
            ->findOrFail($id);

        return view('tenant.inventory.edit-item', [
            'title' => 'Edit Barang',
            'page-title' => 'Edit Data Barang',
            'item' => $item
        ]);
    }

    /**
     * Update the specified item in storage.
     */
    public function updateItem(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:100',
            'unit' => 'required|string|max:50',
            'min_quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            $item = InventoryItem::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $item->update([
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'unit' => $request->unit,
                'min_quantity' => $request->min_quantity,
                'unit_price' => $request->unit_price,
                'supplier' => $request->supplier,
                'location' => $request->location
            ]);

            DB::commit();
            return redirect()->route('tenant.inventory.items')->with('success', 'Barang berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Remove the specified item from storage.
     */
    public function destroyItem(string $id)
    {
        try {
            DB::beginTransaction();

            $item = InventoryItem::where('instansi_id', $instansiId)
                ->findOrFail($id);

            // Delete related movements
            $item->movements()->delete();
            $item->delete();

            DB::commit();
            return redirect()->route('tenant.inventory.items')->with('success', 'Barang berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Add stock to item
     */
    public function addStock(Request $request, string $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $item = InventoryItem::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $item->increment('quantity', $request->quantity);

            InventoryMovement::create([
                'item_id' => $item->id,
                'type' => 'in',
                'quantity' => $request->quantity,
                'reason' => $request->reason,
                'notes' => $request->notes,
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Stok berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Reduce stock from item
     */
    public function reduceStock(Request $request, string $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $item = InventoryItem::where('instansi_id', $instansiId)
                ->findOrFail($id);

            if ($item->quantity < $request->quantity) {
                return redirect()->back()->with('error', 'Stok tidak mencukupi');
            }

            $item->decrement('quantity', $request->quantity);

            InventoryMovement::create([
                'item_id' => $item->id,
                'type' => 'out',
                'quantity' => $request->quantity,
                'reason' => $request->reason,
                'notes' => $request->notes,
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Stok berhasil dikurangi');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
