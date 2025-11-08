<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Core\Tenant;
use App\Helpers\AuditHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Display a listing of global users only (super_admin and school_admin)
     */
    public function index()
    {
        $users = User::with('tenant')
            ->whereIn('role', ['super_admin', 'school_admin'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.users.index', compact('users'));
    }

    /**
     * Show the form for creating a new global user
     */
    public function create()
    {
        $tenants = Tenant::where('is_active', true)->get();
        
        return view('admin.users.create', compact('tenants'));
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|in:super_admin,school_admin',
            'instansi_id' => 'nullable|exists:tenants,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'instansi_id' => $request->instansi_id,
            'is_active' => true,
        ]);

        // Log user creation
        AuditHelper::logUserCreated($user);

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dibuat');
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        $user->load('tenant');
        
        return view('admin.users.show', compact('user'));
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user)
    {
        $tenants = Tenant::where('is_active', true)->get();
        
        return view('admin.users.edit', compact('user', 'tenants'));
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => 'required|in:super_admin,school_admin',
            'instansi_id' => 'nullable|exists:tenants,id',
        ]);

        $data = $request->only(['name', 'email', 'phone', 'role', 'instansi_id']);
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Get changes before update
        $changes = array_intersect_key($data, $user->getOriginal());
        $user->update($data);
        
        // Log user update
        AuditHelper::logUserUpdated($user, $changes);

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil diperbarui');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dihapus');
    }

    /**
     * Activate user
     */
    public function activate(User $user)
    {
        $user->update(['is_active' => true]);
        
        // Log user activation
        AuditHelper::logUserStatusChanged($user, true);

        return redirect()->back()
            ->with('success', 'User berhasil diaktifkan');
    }

    /**
     * Deactivate user
     */
    public function deactivate(User $user)
    {
        $user->update(['is_active' => false]);
        
        // Log user deactivation
        AuditHelper::logUserStatusChanged($user, false);

        return redirect()->back()
            ->with('success', 'User berhasil dinonaktifkan');
    }
}
