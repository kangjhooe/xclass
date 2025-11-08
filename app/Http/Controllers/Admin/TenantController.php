<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTenantRequest;
use App\Models\Core\Tenant;
use App\Helpers\AuditHelper;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    /**
     * Display a listing of tenants - Metadata only
     */
    public function index()
    {
        $tenants = Tenant::withCount(['users' => function($query) {
                $query->whereIn('role', ['super_admin', 'school_admin']);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.tenants.index', compact('tenants'));
    }

    /**
     * Show the form for creating a new tenant
     */
    public function create()
    {
        return view('admin.tenants.create');
    }

    /**
     * Store a newly created tenant
     */
    public function store(StoreTenantRequest $request)
    {
        $tenant = Tenant::create($request->validated());

        // Log tenant creation
        AuditHelper::logTenantCreated($tenant);

        return redirect()->route('admin.tenants.index')
            ->with('success', 'Tenant berhasil dibuat');
    }

    /**
     * Display the specified tenant - Metadata only
     */
    public function show(Tenant $tenant)
    {
        // Load only global users and basic tenant info
        $tenant->load(['users' => function($query) {
            $query->whereIn('role', ['super_admin', 'school_admin']);
        }]);
        
        // Load counts for students and teachers
        $tenant->loadCount(['students', 'teachers']);
        
        return view('admin.tenants.show', compact('tenant'));
    }

    /**
     * Show the form for editing the specified tenant
     */
    public function edit(Tenant $tenant)
    {
        return view('admin.tenants.edit', compact('tenant'));
    }

    /**
     * Update the specified tenant
     */
    public function update(Request $request, Tenant $tenant)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:tenants,email,' . $tenant->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'website' => 'nullable|url',
            'custom_domain' => 'nullable|string|max:255|unique:tenants,custom_domain,' . $tenant->id,
            'subscription_plan' => 'required|in:basic,premium,enterprise',
            'subscription_expires_at' => 'nullable|date|after:now',
        ]);

        $originalData = $tenant->getOriginal();
        $tenant->update($request->all());
        
        // Get changed attributes
        $changes = $tenant->getChanges();
        
        // Log tenant update
        AuditHelper::logTenantUpdated($tenant, $changes);

        return redirect()->route('admin.tenants.index')
            ->with('success', 'Tenant berhasil diperbarui');
    }

    /**
     * Remove the specified tenant
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('admin.tenants.index')
            ->with('success', 'Tenant berhasil dihapus');
    }

    /**
     * Activate tenant
     */
    public function activate(Tenant $tenant)
    {
        $tenant->update(['is_active' => true]);
        
        // Log tenant activation
        AuditHelper::logTenantStatusChanged($tenant, true);

        return redirect()->back()
            ->with('success', 'Tenant berhasil diaktifkan');
    }

    /**
     * Deactivate tenant
     */
    public function deactivate(Tenant $tenant)
    {
        $tenant->update(['is_active' => false]);
        
        // Log tenant deactivation
        AuditHelper::logTenantStatusChanged($tenant, false);

        return redirect()->back()
            ->with('success', 'Tenant berhasil dinonaktifkan');
    }
}
