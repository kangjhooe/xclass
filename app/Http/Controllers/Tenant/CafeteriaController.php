<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\CafeteriaMenu;
use App\Models\Tenant\CafeteriaOrder;
use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CafeteriaController extends Controller
{
    use HasInstansiId;

    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get cafeteria statistics
        $stats = [
            'total_menu_items' => CafeteriaMenu::where('instansi_id', $instansiId)->count(),
            'available_items' => CafeteriaMenu::where('instansi_id', $instansiId)
                ->where('is_available', true)
                ->count(),
            'total_orders' => CafeteriaOrder::where('instansi_id', $instansiId)->count(),
            'today_orders' => CafeteriaOrder::where('instansi_id', $instansiId)
                ->whereDate('created_at', today())
                ->count()
        ];

        // Get recent orders
        $recentOrders = CafeteriaOrder::where('instansi_id', $instansiId)
            ->with(['student', 'menuItems'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get popular menu items
        $popularItems = CafeteriaMenu::where('instansi_id', $instansiId)
            ->withCount('orders')
            ->orderBy('orders_count', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.cafeteria.index', [
            'title' => 'Kafetaria',
            'page-title' => 'Sistem Kafetaria',
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'popularItems' => $popularItems
        ]);
    }

    public function menu(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = CafeteriaMenu::where('instansi_id', $instansiId);

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by availability
        if ($request->filled('is_available')) {
            $query->where('is_available', $request->is_available);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $menuItems = $query->orderBy('name')->paginate(20);

        return view('tenant.cafeteria.menu', [
            'title' => 'Menu Kafetaria',
            'page-title' => 'Menu Kafetaria',
            'menuItems' => $menuItems
        ]);
    }

    public function orders(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = CafeteriaOrder::where('instansi_id', $instansiId)
            ->with(['student', 'menuItems']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('tenant.cafeteria.orders', [
            'title' => 'Pesanan',
            'page-title' => 'Data Pesanan Kafetaria',
            'orders' => $orders
        ]);
    }

    /**
     * Show the form for creating a new menu item.
     */
    public function createMenuItem()
    {
        return view('tenant.cafeteria.menu.create', [
            'title' => 'Tambah Menu',
            'page-title' => 'Tambah Menu Kafetaria'
        ]);
    }

    /**
     * Store a newly created menu item in storage.
     */
    public function storeMenuItem(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:food,drink,snack',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'is_available' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $menuItem = CafeteriaMenu::create([
                'instansi_id' => $instansiId,
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'price' => $request->price,
                'stock' => $request->stock,
                'is_available' => $request->boolean('is_available')
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('images/cafeteria'), $imageName);
                $menuItem->update(['image' => 'images/cafeteria/' . $imageName]);
            }

            DB::commit();

            return redirect()->route('tenant.cafeteria.menu')
                ->with('success', 'Menu berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified menu item.
     */
    public function editMenuItem(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $menuItem = CafeteriaMenu::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.cafeteria.menu.edit', [
            'title' => 'Edit Menu',
            'page-title' => 'Edit Menu Kafetaria',
            'menuItem' => $menuItem
        ]);
    }

    /**
     * Update the specified menu item in storage.
     */
    public function updateMenuItem(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:food,drink,snack',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'is_available' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $menuItem = CafeteriaMenu::where('instansi_id', $instansiId)->findOrFail($id);
            
            $menuItem->update([
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'price' => $request->price,
                'stock' => $request->stock,
                'is_available' => $request->boolean('is_available')
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($menuItem->image && file_exists(public_path($menuItem->image))) {
                    unlink(public_path($menuItem->image));
                }
                
                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('images/cafeteria'), $imageName);
                $menuItem->update(['image' => 'images/cafeteria/' . $imageName]);
            }

            DB::commit();

            return redirect()->route('tenant.cafeteria.menu')
                ->with('success', 'Menu berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified menu item.
     */
    public function showMenuItem(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $menuItem = CafeteriaMenu::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.cafeteria.menu.show', [
            'title' => 'Detail Menu',
            'page-title' => 'Detail Menu Kafetaria',
            'menuItem' => $menuItem
        ]);
    }

    /**
     * Remove the specified menu item from storage.
     */
    public function destroyMenuItem(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $menuItem = CafeteriaMenu::where('instansi_id', $instansiId)->findOrFail($id);
            
            // Delete image if exists
            if ($menuItem->image && file_exists(public_path($menuItem->image))) {
                unlink(public_path($menuItem->image));
            }
            
            $menuItem->delete();

            return redirect()->route('tenant.cafeteria.menu')
                ->with('success', 'Menu berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new order.
     */
    public function createOrder()
    {
        $instansiId = $this->getInstansiId();
        
        $students = Student::where('instansi_id', $instansiId)->get();
        $menuItems = CafeteriaMenu::where('instansi_id', $instansiId)
            ->where('is_available', true)
            ->get();

        return view('tenant.cafeteria.orders.create', [
            'title' => 'Tambah Pesanan',
            'page-title' => 'Tambah Pesanan Kafetaria',
            'students' => $students,
            'menuItems' => $menuItems
        ]);
    }

    /**
     * Store a newly created order in storage.
     */
    public function storeOrder(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'menu_items' => 'required|array|min:1',
            'menu_items.*.id' => 'required|exists:cafeteria_menus,id',
            'menu_items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $order = CafeteriaOrder::create([
                'instansi_id' => $instansiId,
                'student_id' => $request->student_id,
                'status' => 'pending',
                'notes' => $request->notes
            ]);

            $totalAmount = 0;
            foreach ($request->menu_items as $item) {
                $menuItem = CafeteriaMenu::find($item['id']);
                $quantity = $item['quantity'];
                $subtotal = $menuItem->price * $quantity;
                
                $order->menuItems()->attach($menuItem->id, [
                    'quantity' => $quantity,
                    'price' => $menuItem->price,
                    'subtotal' => $subtotal
                ]);
                
                $totalAmount += $subtotal;
                
                // Update stock
                if ($menuItem->stock !== null) {
                    $menuItem->decrement('stock', $quantity);
                }
            }

            $order->update(['total_amount' => $totalAmount]);

            DB::commit();

            return redirect()->route('tenant.cafeteria.orders')
                ->with('success', 'Pesanan berhasil dibuat');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified order.
     */
    public function showOrder(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $order = CafeteriaOrder::where('instansi_id', $instansiId)
            ->with(['student', 'menuItems'])
            ->findOrFail($id);

        return view('tenant.cafeteria.orders.show', [
            'title' => 'Detail Pesanan',
            'page-title' => 'Detail Pesanan Kafetaria',
            'order' => $order
        ]);
    }

    /**
     * Update the specified order status.
     */
    public function updateOrderStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled'
        ]);

        try {
            $instansiId = $this->getInstansiId();
            
            $order = CafeteriaOrder::where('instansi_id', $instansiId)->findOrFail($id);
            $order->update(['status' => $request->status]);

            return redirect()->back()
                ->with('success', 'Status pesanan berhasil diperbarui');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroyOrder(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $order = CafeteriaOrder::where('instansi_id', $instansiId)->findOrFail($id);
            
            // Restore stock
            foreach ($order->menuItems as $menuItem) {
                if ($menuItem->pivot->quantity && $menuItem->stock !== null) {
                    $menuItem->increment('stock', $menuItem->pivot->quantity);
                }
            }
            
            $order->delete();

            return redirect()->route('tenant.cafeteria.orders')
                ->with('success', 'Pesanan berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Process payment for order
     */
    public function processPayment(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,card,transfer,qris',
            'payment_amount' => 'required|numeric|min:0',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $order = CafeteriaOrder::where('instansi_id', $instansiId)
                ->findOrFail($id);

            // Check if payment amount matches order total
            if ($request->payment_amount < $order->total_amount) {
                return redirect()->back()
                    ->with('error', 'Jumlah pembayaran kurang dari total pesanan');
            }

            // Record payment
            DB::table('cafeteria_payments')->insert([
                'order_id' => $id,
                'payment_method' => $request->payment_method,
                'payment_amount' => $request->payment_amount,
                'payment_reference' => $request->payment_reference,
                'change_amount' => $request->payment_amount - $order->total_amount,
                'payment_status' => 'completed',
                'notes' => $request->notes,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Update order status
            $order->update([
                'payment_status' => 'paid',
                'status' => 'preparing'
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Pembayaran berhasil diproses');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Order history for student
     */
    public function studentOrderHistory($studentId)
    {
        $orders = CafeteriaOrder::where('instansi_id', $instansiId)
            ->where('student_id', $studentId)
            ->with(['menuItems'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $student = Student::findOrFail($studentId);

        return view('tenant.cafeteria.student-orders', [
            'title' => 'Riwayat Pesanan',
            'page-title' => 'Riwayat Pesanan Kafetaria',
            'orders' => $orders,
            'student' => $student
        ]);
    }

    /**
     * Daily sales report
     */
    public function dailySalesReport(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $instansiId = $this->getInstansiId();

        $orders = CafeteriaOrder::where('instansi_id', $instansiId)
            ->whereDate('created_at', $date)
            ->where('payment_status', 'paid')
            ->with(['student', 'menuItems'])
            ->get();

        $totalSales = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $totalItems = $orders->sum(function($order) {
            return $order->menuItems->sum('pivot.quantity');
        });

        // Sales by menu item
        $salesByItem = DB::table('cafeteria_order_menu')
            ->join('cafeteria_orders', 'cafeteria_order_menu.order_id', '=', 'cafeteria_orders.id')
            ->join('cafeteria_menus', 'cafeteria_order_menu.menu_id', '=', 'cafeteria_menus.id')
            ->where('cafeteria_orders.instansi_id', $instansiId)
            ->whereDate('cafeteria_orders.created_at', $date)
            ->where('cafeteria_orders.payment_status', 'paid')
            ->select(
                'cafeteria_menus.name',
                DB::raw('SUM(cafeteria_order_menu.quantity) as total_quantity'),
                DB::raw('SUM(cafeteria_order_menu.price * cafeteria_order_menu.quantity) as total_revenue')
            )
            ->groupBy('cafeteria_menus.id', 'cafeteria_menus.name')
            ->orderBy('total_revenue', 'desc')
            ->get();

        return view('tenant.cafeteria.daily-sales', [
            'title' => 'Laporan Penjualan Harian',
            'page-title' => 'Laporan Penjualan Harian',
            'orders' => $orders,
            'totalSales' => $totalSales,
            'totalOrders' => $totalOrders,
            'totalItems' => $totalItems,
            'salesByItem' => $salesByItem,
            'date' => $date
        ]);
    }
}
