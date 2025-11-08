<?php

namespace App\Http\Controllers\PublicPage;

use App\Http\Controllers\Controller;
use App\Models\Tenant\GuestBook;
use App\Core\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuestBookController extends Controller
{
    /**
     * Show the guest book form for public
     */
    public function create()
    {
        $tenant = app(TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
        }
        
        return view('public.guest-book.create', compact('tenant'));
    }

    /**
     * Store guest book entry from public
     */
    public function store(Request $request)
    {
        $tenant = app(TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
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

        $validated['instansi_id'] = $tenant->id;
        $validated['check_in_time'] = now();
        $validated['status'] = GuestBook::STATUS_CHECKED_IN;

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

        return redirect()->back()
                        ->with('success', 'Terima kasih! Data buku tamu Anda berhasil dikirim.');
    }
}

