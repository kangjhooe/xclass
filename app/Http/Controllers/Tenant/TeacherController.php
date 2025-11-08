<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant\Teacher;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Subject;
use App\Models\User;
use App\Http\Requests\Tenant\StoreTeacherRequest;
use App\Http\Requests\Tenant\UpdateTeacherRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Notifications\TeacherAccountCreated;
use App\Exports\TeacherCredentialsExport;
use App\Exports\TeacherCredentialsPdfExport;
use Maatwebsite\Excel\Facades\Excel;

class TeacherController extends BaseTenantController
{
    /**
     * Display a listing of teachers
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Teacher::class);

        $tenant = $this->getCurrentTenant();
        
        // Get teachers that belong to this tenant (either primary or branch)
        $teacherIds = DB::table('teacher_tenants')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->pluck('teacher_id');
        
        // Include teachers with direct instansi_id for backward compatibility
        $query = Teacher::where(function($q) use ($tenant, $teacherIds) {
            $q->where('instansi_id', $tenant->id)
              ->orWhereIn('id', $teacherIds);
        });

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_number', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('nuptk', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan jenis kelamin
        if ($request->filled('gender')) {
            $query->where('gender', $request->get('gender'));
        }

        // Filter berdasarkan status aktif
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->get('is_active'));
        }

        $teachers = $query->with(['tenants', 'activeAdditionalDuties'])->paginate(20);

        return view('tenant.teachers.index', compact('teachers', 'tenant'));
    }

    /**
     * Show the form for creating a new teacher
     */
    public function create()
    {
        $this->authorize('create', Teacher::class);

        return view('tenant.teachers.create');
    }

    /**
     * Store a newly created teacher
     */
    public function store(StoreTeacherRequest $request)
    {
        $this->authorize('create', Teacher::class);

        $tenant = $this->getCurrentTenant();
        
        // Validate NIK format if provided
        if ($request->filled('nik') && !validate_nik($request->nik)) {
            return redirect()->back()
                ->withErrors(['nik' => 'Format NIK tidak valid. NIK harus terdiri dari 16 digit angka.'])
                ->withInput();
        }

        try {
            return $this->transaction(function () use ($request, $tenant) {
                // Check NIK jika diisi - NIK adalah patokan utama
                $existingTeacher = null;
                $isBranch = false;
                
                if ($request->filled('nik')) {
                    // Validasi format NIK
                    if (!validate_nik($request->nik)) {
                        throw new \Exception('Format NIK tidak valid. NIK harus terdiri dari 16 digit angka.');
                    }

                    // Check apakah NIK sudah ada
                    $existingTeacher = Teacher::where('nik', $request->nik)->first();
                    
                    if ($existingTeacher) {
                        // Guru dengan NIK ini sudah ada
                        // Check apakah sudah terdaftar di tenant ini
                        $teacherTenant = DB::table('teacher_tenants')
                            ->where('teacher_id', $existingTeacher->id)
                            ->where('tenant_id', $tenant->id)
                            ->first();
                        
                        if ($teacherTenant) {
                            throw new \Exception('Guru dengan NIK ini sudah terdaftar di sekolah ini.');
                        }
                        
                        // Guru bisa di-cabangkan ke tenant ini
                        $isBranch = true;
                    }
                }

                // Generate password random 8 karakter huruf kecil
                $characters = 'abcdefghijklmnopqrstuvwxyz';
                $password = '';
                for ($i = 0; $i < 8; $i++) {
                    $password .= $characters[rand(0, strlen($characters) - 1)];
                }

                if ($isBranch && $existingTeacher) {
                    // Cabangkan guru ke tenant ini
                    // Gunakan teacher yang sudah ada, buat user baru untuk tenant ini
                    $user = User::create([
                        'name' => $request->name,
                        'email' => $request->email,
                        'password' => Hash::make($password),
                        'role' => 'teacher',
                        'instansi_id' => $tenant->id,
                        'is_active' => true,
                    ]);

                    // Link teacher ke tenant sebagai branch
                    DB::table('teacher_tenants')->insert([
                        'teacher_id' => $existingTeacher->id,
                        'tenant_id' => $tenant->id,
                        'type' => 'branch',
                        'is_active' => true,
                        'assigned_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $teacher = $existingTeacher;
                } else {
                    // Create new teacher
                    $user = User::create([
                        'name' => $request->name,
                        'email' => $request->email,
                        'password' => Hash::make($password),
                        'role' => 'teacher',
                        'instansi_id' => $tenant->id,
                        'is_active' => true,
                    ]);

                    // Create Teacher record - use getAllowedFields to prevent mass assignment
                    $teacherData = [
                        'user_id' => $user->id,
                        'name' => $request->name,
                        'email' => $request->email,
                        'gender' => $request->gender,
                        'nik' => $request->nik,
                        'instansi_id' => $tenant->id,
                        'npsn' => $tenant->npsn,
                        'is_active' => true,
                    ];

                    $teacher = Teacher::create($teacherData);

                    // Link teacher ke tenant sebagai primary
                    DB::table('teacher_tenants')->insert([
                        'teacher_id' => $teacher->id,
                        'tenant_id' => $tenant->id,
                        'type' => 'primary',
                        'is_active' => true,
                        'assigned_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Log activity for create
                try {
                    \App\Models\ActivityLog::create([
                        'user_id' => auth()->id(),
                        'tenant_id' => $tenant->id,
                        'model_type' => get_class($teacher),
                        'model_id' => $teacher->id,
                        'action' => 'create',
                        'changes' => $teacher->toArray(),
                        'ip_address' => request()->ip(),
                        'user_agent' => request()->userAgent(),
                        'description' => 'Guru baru dibuat oleh ' . (auth()->user()?->name ?? 'System') . ($isBranch ? ' (Cabang)' : ''),
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to log activity: ' . $e->getMessage());
                }

                // Send email notification
                try {
                    $user->notify(new TeacherAccountCreated($teacher, $password, $tenant));
                } catch (\Exception $e) {
                    // Log error but don't fail the request
                    \Log::error('Failed to send email notification: ' . $e->getMessage());
                }

                // Prepare data for export
                $exportData = [[
                    'teacher' => $teacher,
                    'email' => $request->email,
                    'password' => $password,
                ]];

                // Store in session for export
                session([
                    'teacher_credentials_data' => $exportData,
                    'teacher_credentials_tenant' => $tenant,
                ]);

                return redirect()->route('tenant.teachers.index', ['tenant' => $tenant->npsn])
                    ->with('success', 'Guru berhasil ditambahkan dan akun login telah dibuat.')
                    ->with('password_info', $password)
                    ->with('email', $request->email)
                    ->with('teacher_nik', $teacher->nik)
                    ->with('show_export', true);
            });
        } catch (\Illuminate\Database\QueryException $e) {
            // Check for unique constraint violation (NIK)
            if ($e->getCode() == 23000 && strpos($e->getMessage(), 'teachers_nik_unique') !== false) {
                return redirect()->back()
                    ->withErrors(['nik' => 'NIK sudah terdaftar di sistem. Guru dengan NIK ini tidak bisa didaftarkan lagi, tetapi bisa di-cabangkan ke sekolah ini.'])
                    ->withInput();
            }
            
            return $this->handleException($e, 'menyimpan data guru');
        } catch (\Exception $e) {
            // Handle validation errors specially
            if (strpos($e->getMessage(), 'Format NIK') !== false || strpos($e->getMessage(), 'sudah terdaftar') !== false) {
                return redirect()->back()
                    ->withErrors(['nik' => $e->getMessage()])
                    ->withInput();
            }
            
            return $this->handleException($e, 'menyimpan data guru');
        }
    }

    /**
     * Display the specified teacher
     * Route model binding automatically resolves teacher by NIK
     */
    public function show(Teacher $teacher)
    {
        // Route::bind di AppServiceProvider sudah resolve teacher dengan benar
        // Type hint Teacher memastikan Laravel menggunakan Route::bind
        $this->authorize('view', $teacher);
        
        $teacher->load(['classes', 'subjects', 'schedules.classRoom', 'schedules.subject', 'additionalDuties']);
        
        return view('tenant.teachers.show', ['teacher' => $teacher]);
    }

    /**
     * Show the form for editing the specified teacher
     * Route model binding automatically resolves teacher by NIK
     */
    public function edit(Teacher $teacher)
    {
        // Route::bind di AppServiceProvider sudah resolve teacher dengan benar
        $this->authorize('update', $teacher);
        
        $teacher->load('additionalDuties');
        
        return view('tenant.teachers.edit', ['teacher' => $teacher]);
    }

    /**
     * Update the specified teacher
     * Route model binding automatically resolves teacher by NIK
     */
    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        // Route::bind di AppServiceProvider sudah resolve teacher dengan benar
        $tenant = $this->getCurrentTenant();
        
        $this->authorize('update', $teacher);

        try {
            return $this->transaction(function () use ($request, $teacher, $tenant) {
                // Only update allowed fields, prevent mass assignment
                $allowedFields = [
                    'name', 'email', 'phone', 'address', 'birth_date', 'birth_place',
                    'gender', 'religion', 'employee_number', 'nip', 'nuptk', 'page_id',
                    'npk', 'nik', 'mother_name', 'province', 'city', 'district',
                    'village', 'postal_code', 'subject_specialization', 'education_level',
                    'jenjang', 'study_program_group', 'is_active', 'salary', 'tpg_amount',
                    'tfg_amount', 'teaching_hours_per_week', 'other_workplace_hours',
                    'equivalent_teaching_hours',
                ];

                $teacherData = $this->getAllowedFields($request, $allowedFields);
                $teacher->update($teacherData);

                // Update user email if changed
                if ($teacher->user && $request->filled('email') && $teacher->user->email != $request->email) {
                    $teacher->user->update(['email' => $request->email]);
                }

                // Update additional duties
                if ($request->has('additional_duties')) {
                    $dutyIds = $request->input('additional_duties', []);
                    
                    // Get current active duties
                    $currentDuties = $teacher->additionalDuties()
                        ->wherePivot('is_active', true)
                        ->pluck('additional_duties.id')
                        ->toArray();
                    
                    // Duties to add
                    $toAdd = array_diff($dutyIds, $currentDuties);
                    
                    // Duties to remove (deactivate)
                    $toRemove = array_diff($currentDuties, $dutyIds);
                    
                    // Add new duties
                    foreach ($toAdd as $dutyId) {
                        $teacher->additionalDuties()->attach($dutyId, [
                            'assigned_date' => now(),
                            'is_active' => true,
                        ]);
                    }
                    
                    // Deactivate removed duties
                    foreach ($toRemove as $dutyId) {
                        DB::table('teacher_additional_duties')
                            ->where('teacher_id', $teacher->id)
                            ->where('additional_duty_id', $dutyId)
                            ->update([
                                'is_active' => false,
                                'end_date' => now(),
                            ]);
                    }
                } else {
                    // If no duties selected, deactivate all
                    DB::table('teacher_additional_duties')
                        ->where('teacher_id', $teacher->id)
                        ->where('is_active', true)
                        ->update([
                            'is_active' => false,
                            'end_date' => now(),
                        ]);
                }

                // Log activity manually for better tracking
                if (method_exists($teacher, 'activityLogs')) {
                    \App\Models\ActivityLog::create([
                        'user_id' => auth()->id(),
                        'tenant_id' => $tenant->id,
                        'model_type' => get_class($teacher),
                        'model_id' => $teacher->id,
                        'action' => 'update',
                        'changes' => $teacher->getChanges(),
                        'ip_address' => request()->ip(),
                        'user_agent' => request()->userAgent(),
                        'description' => 'Data guru diperbarui oleh ' . (auth()->user()?->name ?? 'System'),
                    ]);
                }

                return redirect()->route('tenant.teachers.show', ['tenant' => $tenant->npsn, 'teacher' => $teacher])
                    ->with('success', 'Data guru berhasil diperbarui');
            });
        } catch (\Exception $e) {
            return $this->handleException($e, 'memperbarui data guru');
        }
    }

    /**
     * Remove the specified teacher
     */
    /**
     * Delete the specified teacher
     * Route model binding automatically resolves teacher by NIK
     */
    public function destroy(Teacher $teacher)
    {
        // Route::bind di AppServiceProvider sudah resolve teacher dengan benar
        $tenant = $this->getCurrentTenant();
        
        $this->authorize('delete', $teacher);

        try {
            // Check for related records before deletion
            $issues = $this->checkRelationsBeforeDelete($teacher, [
                'classes' => 'Guru masih memiliki :count kelas sebagai wali kelas.',
                'schedules' => 'Guru masih memiliki :count jadwal mengajar.',
            ]);

            if (!empty($issues)) {
                return redirect()->back()
                    ->with('error', implode(' ', $issues) . ' Hapus atau pindahkan data terkait terlebih dahulu.');
            }

            // If this is a branch teacher, only remove the branch relationship
            $isBranch = DB::table('teacher_tenants')
                ->where('teacher_id', $teacher->id)
                ->where('tenant_id', $tenant->id)
                ->where('type', 'branch')
                ->exists();

            if ($isBranch) {
                // Just deactivate the branch relationship, don't delete the teacher
                DB::table('teacher_tenants')
                    ->where('teacher_id', $teacher->id)
                    ->where('tenant_id', $tenant->id)
                    ->update(['is_active' => false]);
            } else {
                // Primary teacher - can be deleted
                $teacher->delete();
            }

            return redirect()->route('tenant.teachers.index', ['tenant' => $tenant->npsn])
                ->with('success', 'Guru berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'menghapus guru');
        }
    }

    /**
     * Show teacher schedules
     * Route model binding automatically resolves teacher by NIK
     */
    public function schedules(Teacher $teacher)
    {
        // Route::bind di AppServiceProvider sudah resolve teacher dengan benar
        $this->authorize('view', $teacher);
        
        $teacher->load(['schedules.subject', 'schedules.classRoom']);
        
        return view('tenant.teachers.schedules', ['teacher' => $teacher]);
    }

    /**
     * Show teacher classes
     * Route model binding automatically resolves teacher by NIK
     */
    public function classes(Teacher $teacher)
    {
        // Route::bind di AppServiceProvider sudah resolve teacher dengan benar
        $this->authorize('view', $teacher);
        
        $teacher->load(['classes']);
        
        return view('tenant.teachers.classes', ['teacher' => $teacher]);
    }

    /**
     * Export teacher credentials to Excel
     */
    public function exportCredentialsExcel(Teacher $teacher)
    {
        // Note: This method doesn't need authorization as it only accesses session data
        // The session data is set during teacher creation which already has authorization
        $data = session('teacher_credentials_data');
        $tenant = session('teacher_credentials_tenant');

        if (!$data || !$tenant) {
            return redirect()->back()
                ->with('error', 'Data kredensial tidak ditemukan. Silakan buat guru baru.');
        }

        $export = new TeacherCredentialsExport($data);
        $filename = 'kredensial_guru_' . now()->format('Y-m-d_His') . '.xlsx';
        
        return Excel::download($export, $filename);
    }

    /**
     * Export teacher credentials to PDF
     */
    public function exportCredentialsPdf(Teacher $teacher)
    {
        // Note: This method doesn't need authorization as it only accesses session data
        // The session data is set during teacher creation which already has authorization
        $data = session('teacher_credentials_data');
        $tenant = session('teacher_credentials_tenant');

        if (!$data || !$tenant) {
            return redirect()->back()
                ->with('error', 'Data kredensial tidak ditemukan. Silakan buat guru baru.');
        }

        $export = new TeacherCredentialsPdfExport($data, $tenant);
        
        return $export->download();
    }

    /**
     * Get teacher data completion progress
     * Route model binding automatically resolves teacher by NIK
     */
    public function getProgress(Teacher $teacher)
    {
        // Route::bind di AppServiceProvider sudah resolve teacher dengan benar
        $this->authorize('view', $teacher);

        // Define all fields that should be filled for complete data
        $fieldsToCheck = [
            // Data Pribadi (18 fields) - weight: 25%
            ['name', 2], ['nik', 3], ['nuptk', 2], ['nip', 2], ['page_id', 1], ['npk', 1],
            ['birth_place', 1], ['birth_date', 2], ['gender', 2], ['mother_name', 1],
            ['address', 1], ['province', 1], ['city', 1], ['district', 1], ['village', 1],
            ['postal_code', 1], ['email', 2], ['phone', 1],
            // Data Pendidikan (3 fields) - weight: 10%
            ['jenjang', 2], ['study_program_group', 2], ['education_level', 2],
            // Status Kepegawaian (18 fields) - weight: 20%
            ['employment_status', 2], ['employment_status_detail', 1], ['employment_status_non_pns', 1],
            ['golongan', 1], ['tmt_sk_cpns', 1], ['tmt_sk_awal', 1], ['tmt_sk_terakhir', 1],
            ['appointing_institution', 1], ['assignment_status', 1], ['salary', 2],
            ['workplace_status', 1], ['satminkal_type', 1], ['satminkal_npsn', 1],
            ['satminkal_identity', 1], ['inpassing_status', 1], ['tmt_inpassing', 1],
            // Tugas & Mengajar (12 fields) - weight: 15%
            ['main_duty', 1], ['additional_duty', 1], ['main_duty_at_school', 1],
            ['active_status', 1], ['main_subject', 2], ['teaching_hours_per_week', 2],
            ['duty_type', 1], ['equivalent_teaching_hours', 1], ['teach_elsewhere', 1],
            ['other_workplace_type', 1], ['other_workplace_npsn', 1], ['other_workplace_subject', 1],
            // Sertifikasi (14 fields) - weight: 15%
            ['certification_participation_status', 1], ['certification_pass_status', 1],
            ['certification_year', 1], ['certification_subject', 1], ['nrg', 2],
            ['nrg_sk_number', 1], ['nrg_sk_date', 1], ['certification_participant_number', 1],
            ['certification_type', 1], ['certification_pass_date', 1], ['certificate_number', 1],
            ['certificate_issue_date', 1], ['lptk_name', 1],
            // Tunjangan (6 fields) - weight: 5%
            ['tpg_recipient_status', 1], ['tpg_start_year', 1], ['tpg_amount', 1],
            ['tfg_recipient_status', 1], ['tfg_start_year', 1], ['tfg_amount', 1],
            // Penghargaan (6 fields) - weight: 5%
            ['has_award', 1], ['highest_award', 1], ['award_field', 1],
            ['award_level', 1], ['award_year', 1], ['training_participated', 1],
            // Pelatihan (10 fields) - weight: 5%
            ['training_1', 1], ['training_year_1', 1], ['training_2', 1], ['training_year_2', 1],
            ['training_3', 1], ['training_year_3', 1], ['training_4', 1], ['training_year_4', 1],
            ['training_5', 1], ['training_year_5', 1],
        ];

        $totalWeight = 0;
        $filledWeight = 0;

        foreach ($fieldsToCheck as $fieldData) {
            $field = $fieldData[0];
            $weight = $fieldData[1];
            $totalWeight += $weight;

            $value = $teacher->$field;
            $isFilled = false;

            if (is_bool($value)) {
                $isFilled = true; // Boolean fields are always considered filled
            } elseif ($value !== null && $value !== '') {
                $isFilled = true;
            }

            if ($isFilled) {
                $filledWeight += $weight;
            }
        }

        $percentage = $totalWeight > 0 ? ($filledWeight / $totalWeight) * 100 : 0;

        return response()->json([
            'percentage' => round($percentage, 2),
            'filled' => $filledWeight,
            'total' => $totalWeight,
        ]);
    }
}