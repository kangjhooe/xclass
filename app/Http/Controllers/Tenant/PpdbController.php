<?php

namespace App\Http\Controllers\Tenant;

use App\Models\PPDBApplication;
use App\Core\Services\PPDB\RegistrationService;
use App\Models\PPDBConfiguration;
use App\Helpers\TenantAccessHelper;
use App\Http\Requests\PPDBApplicationRequest;
use App\Http\Requests\PPDBConfigurationRequest;
use App\Http\Requests\PPDBStatusUpdateRequest;
use App\Core\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\User;
use App\Models\Tenant\Student;
use App\Exports\PPDBApplicationsExport;
use App\Core\Services\PPDB\SelectionService;

class PpdbController extends BaseTenantController
{
    public function __construct(TenantService $tenantService)
    {
        parent::__construct($tenantService);
        $this->middleware('tenant.access:module,ppdb');
    }

    public function index(Request $request)
    {
        $tenant = $this->getCurrentTenant();
        $query = PPDBApplication::where('instansi_id', $tenant->id);

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan tahun ajaran
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        // Filter berdasarkan gelombang
        if ($request->filled('batch')) {
            $query->where('batch', $request->batch);
        }

        // Filter berdasarkan jurusan
        if ($request->filled('major')) {
            $query->where('major_choice', $request->major);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('registration_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $applications = $query->orderBy('created_at', 'desc')->paginate(20);
        
        // Data untuk filter - scoped to current tenant
        $academicYears = PPDBApplication::where('instansi_id', $tenant->id)->distinct()->pluck('academic_year');
        $batches = PPDBApplication::where('instansi_id', $tenant->id)->distinct()->pluck('batch');
        $majors = PPDBApplication::where('instansi_id', $tenant->id)->distinct()->pluck('major_choice');

        return view('tenant.ppdb.index', compact('applications', 'academicYears', 'batches', 'majors'));
    }

    public function show(PPDBApplication $application)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure application belongs to current tenant
        if ($application->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Pendaftaran tidak ditemukan.');
        }
        
        return view('tenant.ppdb.show', compact('application'));
    }

    public function create()
    {
        $configurations = PPDBConfiguration::active()->get();
        return view('tenant.ppdb.create', compact('configurations'));
    }

    public function store(PPDBApplicationRequest $request)
    {
        $tenant = $this->getCurrentTenant();

        try {
            return $this->transaction(function () use ($request, $tenant) {
                // Generate nomor pendaftaran (service terpusat)
                $payload = \App\Core\Services\PPDB\RegistrationService::normalize($request->validated());
                $registrationNumber = RegistrationService::generateRegistrationNumber(
                    $payload['academic_year'],
                    $payload['batch']
                );

                // Prepare data with tenant info
                $data = $this->prepareTenantData($payload);
                $data['registration_number'] = $registrationNumber;
                $data['status'] = PPDBApplication::STATUS_PENDING;
                $data['registration_date'] = now();

                // Handle file uploads
                if ($request->hasFile('photo_path')) {
                    $data['photo_path'] = $request->file('photo_path')->store('ppdb/photos', 'public');
                }

                if ($request->hasFile('ijazah_path')) {
                    $data['ijazah_path'] = $request->file('ijazah_path')->store('ppdb/documents', 'public');
                }

                if ($request->hasFile('kk_path')) {
                    $data['kk_path'] = $request->file('kk_path')->store('ppdb/documents', 'public');
                }

                if ($request->hasFile('documents')) {
                    $documents = [];
                    foreach ($request->file('documents') as $file) {
                        $documents[] = $file->store('ppdb/documents', 'public');
                    }
                    $data['documents'] = $documents;
                }

                PPDBApplication::create($data);

                return redirect()->route('tenant.ppdb.index', ['tenant' => $tenant->npsn])
                    ->with('success', 'Pendaftaran PPDB berhasil dibuat dengan nomor: ' . $registrationNumber);
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan pendaftaran PPDB');
        }
    }

    public function edit(PPDBApplication $application)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure application belongs to current tenant
        if ($application->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Pendaftaran tidak ditemukan.');
        }
        
        $configurations = PPDBConfiguration::active()->get();
        return view('tenant.ppdb.edit', compact('application', 'configurations'));
    }

    public function update(PPDBApplicationRequest $request, PPDBApplication $application)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure application belongs to current tenant
        if ($application->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Pendaftaran tidak ditemukan.');
        }

        try {
            return $this->transaction(function () use ($request, $application, $tenant) {
                // Only update allowed fields from validated request
                $validated = $request->validated();

                // Handle file uploads
                if ($request->hasFile('photo_path')) {
                    // Delete old photo
                    if ($application->photo_path) {
                        Storage::disk('public')->delete($application->photo_path);
                    }
                    $validated['photo_path'] = $request->file('photo_path')->store('ppdb/photos', 'public');
                }

                if ($request->hasFile('ijazah_path')) {
                    if ($application->ijazah_path) {
                        Storage::disk('public')->delete($application->ijazah_path);
                    }
                    $validated['ijazah_path'] = $request->file('ijazah_path')->store('ppdb/documents', 'public');
                }

                if ($request->hasFile('kk_path')) {
                    if ($application->kk_path) {
                        Storage::disk('public')->delete($application->kk_path);
                    }
                    $validated['kk_path'] = $request->file('kk_path')->store('ppdb/documents', 'public');
                }

                if ($request->hasFile('documents')) {
                    // Delete old documents
                    if ($application->documents) {
                        foreach ($application->documents as $doc) {
                            Storage::disk('public')->delete($doc);
                        }
                    }
                    $documents = [];
                    foreach ($request->file('documents') as $file) {
                        $documents[] = $file->store('ppdb/documents', 'public');
                    }
                    $validated['documents'] = $documents;
                }

                // Only update allowed fields
                $allowedFields = array_keys($validated);
                $data = $this->getAllowedFields($request, $allowedFields);
                
                // Merge file paths if uploaded
                if (isset($validated['photo_path'])) {
                    $data['photo_path'] = $validated['photo_path'];
                }
                if (isset($validated['ijazah_path'])) {
                    $data['ijazah_path'] = $validated['ijazah_path'];
                }
                if (isset($validated['kk_path'])) {
                    $data['kk_path'] = $validated['kk_path'];
                }
                if (isset($validated['documents'])) {
                    $data['documents'] = $validated['documents'];
                }

                $application->update($data);

                return redirect()->route('tenant.ppdb.show', ['tenant' => $tenant->npsn, 'application' => $application->id])
                    ->with('success', 'Data pendaftaran berhasil diperbarui.');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui data pendaftaran');
        }
    }

    public function updateStatus(PPDBStatusUpdateRequest $request, PPDBApplication $application)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure application belongs to current tenant
        if ($application->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Pendaftaran tidak ditemukan.');
        }

        try {
            return $this->transaction(function () use ($request, $application, $tenant) {
                // Only update allowed fields
                $allowedFields = ['status', 'notes', 'selection_score', 'interview_score', 'document_score', 'rejected_reason'];
                $data = $this->getAllowedFields($request, $allowedFields);
                
                // Calculate total score
                if (!empty($data['selection_score']) && !empty($data['interview_score']) && !empty($data['document_score'])) {
                    $data['total_score'] = ($data['selection_score'] + $data['interview_score'] + $data['document_score']) / 3;
                }

                // Set dates based on status
                switch ($request->status) {
                    case PPDBApplication::STATUS_SELECTION:
                        $data['selection_date'] = now();
                        break;
                    case PPDBApplication::STATUS_ANNOUNCED:
                        $data['announcement_date'] = now();
                        break;
                    case PPDBApplication::STATUS_ACCEPTED:
                        $data['accepted_date'] = now();
                        break;
                }

                $previousStatus = $application->status;
                $application->update($data);

                // On accept: create/activate student and upgrade user role
                if ($request->status === PPDBApplication::STATUS_ACCEPTED && $previousStatus !== PPDBApplication::STATUS_ACCEPTED) {
                    $instansiId = $tenant->id;

                // Upgrade linked user role to student (if linked)
                if ($application->user_id) {
                    $user = User::find($application->user_id);
                    if ($user) {
                        $user->update(['role' => 'student', 'is_active' => true, 'instansi_id' => $instansiId]);
                    }
                }

                // Create student if not exists (match by email within tenant)
                $existingStudent = null;
                if (!empty($application->email)) {
                    $existingStudent = Student::where('email', $application->email)
                        ->where('instansi_id', $instansiId)
                        ->first();
                }

                if (!$existingStudent) {
                    Student::create([
                        'instansi_id' => $instansiId,
                        'name' => $application->full_name,
                        'email' => $application->email,
                        'phone' => $application->phone,
                        'address' => $application->address,
                        'birth_date' => $application->birth_date,
                        'birth_place' => $application->birth_place,
                        'gender' => $application->gender,
                        'previous_school' => $application->previous_school,
                        'parent_name' => $application->parent_name,
                        'parent_phone' => $application->parent_phone,
                        'is_active' => true,
                        'enrollment_date' => now()->toDateString(),
                        'student_status' => 'active',
                    ]);
                } else {
                    $existingStudent->update(['is_active' => true, 'student_status' => 'active']);
                }
            }

                    return redirect()->back()->with('success', 'Status pendaftaran berhasil diperbarui.');
                });
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui status pendaftaran');
        }
    }

    public function verifyDocuments(Request $request, PPDBApplication $application)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure application belongs to current tenant
        if ($application->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Pendaftaran tidak ditemukan.');
        }

        $validated = $request->validate([
            'photo_status' => 'nullable|in:valid,revisi',
            'ijazah_status' => 'nullable|in:valid,revisi',
            'kk_status' => 'nullable|in:valid,revisi',
            'documents_status' => 'nullable|array',
            'documents_status.*' => 'in:valid,revisi',
            'verification_notes' => 'nullable|string',
        ]);

        try {
            // Only update allowed fields
            $allowedFields = array_keys($validated);
            $data = $this->getAllowedFields($request, $allowedFields);
            $application->update($data);

            return redirect()->back()->with('success', 'Status verifikasi berkas diperbarui.');
        } catch (\Exception $e) {
            return $this->handleException($e, 'memverifikasi dokumen');
        }
    }

    public function dashboard()
    {
        $tenant = $this->getCurrentTenant();
        
        // Hitung statistik berdasarkan status untuk tenant saat ini
        $stats = [
            'total' => PPDBApplication::where('instansi_id', $tenant->id)->count(),
            'registered' => PPDBApplication::where('instansi_id', $tenant->id)
                ->where('status', PPDBApplication::STATUS_REGISTERED)->count(),
            'selection' => PPDBApplication::where('instansi_id', $tenant->id)
                ->where('status', PPDBApplication::STATUS_SELECTION)->count(),
            'announced' => PPDBApplication::where('instansi_id', $tenant->id)
                ->where('status', PPDBApplication::STATUS_ANNOUNCED)->count(),
            'accepted' => PPDBApplication::where('instansi_id', $tenant->id)
                ->where('status', PPDBApplication::STATUS_ACCEPTED)->count(),
            'rejected' => PPDBApplication::where('instansi_id', $tenant->id)
                ->where('status', PPDBApplication::STATUS_REJECTED)->count(),
        ];

        $recentApplications = PPDBApplication::where('instansi_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Statistics by major - format sebagai array asosiatif untuk chart
        $majorStatsData = PPDBApplication::where('instansi_id', $tenant->id)
            ->select('major_choice', DB::raw('count(*) as total'))
            ->groupBy('major_choice')
            ->get();
        
        $majorStats = [];
        foreach ($majorStatsData as $item) {
            $majorStats[$item->major_choice] = $item->total;
        }

        return view('tenant.ppdb.dashboard', compact(
            'stats',
            'recentApplications',
            'majorStats'
        ));
    }

    public function export(Request $request)
    {
        $tenant = $this->getCurrentTenant();
        $query = PPDBApplication::where('instansi_id', $tenant->id);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }
        if ($request->filled('batch')) {
            $query->where('batch', $request->batch);
        }
        if ($request->filled('major')) {
            $query->where('major_choice', $request->major);
        }

        $applications = $query->get();
        
        $filename = 'data-pendaftar-ppdb-' . now()->format('Y-m-d-H-i-s') . '.xlsx';
        
        return Excel::download(new PPDBApplicationsExport($applications), $filename);
    }

    public function destroy(PPDBApplication $application)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure application belongs to current tenant
        if ($application->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Pendaftaran tidak ditemukan.');
        }

        try {
            return $this->transaction(function () use ($application, $tenant) {
                // Hapus file yang terkait
                if ($application->photo_path) {
                    Storage::disk('public')->delete($application->photo_path);
                }
                if ($application->ijazah_path) {
                    Storage::disk('public')->delete($application->ijazah_path);
                }
                if ($application->kk_path) {
                    Storage::disk('public')->delete($application->kk_path);
                }
                if ($application->documents) {
                    foreach ($application->documents as $doc) {
                        Storage::disk('public')->delete($doc);
                    }
                }

                $application->delete();

                return redirect()->route('tenant.ppdb.index', ['tenant' => $tenant->npsn])
                    ->with('success', 'Data pendaftar berhasil dihapus.');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus data pendaftar');
        }
    }

    // Configuration methods
    public function configuration()
    {
        $tenant = $this->getCurrentTenant();
        $configurations = PPDBConfiguration::where('instansi_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return view('tenant.ppdb.configuration', compact('configurations'));
    }

    public function createConfiguration()
    {
        return view('tenant.ppdb.create-configuration');
    }

    public function storeConfiguration(PPDBConfigurationRequest $request)
    {
        $tenant = $this->getCurrentTenant();

        try {
            return $this->transaction(function () use ($request, $tenant) {
                // Prepare data with tenant info
                $data = $this->prepareTenantData($request->validated());
                $data['is_active'] = $request->boolean('is_active', false);

                // Parse majors/paths/quotas from text inputs
                if ($request->filled('available_majors_text')) {
                    $majors = array_filter(array_map('trim', explode(',', $request->input('available_majors_text'))));
                    $data['available_majors'] = array_values(array_unique($majors));
                }
                if ($request->filled('admission_paths_text')) {
                    $paths = array_filter(array_map('trim', explode(',', $request->input('admission_paths_text'))));
                    $data['admission_paths'] = array_values(array_unique($paths));
                }
                if ($request->filled('quotas_json')) {
                    $decoded = json_decode($request->input('quotas_json'), true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $data['quotas'] = $decoded;
                    }
                }

                $configuration = PPDBConfiguration::create($data);

                // Validate configuration
                $errors = $configuration->validateConfiguration();
                if (!empty($errors)) {
                    $configuration->delete();
                    return redirect()->back()
                        ->withInput()
                        ->withErrors(['configuration' => $errors]);
                }

                return redirect()->route('tenant.ppdb.configuration', ['tenant' => $tenant->npsn])
                    ->with('success', 'Konfigurasi PPDB berhasil dibuat.');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'menyimpan konfigurasi PPDB');
        }
    }

    public function editConfiguration(PPDBConfiguration $configuration)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure configuration belongs to current tenant
        if ($configuration->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Konfigurasi tidak ditemukan.');
        }
        
        return view('tenant.ppdb.edit-configuration', compact('configuration'));
    }

    public function updateConfiguration(PPDBConfigurationRequest $request, PPDBConfiguration $configuration)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure configuration belongs to current tenant
        if ($configuration->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Konfigurasi tidak ditemukan.');
        }

        try {
            return $this->transaction(function () use ($request, $configuration, $tenant) {
                // Only update allowed fields
                $validated = $request->validated();
                $data = $validated;
                $data['is_active'] = $request->boolean('is_active', false);

                if ($request->filled('available_majors_text')) {
                    $majors = array_filter(array_map('trim', explode(',', $request->input('available_majors_text'))));
                    $data['available_majors'] = array_values(array_unique($majors));
                }
                if ($request->filled('admission_paths_text')) {
                    $paths = array_filter(array_map('trim', explode(',', $request->input('admission_paths_text'))));
                    $data['admission_paths'] = array_values(array_unique($paths));
                }
                if ($request->filled('quotas_json')) {
                    $decoded = json_decode($request->input('quotas_json'), true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $data['quotas'] = $decoded;
                    }
                }

                $configuration->update($data);

                // Validate configuration
                $errors = $configuration->validateConfiguration();
                if (!empty($errors)) {
                    return redirect()->back()
                        ->withInput()
                        ->withErrors(['configuration' => $errors]);
                }

                return redirect()->route('tenant.ppdb.configuration', ['tenant' => $tenant->npsn])
                    ->with('success', 'Konfigurasi PPDB berhasil diperbarui.');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui konfigurasi PPDB');
        }
    }

    public function toggleConfiguration(PPDBConfiguration $configuration)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure configuration belongs to current tenant
        if ($configuration->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Konfigurasi tidak ditemukan.');
        }

        try {
            $configuration->update(['is_active' => !$configuration->is_active]);
            
            $status = $configuration->is_active ? 'diaktifkan' : 'dinonaktifkan';
            return redirect()->back()->with('success', "Konfigurasi PPDB berhasil {$status}.");
        } catch (\Exception $e) {
            return $this->handleException($e, 'mengubah status konfigurasi');
        }
    }

    public function runSelection(PPDBConfiguration $configuration)
    {
        $tenant = $this->getCurrentTenant();
        
        // Ensure configuration belongs to current tenant
        if ($configuration->instansi_id !== $tenant->id) {
            abort(403, 'Akses ditolak. Konfigurasi tidak ditemukan.');
        }

        try {
            $result = SelectionService::runSelection($configuration);
            return redirect()->back()->with('success', 'Seleksi selesai. Diterima: '.count($result['accepted']).', Ditolak: '.count($result['rejected']));
        } catch (\Exception $e) {
            return $this->handleException($e, 'menjalankan seleksi');
        }
    }
}