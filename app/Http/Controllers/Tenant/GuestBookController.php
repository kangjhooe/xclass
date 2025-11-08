<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\GuestBook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class GuestBookController extends Controller
{
    public function index(Request $request)
    {
        $query = GuestBook::query();

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        // Filter berdasarkan tanggal
        if ($request->filled('date_from')) {
            $query->byDateRange($request->date_from, $request->date_to);
        }

        // Pencarian
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Get statistics
        $stats = [
            'total' => GuestBook::count(),
            'checked_in' => GuestBook::where('status', 'checked_in')->count(),
            'checked_out' => GuestBook::where('status', 'checked_out')->count(),
            'today' => GuestBook::whereDate('visit_date', today())->count(),
        ];

        $guestBooks = $query->orderBy('visit_date', 'desc')
                           ->orderBy('visit_time', 'desc')
                           ->paginate(20);

        return view('tenant.guest-book.index', compact('guestBooks', 'stats'));
    }

    public function create()
    {
        // Jika user tidak login, gunakan view publik
        if (!Auth::check()) {
            $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
            if ($tenant) {
                // Gunakan view publik untuk user yang tidak login
                return view('public.guest-book.create', compact('tenant'));
            }
        }
        return view('tenant.guest-book.create');
    }

    public function store(Request $request)
    {
        // Jika user tidak login, gunakan controller publik
        if (!Auth::check()) {
            $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
            if ($tenant) {
                // Redirect ke controller publik untuk handling
                $publicController = app(\App\Http\Controllers\PublicPage\GuestBookController::class);
                return $publicController->store($request);
            }
        }
        
        $validated = $request->validate([
            'visitor_name' => 'required|string|max:255',
            'visitor_phone' => 'nullable|string|max:20',
            'visitor_email' => 'nullable|email|max:255',
            'visitor_organization' => 'nullable|string|max:255',
            'visitor_address' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'purpose' => 'required|in:meeting,consultation,inspection,other',
            'purpose_description' => 'nullable|string',
            'person_to_meet' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:100',
            'visit_date' => 'required|date',
            'visit_time' => 'required',
            'notes' => 'nullable|string',
        ]);

        $user = auth()->user();
        if (!$user || !$user->instansi_id) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke instansi.');
        }
        $validated['instansi_id'] = $user->instansi_id;
        $validated['check_in_time'] = now();
        $validated['created_by'] = Auth::id();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $filename = 'guest_book_' . time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
            $path = $photo->storeAs('guest_books/photos', $filename, 'public');
            $validated['photo_path'] = $path;
        }

        // Remove photo from validated array if not uploaded
        unset($validated['photo']);

        GuestBook::create($validated);

        return redirect()->to(tenant_route('tenant.guest-book.index'))
                        ->with('success', 'Data buku tamu berhasil ditambahkan.');
    }

    public function show(GuestBook $guestBook)
    {
        return view('tenant.guest-book.show', compact('guestBook'));
    }

    public function edit(GuestBook $guestBook)
    {
        return view('tenant.guest-book.edit', compact('guestBook'));
    }

    public function update(Request $request, GuestBook $guestBook)
    {
        $validated = $request->validate([
            'visitor_name' => 'required|string|max:255',
            'visitor_phone' => 'nullable|string|max:20',
            'visitor_email' => 'nullable|email|max:255',
            'visitor_organization' => 'nullable|string|max:255',
            'visitor_address' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'purpose' => 'required|in:meeting,consultation,inspection,other',
            'purpose_description' => 'nullable|string',
            'person_to_meet' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:100',
            'visit_date' => 'required|date',
            'visit_time' => 'required',
            'status' => 'required|in:checked_in,checked_out,cancelled',
            'notes' => 'nullable|string',
        ]);

        $validated['updated_by'] = Auth::id();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($guestBook->photo_path) {
                Storage::disk('public')->delete($guestBook->photo_path);
            }
            
            $photo = $request->file('photo');
            $filename = 'guest_book_' . time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
            $path = $photo->storeAs('guest_books/photos', $filename, 'public');
            $validated['photo_path'] = $path;
        }

        // Remove photo from validated array if not uploaded
        unset($validated['photo']);

        $guestBook->update($validated);

        return redirect()->to(tenant_route('tenant.guest-book.index'))
                        ->with('success', 'Data buku tamu berhasil diperbarui.');
    }

    public function checkOut(GuestBook $guestBook)
    {
        $guestBook->update([
            'status' => GuestBook::STATUS_CHECKED_OUT,
            'check_out_time' => now(),
            'updated_by' => Auth::id()
        ]);

        return redirect()->back()
                        ->with('success', 'Tamu berhasil check out.');
    }

    public function destroy(GuestBook $guestBook)
    {
        $guestBook->delete();

        return redirect()->to(tenant_route('tenant.guest-book.index'))
                        ->with('success', 'Data buku tamu berhasil dihapus.');
    }

    public function dashboard()
    {
        $today = now()->format('Y-m-d');
        $thisMonth = now()->format('Y-m');
        
        $stats = [
            'today_visitors' => GuestBook::whereDate('visit_date', $today)->count(),
            'month_visitors' => GuestBook::whereYear('visit_date', now()->year)
                                        ->whereMonth('visit_date', now()->month)
                                        ->count(),
            'checked_in' => GuestBook::byStatus(GuestBook::STATUS_CHECKED_IN)->count(),
            'total_visitors' => GuestBook::count(),
        ];

        $recentVisitors = GuestBook::orderBy('visit_date', 'desc')
                                 ->orderBy('visit_time', 'desc')
                                 ->limit(10)
                                 ->get();

        return view('tenant.guest-book.dashboard', compact('stats', 'recentVisitors'));
    }
}
