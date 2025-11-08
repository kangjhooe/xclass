<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Helpers\RbacHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

/**
 * User Management Controller
 * 
 * Manages users and their roles within tenant
 */
class UserManagementController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $this->authorize('manage', User::class);

        $query = User::query();

        // Search
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->get('role') !== '') {
            $query->where('role', $request->get('role'));
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== '') {
            $isActive = $request->get('status') === 'active';
            $query->where('is_active', $isActive);
        }

        $users = $query->paginate(15);

        return view('tenant.users.index', compact('users'));
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        $this->authorize('create', User::class);

        $roles = [
            'admin' => 'Administrator',
            'operator' => 'Operator',
            'kepala_sekolah' => 'Kepala Sekolah'
        ];

        return view('tenant.users.create', compact('roles'));
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,operator,kepala_sekolah',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'is_active' => 'boolean'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'permissions' => $request->permissions,
            'is_active' => $request->has('is_active')
        ]);

        return redirect()
            ->route('tenant.users.index')
            ->with('success', 'User berhasil dibuat');
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return view('tenant.users.show', compact('user'));
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user)
    {
        $this->authorize('update', $user);

        $roles = [
            'admin' => 'Administrator',
            'operator' => 'Operator',
            'kepala_sekolah' => 'Kepala Sekolah'
        ];

        $permissions = [
            'data_pokok:read' => 'Baca Data Pokok',
            'data_pokok:create' => 'Buat Data Pokok',
            'data_pokok:update' => 'Update Data Pokok',
            'data_pokok:delete' => 'Hapus Data Pokok',
            'data_pokok:export' => 'Export Data Pokok',
            'data_pokok:import' => 'Import Data Pokok',
            'data_pokok:mutasi' => 'Kelola Mutasi Siswa',
            'data_pokok:assignments' => 'Kelola Penugasan Lintas Tenant',
            'data_pokok:logs' => 'Lihat Log Aktivitas'
        ];

        return view('tenant.users.edit', compact('user', 'roles', 'permissions'));
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,operator,kepala_sekolah',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'is_active' => 'boolean'
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'permissions' => $request->permissions,
            'is_active' => $request->has('is_active')
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()
            ->route('tenant.users.index')
            ->with('success', 'User berhasil diperbarui');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        // Prevent deleting own account
        if ($user->id === auth()->id()) {
            return redirect()
                ->route('tenant.users.index')
                ->with('error', 'Tidak dapat menghapus akun sendiri');
        }

        $user->delete();

        return redirect()
            ->route('tenant.users.index')
            ->with('success', 'User berhasil dihapus');
    }

    /**
     * Toggle user active status
     */
    public function toggleStatus(User $user)
    {
        $this->authorize('update', $user);

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()
            ->route('tenant.users.index')
            ->with('success', "User berhasil {$status}");
    }

    /**
     * Get user permissions
     */
    public function getPermissions(User $user)
    {
        $this->authorize('view', $user);

        $permissions = RbacHelper::getAllPermissions($user);

        return response()->json([
            'permissions' => $permissions,
            'role' => $user->role,
            'display_name' => RbacHelper::getRoleDisplayName($user->role)
        ]);
    }
}