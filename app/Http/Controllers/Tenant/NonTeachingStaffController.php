<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Staff;
use App\Http\Requests\Tenant\StoreStaffRequest;
use App\Http\Requests\Tenant\UpdateStaffRequest;
use Illuminate\Http\Request;

class NonTeachingStaffController extends BaseTenantController
{
    /**
     * Display a listing of non-teaching staff
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Staff::class);

        $tenant = $this->getCurrentTenant();
        
        $query = Staff::where('instansi_id', $tenant->id);

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_number', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan posisi
        if ($request->filled('position')) {
            $query->where('position', $request->get('position'));
        }

        // Filter berdasarkan departemen
        if ($request->filled('department')) {
            $query->where('department', $request->get('department'));
        }

        // Filter berdasarkan status kepegawaian
        if ($request->filled('employment_status')) {
            $query->where('employment_status', $request->get('employment_status'));
        }

        $staff = $query->paginate(20);

        return view('tenant.non-teaching-staff.index', compact('staff'));
    }

    /**
     * Show the form for creating a new non-teaching staff
     */
    public function create()
    {
        $this->authorize('create', Staff::class);

        return view('tenant.non-teaching-staff.create');
    }

    /**
     * Store a newly created non-teaching staff
     */
    public function store(StoreStaffRequest $request)
    {
        $this->authorize('create', Staff::class);

        $tenant = $this->getCurrentTenant();
        
        $validated = $request->validated();

        try {
            $data = $this->prepareTenantData($validated);
            $data['is_active'] = true;

            Staff::create($data);

            return redirect()->route('tenant.non-teaching-staff.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data staf berhasil ditambahkan');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan data staf');
        }
    }

    /**
     * Display the specified non-teaching staff
     */
    public function show(Staff $nonTeachingStaff)
    {
        $this->ensureTenantAccess($nonTeachingStaff);
        $this->authorize('view', $nonTeachingStaff);

        return view('tenant.non-teaching-staff.show', compact('nonTeachingStaff'));
    }

    /**
     * Show the form for editing the specified non-teaching staff
     */
    public function edit(Staff $nonTeachingStaff)
    {
        $this->ensureTenantAccess($nonTeachingStaff);
        $this->authorize('update', $nonTeachingStaff);

        return view('tenant.non-teaching-staff.edit', compact('nonTeachingStaff'));
    }

    /**
     * Update the specified non-teaching staff
     */
    public function update(UpdateStaffRequest $request, Staff $nonTeachingStaff)
    {
        $this->ensureTenantAccess($nonTeachingStaff);
        $this->authorize('update', $nonTeachingStaff);

        $tenant = $this->getCurrentTenant();

        $validated = $request->validated();

        try {
            $allowedFields = array_keys($validated);
            $nonTeachingStaff->update($this->getAllowedFields($request, $allowedFields));

            return redirect()->route('tenant.non-teaching-staff.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data staf berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui data staf');
        }
    }

    /**
     * Remove the specified non-teaching staff
     */
    public function destroy(Staff $nonTeachingStaff)
    {
        $this->ensureTenantAccess($nonTeachingStaff);
        $this->authorize('delete', $nonTeachingStaff);

        $tenant = $this->getCurrentTenant();

        try {
            $nonTeachingStaff->delete();

            return redirect()->route('tenant.non-teaching-staff.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data staf berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus data staf');
        }
    }
}
