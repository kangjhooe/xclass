<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Subject;
use App\Http\Requests\Tenant\SubjectRequest;
use Illuminate\Http\Request;

class SubjectController extends BaseTenantController
{
    /**
     * Display a listing of subjects
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Subject::class);

        $tenant = $this->getCurrentTenant();
        
        $query = Subject::where('instansi_id', $tenant->id);

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan level
        if ($request->filled('level')) {
            $query->where('level', $request->get('level'));
        }

        $subjects = $query->paginate(20);

        return view('tenant.subjects.index', compact('subjects'));
    }

    /**
     * Show the form for creating a new subject
     */
    public function create()
    {
        $this->authorize('create', Subject::class);

        return view('tenant.subjects.create');
    }

    /**
     * Store a newly created subject
     */
    public function store(SubjectRequest $request)
    {
        $this->authorize('create', Subject::class);

        $validated = $request->validated();

        try {
            $data = $this->prepareTenantData($validated);
            $data['is_active'] = true;

            Subject::create($data);

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.subjects.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Mata pelajaran berhasil ditambahkan');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan mata pelajaran');
        }
    }

    /**
     * Display the specified subject
     */
    public function show($subject)
    {
        $subjectModel = $this->resolveModel(Subject::class, $subject, [
            'teachers',
            'schedules',
            'grades'
        ]);
        
        $this->authorize('view', $subjectModel);
        
        return view('tenant.subjects.show', ['subject' => $subjectModel]);
    }

    /**
     * Show the form for editing the specified subject
     */
    public function edit($subject)
    {
        $subjectModel = $this->resolveModel(Subject::class, $subject);
        $this->authorize('update', $subjectModel);
        
        return view('tenant.subjects.edit', ['subject' => $subjectModel]);
    }

    /**
     * Update the specified subject
     */
    public function update(SubjectRequest $request, $subject)
    {
        $subjectModel = $this->resolveModel(Subject::class, $subject);
        $this->authorize('update', $subjectModel);

        $validated = $request->validated();

        try {
            $allowedFields = array_keys($validated);
            $data = $this->getAllowedFields($request, $allowedFields);
            if ($request->has('is_active')) {
                $data['is_active'] = $request->boolean('is_active');
            }

            $subjectModel->update($data);

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.subjects.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Data mata pelajaran berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui mata pelajaran');
        }
    }

    /**
     * Remove the specified subject
     */
    public function destroy($subject)
    {
        $subjectModel = $this->resolveModel(Subject::class, $subject);
        $this->authorize('delete', $subjectModel);

        try {
            // Check for related records before deletion
            $issues = $this->checkRelationsBeforeDelete($subjectModel, [
                'schedules' => 'Mata pelajaran masih memiliki :count jadwal. Hapus jadwal terlebih dahulu.',
                'grades' => 'Mata pelajaran masih memiliki :count data nilai. Hapus data nilai terlebih dahulu.',
                'teachers' => 'Mata pelajaran masih memiliki :count guru pengajar.',
            ]);

            if (!empty($issues)) {
                return redirect()->back()
                    ->with('error', implode(' ', $issues));
            }

            $subjectModel->delete();

            $tenant = $this->getCurrentTenant();
            return redirect()->route('tenant.subjects.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Mata pelajaran berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus mata pelajaran');
        }
    }

    /**
     * Show teachers for this subject
     */
    public function teachers($subject)
    {
        $subjectModel = $this->resolveModel(Subject::class, $subject, ['teachers']);
        $this->authorize('view', $subjectModel);
        
        return view('tenant.subjects.teachers', ['subject' => $subjectModel]);
    }
}
