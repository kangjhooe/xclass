<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Requests\Tenant\ClassRoomRequest;
use App\Models\Tenant\ClassRoom;
use Illuminate\Http\Request;

/**
 * Note: This controller appears to be a duplicate of ClassController.
 * Consider consolidating these controllers in the future.
 */
class ClassRoomController extends BaseTenantController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', ClassRoom::class);

        $tenant = $this->getCurrentTenant();
        
        $classes = ClassRoom::where('instansi_id', $tenant->id)
            ->with(['room', 'homeroomTeacher'])
            ->withCount(['students', 'teachers', 'schedules'])
            ->orderBy('name')
            ->paginate(20);

        return view('tenant.classes.index', compact('classes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', ClassRoom::class);

        return view('tenant.classes.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ClassRoomRequest $request)
    {
        $this->authorize('create', ClassRoom::class);

        $tenant = $this->getCurrentTenant();

        try {
            $data = $this->prepareTenantData($request->validated());
            $data['is_active'] = $request->boolean('is_active', true);

            ClassRoom::create($data);

            return redirect()->route('tenant.classes.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Kelas berhasil ditambahkan');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan kelas');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ClassRoom $class)
    {
        $this->ensureTenantAccess($class);
        $this->authorize('view', $class);

        $class->load(['students', 'teachers', 'schedules', 'subjects', 'room', 'homeroomTeacher']);
        
        return view('tenant.classes.show', compact('class'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClassRoom $class)
    {
        $this->ensureTenantAccess($class);
        $this->authorize('update', $class);

        return view('tenant.classes.edit', compact('class'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ClassRoomRequest $request, ClassRoom $class)
    {
        $this->ensureTenantAccess($class);
        $this->authorize('update', $class);

        $tenant = $this->getCurrentTenant();

        try {
            $validated = $request->validated();
            $allowedFields = array_keys($validated);
            $data = $this->getAllowedFields($request, $allowedFields);
            $data['is_active'] = $request->boolean('is_active', true);

            $class->update($data);

            return redirect()->route('tenant.classes.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Kelas berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui kelas');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassRoom $class)
    {
        $this->ensureTenantAccess($class);
        $this->authorize('delete', $class);

        $tenant = $this->getCurrentTenant();

        try {
            // Check for related records before deletion
            $issues = $this->checkRelationsBeforeDelete($class, [
                'students' => 'Kelas masih memiliki :count siswa.',
                'schedules' => 'Kelas masih memiliki :count jadwal.',
            ]);

            if (!empty($issues)) {
                return redirect()->back()
                    ->with('error', implode(' ', $issues) . ' Hapus atau pindahkan data terkait terlebih dahulu.');
            }

            $class->delete();

            return redirect()->route('tenant.classes.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Kelas berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus kelas');
        }
    }

    /**
     * Show students in this class
     */
    public function students(ClassRoom $class)
    {
        $this->ensureTenantAccess($class);
        $this->authorize('view', $class);

        $students = $class->students()
            ->orderBy('name')
            ->paginate(20);

        return view('tenant.classes.students', compact('class', 'students'));
    }

    /**
     * Show schedules for this class
     */
    public function schedules(ClassRoom $class)
    {
        $this->ensureTenantAccess($class);
        $this->authorize('view', $class);

        $schedules = $class->schedules()
            ->with(['teacher', 'subject'])
            ->orderBy('day')
            ->orderBy('start_time')
            ->paginate(20);

        return view('tenant.classes.schedules', compact('class', 'schedules'));
    }
}
