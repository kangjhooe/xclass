<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\AdditionalDuty;
use App\Models\Tenant\ModuleAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdditionalDutyController extends BaseTenantController
{
    /**
     * Display a listing of additional duties
     */
    public function index()
    {
        $tenant = $this->getCurrentTenant();
        
        $duties = AdditionalDuty::where('instansi_id', $tenant->id)
            ->with('activeModuleAccesses')
            ->ordered()
            ->get();

        return view('tenant.additional-duties.index', compact('duties'));
    }

    /**
     * Show the form for creating a new additional duty
     */
    public function create()
    {
        return view('tenant.additional-duties.create');
    }

    /**
     * Store a newly created additional duty
     */
    public function store(Request $request)
    {
        $this->authorize('create', AdditionalDuty::class);

        $tenant = $this->getCurrentTenant();
        
        $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-z][a-z0-9_]*$/',
                \Illuminate\Validation\Rule::unique('additional_duties', 'code')->where(function ($query) use ($tenant) {
                    return $query->where('instansi_id', $tenant->id);
                }),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
        ]);

        try {
            $data = $this->prepareTenantData([
                'code' => $request->code,
                'name' => $request->name,
                'description' => $request->description,
                'order' => $request->order ?? 0,
                'is_active' => true,
            ]);

            $duty = AdditionalDuty::create($data);

            return redirect()->route('tenant.additional-duties.edit', ['tenant' => $tenant->npsn, 'additionalDuty' => $duty->id])
                ->with('success', 'Tugas tambahan berhasil dibuat. Silakan atur akses modul.');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan tugas tambahan');
        }
    }

    /**
     * Display the specified additional duty
     */
    public function show($additionalDuty)
    {
        $additionalDutyModel = $this->resolveModel(AdditionalDuty::class, $additionalDuty, [
            'activeModuleAccesses',
            'activeTeachers'
        ]);
        
        $this->authorize('view', $additionalDutyModel);
        
        return view('tenant.additional-duties.show', ['additionalDuty' => $additionalDutyModel]);
    }

    /**
     * Show the form for editing the specified additional duty
     */
    public function edit($additionalDuty)
    {
        $additionalDutyModel = $this->resolveModel(AdditionalDuty::class, $additionalDuty);
        
        $this->authorize('update', $additionalDutyModel);
        
        $moduleAccesses = $additionalDutyModel->activeModuleAccesses()->get()->keyBy('module_code');
        
        return view('tenant.additional-duties.edit', [
            'additionalDuty' => $additionalDutyModel,
            'moduleAccesses' => $moduleAccesses
        ]);
    }

    /**
     * Update the specified additional duty
     */
    public function update(Request $request, $additionalDuty)
    {
        $additionalDutyModel = $this->resolveModel(AdditionalDuty::class, $additionalDuty);
        $tenant = $this->getCurrentTenant();
        
        $this->authorize('update', $additionalDutyModel);
        
        $request->validate([
            'code' => 'required|string|max:50|unique:additional_duties,code,' . $additionalDutyModel->id . ',id,instansi_id,' . $tenant->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'modules' => 'nullable|array',
            'modules.*.code' => 'required|string',
            'modules.*.name' => 'required|string',
            'modules.*.permissions' => 'nullable|array',
        ]);

        try {
            return $this->transaction(function () use ($request, $additionalDutyModel, $tenant) {
                // Only update allowed fields
                $allowedFields = ['code', 'name', 'description', 'order', 'is_active'];
                $additionalDutyModel->update($this->getAllowedFields($request, $allowedFields));

                // Update module accesses
                if ($request->has('modules')) {
                    $moduleCodes = [];
                    
                    foreach ($request->modules as $module) {
                        $moduleCodes[] = $module['code'];
                        
                        ModuleAccess::updateOrCreate(
                            [
                                'instansi_id' => $tenant->id,
                                'additional_duty_id' => $additionalDutyModel->id,
                                'module_code' => $module['code'],
                            ],
                            [
                                'module_name' => $module['name'],
                                'permissions' => $module['permissions'] ?? ['*'],
                                'is_active' => true,
                            ]
                        );
                    }
                    
                    // Deactivate modules that are not in the list
                    ModuleAccess::where('additional_duty_id', $additionalDutyModel->id)
                        ->whereNotIn('module_code', $moduleCodes)
                        ->update(['is_active' => false]);
                }

                return redirect()->route('tenant.additional-duties.index', ['tenant' => $tenant->npsn])
                    ->with('success', 'Tugas tambahan berhasil diperbarui');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui tugas tambahan');
        }
    }

    /**
     * Remove the specified additional duty
     */
    public function destroy($additionalDuty)
    {
        $additionalDutyModel = $this->resolveModel(AdditionalDuty::class, $additionalDuty);
        $tenant = $this->getCurrentTenant();
        
        $this->authorize('delete', $additionalDutyModel);

        try {
            // Check if duty is assigned to any teacher
            if ($additionalDutyModel->activeTeachers()->count() > 0) {
                return redirect()->back()
                    ->with('error', 'Tidak dapat menghapus tugas tambahan yang masih ditugaskan ke guru. Silakan nonaktifkan terlebih dahulu.');
            }

            $additionalDutyModel->delete();

            return redirect()->route('tenant.additional-duties.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Tugas tambahan berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus tugas tambahan');
        }
    }
}
