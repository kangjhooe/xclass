<?php

namespace App\Services\Tenant;

use App\Repositories\Tenant\StaffRepository;
use App\Models\Tenant\Staff;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Service for Staff entity
 * 
 * Handles business logic for staff management
 */
class StaffService extends BaseTenantService
{
    protected array $validationRules = [
        'name' => 'required|string|max:255',
        'nip' => 'nullable|string|max:20|unique:staff,nip',
        'email' => 'nullable|email|max:255|unique:staff,email',
        'phone' => 'nullable|string|max:20',
        'address' => 'nullable|string',
        'birth_date' => 'nullable|date|before:today',
        'birth_place' => 'nullable|string|max:100',
        'gender' => 'required|in:L,P',
        'religion' => 'nullable|string|max:50',
        'position' => 'required|string|max:100',
        'department' => 'nullable|string|max:100',
        'education_level' => 'nullable|string|max:100',
        'employment_status' => 'required|in:permanent,contract,honorary,intern,resigned',
        'hire_date' => 'nullable|date|before_or_equal:today',
        'salary' => 'nullable|numeric|min:0',
        'is_active' => 'boolean',
    ];

    protected array $searchableFields = [
        'name', 'nip', 'email', 'phone', 'position', 'department'
    ];

    public function __construct(StaffRepository $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get validation rules with dynamic unique rules
     */
    protected function getValidationRules(?int $id = null): array
    {
        $rules = $this->validationRules;
        
        if ($id) {
            $rules['nip'] = [
                'nullable',
                'string',
                'max:20',
                Rule::unique('staff', 'nip')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
            $rules['email'] = [
                'nullable',
                'email',
                'max:255',
                Rule::unique('staff', 'email')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
        }
        
        return $rules;
    }

    /**
     * Create staff with photo upload
     */
    public function create(array $data, ?UploadedFile $photo = null): Staff
    {
        $this->validateData($data);
        $this->beforeCreate($data);
        
        // Handle photo upload
        if ($photo) {
            $data['photo'] = $this->uploadPhoto($photo);
        }
        
        $staff = $this->repository->create($data);
        
        $this->afterCreate($staff, $data);
        
        return $staff;
    }

    /**
     * Update staff with photo upload
     */
    public function update(int $id, array $data, ?UploadedFile $photo = null): Staff
    {
        $staff = $this->repository->findOrFail($id);
        
        $this->validateData($data, $id);
        $this->beforeUpdate($staff, $data);
        
        // Handle photo upload
        if ($photo) {
            // Delete old photo if exists
            if ($staff->photo) {
                $this->deletePhoto($staff->photo);
            }
            $data['photo'] = $this->uploadPhoto($photo);
        }
        
        $staff->update($data);
        
        $this->afterUpdate($staff, $data);
        
        return $staff->fresh();
    }

    /**
     * Upload staff photo
     */
    protected function uploadPhoto(UploadedFile $photo): string
    {
        $filename = 'staff_' . time() . '.' . $photo->getClientOriginalExtension();
        $path = $photo->storeAs('staff/photos', $filename, 'public');
        
        return $path;
    }

    /**
     * Delete staff photo
     */
    protected function deletePhoto(string $photoPath): void
    {
        if (Storage::disk('public')->exists($photoPath)) {
            Storage::disk('public')->delete($photoPath);
        }
    }

    /**
     * Get staff by position
     */
    public function getByPosition(string $position): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByPosition($position);
    }

    /**
     * Get staff by department
     */
    public function getByDepartment(string $department): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByDepartment($department);
    }

    /**
     * Get staff by employment status
     */
    public function getByEmploymentStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByEmploymentStatus($status);
    }

    /**
     * Get staff by gender
     */
    public function getByGender(string $gender): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByGender($gender);
    }

    /**
     * Get staff by education level
     */
    public function getByEducationLevel(string $level): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByEducationLevel($level);
    }

    /**
     * Get staff with missing data
     */
    public function getWithMissingData(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithMissingData();
    }

    /**
     * Get staff by hire date range
     */
    public function getByHireDateRange(string $startDate, string $endDate): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByHireDateRange($startDate, $endDate);
    }

    /**
     * Get staff by salary range
     */
    public function getBySalaryRange(float $minSalary, float $maxSalary): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getBySalaryRange($minSalary, $maxSalary);
    }

    /**
     * Get staff by age range
     */
    public function getByAgeRange(int $minAge, int $maxAge): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByAgeRange($minAge, $maxAge);
    }

    /**
     * Get staff by religion
     */
    public function getByReligion(string $religion): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByReligion($religion);
    }

    /**
     * Get staff by blood type
     */
    public function getByBloodType(string $bloodType): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByBloodType($bloodType);
    }

    /**
     * Get staff by marital status
     */
    public function getByMaritalStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByMaritalStatus($status);
    }

    /**
     * Check if NIP is available
     */
    public function isNipAvailable(string $nip, ?int $excludeId = null): bool
    {
        return !$this->repository->nipExists($nip, $excludeId);
    }

    /**
     * Get staff statistics
     */
    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    /**
     * Get staff without photos
     */
    public function getWithoutPhotos(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithoutPhotos();
    }

    /**
     * Bulk update employment status
     */
    public function bulkUpdateEmploymentStatus(array $ids, string $status): int
    {
        return $this->repository->bulkUpdate($ids, [
            'employment_status' => $status,
            'updated_at' => now()
        ]);
    }

    /**
     * Format staff for export
     */
    public function formatForExport(Staff $staff): array
    {
        return [
            'Nama' => $staff->name,
            'NIP' => $staff->nip,
            'Email' => $staff->email,
            'Telepon' => $staff->phone,
            'Alamat' => $staff->address,
            'Tanggal Lahir' => $staff->birth_date ? 
                $staff->birth_date->format('d-m-Y') : null,
            'Tempat Lahir' => $staff->birth_place,
            'Jenis Kelamin' => $staff->gender === 'L' ? 'Laki-laki' : 'Perempuan',
            'Agama' => $staff->religion,
            'Posisi' => $staff->position,
            'Departemen' => $staff->department,
            'Pendidikan' => $staff->education_level,
            'Status Kepegawaian' => ucfirst($staff->employment_status),
            'Tanggal Masuk' => $staff->hire_date ? 
                $staff->hire_date->format('d-m-Y') : null,
            'Gaji' => $staff->salary ? number_format($staff->salary, 0, ',', '.') : null,
            'Status Aktif' => $staff->is_active ? 'Aktif' : 'Tidak Aktif',
            'Dibuat' => $staff->created_at->format('d-m-Y H:i:s'),
            'Diperbarui' => $staff->updated_at->format('d-m-Y H:i:s'),
        ];
    }

    /**
     * Before create hook
     */
    protected function beforeCreate(array &$data): void
    {
        // Validate unique fields
        if (isset($data['nip']) && !$this->isNipAvailable($data['nip'])) {
            throw new \Exception('NIP sudah digunakan');
        }
    }

    /**
     * Before update hook
     */
    protected function beforeUpdate(Staff $staff, array &$data): void
    {
        // Check unique fields if they're being changed
        if (isset($data['nip']) && $data['nip'] !== $staff->nip) {
            if (!$this->isNipAvailable($data['nip'], $staff->id)) {
                throw new \Exception('NIP sudah digunakan');
            }
        }
    }

    /**
     * After delete hook
     */
    protected function afterDelete(Staff $staff): void
    {
        // Delete photo file when staff is deleted
        if ($staff->photo) {
            $this->deletePhoto($staff->photo);
        }
    }
}
