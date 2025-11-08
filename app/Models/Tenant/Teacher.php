<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class Teacher extends Model
{
    use HasFactory, HasNpsn, HasAuditLog, HasInstansi;

    protected $fillable = [
        'npsn',
        'name',
        'email',
        'phone',
        'address',
        'birth_date',
        'birth_place',
        'gender',
        'religion',
        'employee_number',
        'nip',
        'nuptk',
        'subject_specialization',
        'education_level',
        'is_active',
        'instansi_id',
        'user_id',
        // Data pribadi lengkap
        'page_id',
        'npk',
        'nik',
        'mother_name',
        'province',
        'city',
        'district',
        'village',
        'postal_code',
        // Data pendidikan
        'jenjang',
        'study_program_group',
        // Status kepegawaian
        'employment_status',
        'employment_status_detail',
        'employment_status_non_pns',
        'golongan',
        'tmt_sk_cpns',
        'tmt_sk_awal',
        'tmt_sk_terakhir',
        'appointing_institution',
        'assignment_status',
        'salary',
        'workplace_status',
        'satminkal_type',
        'satminkal_npsn',
        'satminkal_identity',
        'inpassing_status',
        'tmt_inpassing',
        // Tugas dan mengajar
        'main_duty',
        'additional_duty',
        'main_duty_at_school',
        'active_status',
        'main_subject',
        'teaching_hours_per_week',
        'duty_type',
        'equivalent_teaching_hours',
        'teach_elsewhere',
        'other_workplace_type',
        'other_workplace_npsn',
        'other_workplace_subject',
        'other_workplace_hours',
        // Sertifikasi
        'certification_participation_status',
        'certification_pass_status',
        'certification_year',
        'certification_subject',
        'nrg',
        'nrg_sk_number',
        'nrg_sk_date',
        'certification_participant_number',
        'certification_type',
        'certification_pass_date',
        'certificate_number',
        'certificate_issue_date',
        'lptk_name',
        // Tunjangan
        'tpg_recipient_status',
        'tpg_start_year',
        'tpg_amount',
        'tfg_recipient_status',
        'tfg_start_year',
        'tfg_amount',
        // Penghargaan
        'has_award',
        'highest_award',
        'award_field',
        'award_level',
        'award_year',
        'training_participated',
        'training_1',
        'training_year_1',
        'training_2',
        'training_year_2',
        'training_3',
        'training_year_3',
        'training_4',
        'training_year_4',
        'training_5',
        'training_year_5',
        // Kompetensi (untuk kepala madrasah)
        'personality_competence',
        'managerial_competence',
        'entrepreneurship_competence',
        'supervision_competence',
        'social_competence',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_active' => 'boolean',
        'tmt_sk_cpns' => 'date',
        'tmt_sk_awal' => 'date',
        'tmt_sk_terakhir' => 'date',
        'tmt_inpassing' => 'date',
        'nrg_sk_date' => 'date',
        'certification_pass_date' => 'date',
        'certificate_issue_date' => 'date',
        'teach_elsewhere' => 'boolean',
        'inpassing_status' => 'boolean',
        'tpg_recipient_status' => 'boolean',
        'tfg_recipient_status' => 'boolean',
        'has_award' => 'boolean',
        'training_participated' => 'boolean',
        'salary' => 'decimal:2',
        'tpg_amount' => 'decimal:2',
        'tfg_amount' => 'decimal:2',
    ];

    /**
     * Get the user account for this teacher
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Get the tenant (instansi) for this teacher
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the institution for this teacher
     */
    public function institution()
    {
        return $this->belongsTo(Institution::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Get all tenants this teacher is associated with (many-to-many for branch schools)
     */
    public function tenants()
    {
        return $this->belongsToMany(\App\Models\Core\Tenant::class, 'teacher_tenants')
                    ->withPivot('type', 'is_active', 'assigned_at', 'unassigned_at', 'notes')
                    ->withTimestamps();
    }

    /**
     * Get primary tenant for this teacher
     */
    public function primaryTenant()
    {
        return $this->tenants()->wherePivot('type', 'primary')->first();
    }

    /**
     * Get branch tenants for this teacher
     */
    public function branchTenants()
    {
        return $this->tenants()->wherePivot('type', 'branch')->wherePivot('is_active', true);
    }

    /**
     * Get additional duties for this teacher
     */
    public function additionalDuties()
    {
        return $this->belongsToMany(AdditionalDuty::class, 'teacher_additional_duties')
                    ->withPivot('assigned_date', 'end_date', 'is_active', 'notes')
                    ->withTimestamps();
    }

    /**
     * Get the route key for the model (use NIK instead of ID)
     */
    public function getRouteKeyName()
    {
        return 'nik';
    }

    /**
     * Retrieve the model for route model binding
     * 
     * OPTIMIZED: Cek cache hasil Route::bind terlebih dahulu.
     * Jika Route::bind sudah mengembalikan object Teacher, gunakan object tersebut.
     * 
     * FALLBACK: Jika Route::bind belum bekerja, lakukan query manual.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        // CRITICAL: Route::bind di AppServiceProvider harus dipanggil SEBELUM method ini
        // Jika method ini dipanggil, berarti Route::bind tidak bekerja atau belum terdaftar
        // 
        // DI LARAVEL 12: Route::bind mengambil precedence, jadi method ini seharusnya TIDAK dipanggil
        // jika Route::bind sudah terdaftar dengan benar.
        // 
        // FALLBACK: Jika Route::bind tidak bekerja, lakukan query manual sebagai last resort
        
        // Log untuk debugging - jika method ini dipanggil, berarti Route::bind TIDAK dipanggil
        \Log::warning("resolveRouteBinding dipanggil untuk Teacher dengan value: {$value}", [
            'field' => $field,
            'backtrace' => array_slice(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5), 0, 3)
        ]);
        
        // PRIORITY 1: Cek apakah Route::bind sudah melakukan binding dan hasilnya di-cache
        try {
            $request = app('request');
            if ($request) {
                // Cek cache dari request attributes (diset oleh Route::bind)
                $tenant = null;
                $tenantService = app(\App\Core\Services\TenantService::class);
                $tenant = $tenantService->getCurrentTenant();
                
                if ($tenant) {
                    $cacheKey = "route_bind_teacher_{$value}_{$tenant->id}";
                    $cachedTeacher = $request->attributes->get($cacheKey);
                    
                    // Jika ada di cache, langsung return (Route::bind sudah bekerja)
                    if ($cachedTeacher instanceof static) {
                        return $cachedTeacher;
                    }
                }
                
                // PRIORITY 2: Cek route parameter langsung
                if ($request->route()) {
                    $teacherParam = $request->route('teacher');
                    
                    // Jika teacher parameter sudah object Teacher instance, langsung return
                    if ($teacherParam instanceof static) {
                        // Verify it matches the value (NIK)
                        $field = $field ?: $this->getRouteKeyName();
                        if ($teacherParam->getAttribute($field) == $value) {
                            return $teacherParam;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            // Ignore errors, continue to fallback
        }
        
        // PRIORITY 3: FALLBACK - Jika Route::bind belum bekerja, lakukan query manual
        $field = $field ?: $this->getRouteKeyName();
        
        $tenantService = app(\App\Core\Services\TenantService::class);
        $tenant = $tenantService->getCurrentTenant();
        
        // If tenant not found, try to get from route
        if (!$tenant) {
            try {
                $request = app('request');
                if ($request && $request->route()) {
                    $tenantParam = $request->route('tenant');
                    if ($tenantParam) {
                        if (is_string($tenantParam)) {
                            $tenant = $tenantService->getTenantByNpsn($tenantParam);
                        } elseif (is_object($tenantParam)) {
                            $tenant = $tenantParam;
                        }
                        if ($tenant) {
                            $tenantService->setCurrentTenant($tenant);
                        }
                    }
                }
            } catch (\Exception $e) {
                // Ignore errors
            }
        }
        
        if (!$tenant) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel(static::class, [$value]);
        }
        
        // Query directly - same logic as Route::bind
        $teacher = static::where($field, $value)
            ->where('instansi_id', $tenant->id)
            ->first();
        
        // If not found, check teacher_tenants table
        if (!$teacher) {
            $teacherIds = \DB::table('teacher_tenants')
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->pluck('teacher_id')
                ->toArray();
            
            if (!empty($teacherIds)) {
                $teacher = static::where($field, $value)
                    ->whereIn('id', $teacherIds)
                    ->first();
            }
        }
        
        if (!$teacher) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel(static::class, [$value]);
        }
        
        return $teacher;
    }

    /**
     * Get active additional duties
     */
    public function activeAdditionalDuties()
    {
        return $this->additionalDuties()->wherePivot('is_active', true);
    }

    /**
     * Check if teacher has specific additional duty
     */
    public function hasAdditionalDuty(string $dutyCode): bool
    {
        return $this->activeAdditionalDuties()
            ->where('code', $dutyCode)
            ->exists();
    }

    /**
     * Check if teacher has access to module through additional duties
     */
    public function hasModuleAccess(string $moduleCode): bool
    {
        return $this->activeAdditionalDuties()
            ->whereHas('activeModuleAccesses', function($query) use ($moduleCode) {
                $query->where('module_code', $moduleCode);
            })
            ->exists();
    }

    /**
     * Get all modules accessible by this teacher through additional duties
     */
    public function getAccessibleModules()
    {
        $dutyIds = $this->activeAdditionalDuties->pluck('id');
        
        return ModuleAccess::whereIn('additional_duty_id', $dutyIds)
            ->where('is_active', true)
            ->get()
            ->unique('module_code');
    }

    /**
     * Get classes taught by this teacher
     */
    public function classes()
    {
        return $this->belongsToMany(ClassRoom::class, 'teacher_classes');
    }

    /**
     * Get subjects taught by this teacher
     */
    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects');
    }

    /**
     * Get schedules for this teacher
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Get attendances taken by this teacher
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get grades given by this teacher
     */
    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * Scope for active teachers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}