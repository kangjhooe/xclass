<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class Student extends Model
{
    use HasFactory, HasNpsn, HasAuditLog, HasInstansi;

    protected $fillable = [
        'npsn', 'name', 'email', 'phone', 'address', 'birth_date', 'birth_place', 'gender', 'religion',
        'class_id', 'student_number', 'nisn', 'parent_name', 'parent_phone', 'parent_email', 'is_active',
        'instansi_id', 'nik', 'nationality', 'ethnicity', 'language', 'blood_type', 'disability_type',
        'disability_description', 'rt', 'rw', 'village', 'sub_district', 'district', 'city', 'province',
        'postal_code', 'residence_type', 'transportation', 'previous_school', 'previous_school_address',
        'previous_school_city', 'previous_school_province', 'previous_school_phone', 'previous_school_principal',
        'previous_school_graduation_year', 'previous_school_certificate_number', 'father_name', 'father_nik',
        'father_birth_date', 'father_birth_place', 'father_education', 'father_occupation', 'father_company',
        'father_phone', 'father_email', 'father_income', 'mother_name', 'mother_nik', 'mother_birth_date',
        'mother_birth_place', 'mother_education', 'mother_occupation', 'mother_company', 'mother_phone',
        'mother_email', 'mother_income', 'guardian_name', 'guardian_nik', 'guardian_birth_date',
        'guardian_birth_place', 'guardian_education', 'guardian_occupation', 'guardian_company',
        'guardian_phone', 'guardian_email', 'guardian_income', 'guardian_relationship', 'height',
        'weight', 'health_condition', 'health_notes', 'allergies', 'medications', 'enrollment_date',
        'enrollment_semester', 'enrollment_year', 'student_status', 'notes', 'emergency_contact_name',
        'emergency_contact_phone', 'emergency_contact_relationship'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the route key for the model (use NISN instead of ID)
     */
    public function getRouteKeyName()
    {
        return 'nisn';
    }

    /**
     * Get the tenant (instansi) for this student
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the institution for this student
     */
    public function institution()
    {
        return $this->belongsTo(Institution::class, 'instansi_id', 'instansi_id');
    }

    /**
     * Get the class for this student
     */
    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    /**
     * Get attendances for this student
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get grades for this student
     */
    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * Get alumni record for this student
     */
    public function alumni()
    {
        return $this->hasOne(Alumni::class);
    }

    /**
     * Get book loans for this student
     */
    public function bookLoans()
    {
        return $this->hasMany(BookLoan::class);
    }

    /**
     * Get counseling sessions for this student
     */
    public function counselingSessions()
    {
        return $this->hasMany(CounselingSession::class);
    }

    /**
     * Get disciplinary actions for this student
     */
    public function disciplinaryActions()
    {
        return $this->hasMany(DisciplinaryAction::class);
    }

    /**
     * Get class alias (for backward compatibility)
     */
    public function getClassAttribute()
    {
        return $this->classRoom;
    }

    /**
     * Scope for active students
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for students by class
     */
    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Retrieve the model for route model binding
     * Use NISN as route key and ensure tenant scope
     * 
     * NOTE: Route::bind di AppServiceProvider mengambil precedence, method ini hanya fallback
     * jika Route::bind tidak digunakan atau untuk backward compatibility
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $tenantService = app(\App\Core\Services\TenantService::class);
        $tenant = $tenantService->getCurrentTenant();
        
        // If tenant not found in service, try to get from route
        if (!$tenant) {
            try {
                $request = app('request');
                if ($request) {
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
                // Ignore errors during tenant resolution
            }
        }
        
        if (!$tenant) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel(static::class, [$value]);
        }
        
        // Use NISN as default field for route binding
        $field = $field ?: $this->getRouteKeyName();
        
        // Use newModelQuery to avoid global scopes issues during route binding
        $query = $this->newModelQuery();
        
        // Apply field filter
        $query->where($field, $value);
        
        // Apply tenant scope
        $query->where('instansi_id', $tenant->id);
        
        // Return model instance
        $model = $query->first();
        
        if (!$model) {
            throw (new \Illuminate\Database\Eloquent\ModelNotFoundException)->setModel(static::class, [$value]);
        }
        
        return $model;
    }
}