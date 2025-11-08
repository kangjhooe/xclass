<?php

namespace App\Http\Controllers\Tenant;

use App\Models\User;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends BaseTenantController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Only admin can view all staff
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        $tenant = $this->getCurrentTenant();
        
        $query = User::where('instansi_id', $tenant->id)
            ->whereIn('role', ['school_admin', 'teacher', 'student', 'parent']);
        
        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        
        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }
        
        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $staff = $query->orderBy('name')
            ->paginate(20);
        
        return view('tenant.staff.index', compact('staff'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Only admin can create staff
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        return view('tenant.staff.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Only admin can create staff
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        $tenant = $this->getCurrentTenant();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:school_admin,teacher,student,parent',
            'is_active' => 'boolean',
        ]);

        try {
            $data = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'role' => $validated['role'],
                'instansi_id' => $tenant->id,
                'is_active' => $request->boolean('is_active', true),
            ];

            User::create($data);

            return redirect()->route('tenant.staff.index', ['tenant' => $tenant->npsn])
                ->with('success', 'User berhasil dibuat');
        } catch (\Exception $e) {
            return $this->handleException($e, 'membuat user');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $staff)
    {
        // Only admin can view staff
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        $tenant = $this->getCurrentTenant();
        
        // Ensure user belongs to current tenant
        if ($staff->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak.');
        }

        return view('tenant.staff.show', compact('staff'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $staff)
    {
        // Only admin can edit staff
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        $tenant = $this->getCurrentTenant();
        
        // Ensure user belongs to current tenant
        if ($staff->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak.');
        }

        return view('tenant.staff.edit', compact('staff'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $staff)
    {
        // Only admin can update staff
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        $tenant = $this->getCurrentTenant();
        
        // Ensure user belongs to current tenant
        if ($staff->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->id,
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:school_admin,teacher,student,parent',
            'is_active' => 'boolean',
        ]);

        try {
            $allowedFields = ['name', 'email', 'phone', 'role', 'is_active'];
            $data = $this->getAllowedFields($request, $allowedFields);
            
            // Update password if provided
            if ($request->filled('password')) {
                $data['password'] = Hash::make($validated['password']);
            }

            $staff->update($data);

            return redirect()->route('tenant.staff.index', ['tenant' => $tenant->npsn])
                ->with('success', 'User berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui user');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $staff)
    {
        // Only admin can delete staff
        if (!in_array(auth()->user()->role, ['super_admin', 'school_admin'])) {
            abort(403, 'Akses ditolak.');
        }

        $tenant = $this->getCurrentTenant();
        
        // Ensure user belongs to current tenant
        if ($staff->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak.');
        }

        // Prevent deleting yourself
        if ($staff->id === auth()->id()) {
            return redirect()->back()
                ->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        try {
            $staff->delete();

            return redirect()->route('tenant.staff.index', ['tenant' => $tenant->npsn])
                ->with('success', 'User berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus user');
        }
    }
}
