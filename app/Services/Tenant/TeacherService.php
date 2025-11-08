<?php

namespace App\Services\Tenant;

use App\Repositories\Tenant\TeacherRepository;
use App\Models\Tenant\Teacher;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Service for Teacher entity
 * 
 * Handles business logic for teacher management
 */
class TeacherService extends BaseTenantService
{
    protected array $validationRules = [
        'name' => 'required|string|max:255',
        'nuptk' => 'nullable|string|max:20|unique:teachers,nuptk',
        'nip' => 'nullable|string|max:20|unique:teachers,nip',
        'email' => 'nullable|email|max:255|unique:teachers,email',
        'phone' => 'nullable|string|max:20',
        'address' => 'nullable|string',
        'birth_date' => 'nullable|date|before:today',
        'birth_place' => 'nullable|string|max:100',
        'gender' => 'required|in:L,P',
        'religion' => 'nullable|string|max:50',
        'subject' => 'required|string|max:100',
        'education_level' => 'nullable|string|max:100',
        'employment_status' => 'required|in:permanent,contract,honorary,intern,resigned',
        'hire_date' => 'nullable|date|before_or_equal:today',
        'salary' => 'nullable|numeric|min:0',
        'is_active' => 'boolean',
    ];

    protected array $searchableFields = [
        'name', 'nuptk', 'nip', 'email', 'phone', 'subject'
    ];

    public function __construct(TeacherRepository $repository)
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
            $rules['nuptk'] = [
                'nullable',
                'string',
                'max:20',
                Rule::unique('teachers', 'nuptk')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
            $rules['nip'] = [
                'nullable',
                'string',
                'max:20',
                Rule::unique('teachers', 'nip')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
            $rules['email'] = [
                'nullable',
                'email',
                'max:255',
                Rule::unique('teachers', 'email')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
        }
        
        return $rules;
    }

    /**
     * Create teacher with photo upload
     */
    public function create(array $data, ?UploadedFile $photo = null): Teacher
    {
        $this->validateData($data);
        $this->beforeCreate($data);
        
        // Handle photo upload
        if ($photo) {
            $data['photo'] = $this->uploadPhoto($photo);
        }
        
        $teacher = $this->repository->create($data);
        
        $this->afterCreate($teacher, $data);
        
        return $teacher;
    }

    /**
     * Update teacher with photo upload
     */
    public function update(int $id, array $data, ?UploadedFile $photo = null): Teacher
    {
        $teacher = $this->repository->findOrFail($id);
        
        $this->validateData($data, $id);
        $this->beforeUpdate($teacher, $data);
        
        // Handle photo upload
        if ($photo) {
            // Delete old photo if exists
            if ($teacher->photo) {
                $this->deletePhoto($teacher->photo);
            }
            $data['photo'] = $this->uploadPhoto($photo);
        }
        
        $teacher->update($data);
        
        $this->afterUpdate($teacher, $data);
        
        return $teacher->fresh();
    }

    /**
     * Upload teacher photo
     */
    protected function uploadPhoto(UploadedFile $photo): string
    {
        $filename = 'teacher_' . time() . '.' . $photo->getClientOriginalExtension();
        $path = $photo->storeAs('teachers/photos', $filename, 'public');
        
        return $path;
    }

    /**
     * Delete teacher photo
     */
    protected function deletePhoto(string $photoPath): void
    {
        if (Storage::disk('public')->exists($photoPath)) {
            Storage::disk('public')->delete($photoPath);
        }
    }

    /**
     * Get teachers by subject
     */
    public function getBySubject(string $subject): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getBySubject($subject);
    }

    /**
     * Get teachers by employment status
     */
    public function getByEmploymentStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByEmploymentStatus($status);
    }

    /**
     * Get teachers by gender
     */
    public function getByGender(string $gender): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByGender($gender);
    }

    /**
     * Get teachers by education level
     */
    public function getByEducationLevel(string $level): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByEducationLevel($level);
    }

    /**
     * Get teachers with missing data
     */
    public function getWithMissingData(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithMissingData();
    }

    /**
     * Get teachers by hire date range
     */
    public function getByHireDateRange(string $startDate, string $endDate): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByHireDateRange($startDate, $endDate);
    }

    /**
     * Get teachers by age range
     */
    public function getByAgeRange(int $minAge, int $maxAge): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByAgeRange($minAge, $maxAge);
    }

    /**
     * Check if NUPTK is available
     */
    public function isNuptkAvailable(string $nuptk, ?int $excludeId = null): bool
    {
        return !$this->repository->nuptkExists($nuptk, $excludeId);
    }

    /**
     * Check if NIP is available
     */
    public function isNipAvailable(string $nip, ?int $excludeId = null): bool
    {
        return !$this->repository->nipExists($nip, $excludeId);
    }

    /**
     * Get teacher statistics
     */
    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    /**
     * Get teachers without photos
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
     * Format teacher for export
     */
    public function formatForExport(Teacher $teacher): array
    {
        return [
            'Nama' => $teacher->name,
            'NUPTK' => $teacher->nuptk,
            'NIP' => $teacher->nip,
            'Email' => $teacher->email,
            'Telepon' => $teacher->phone,
            'Alamat' => $teacher->address,
            'Tanggal Lahir' => $teacher->birth_date ? 
                $teacher->birth_date->format('d-m-Y') : null,
            'Tempat Lahir' => $teacher->birth_place,
            'Jenis Kelamin' => $teacher->gender === 'L' ? 'Laki-laki' : 'Perempuan',
            'Agama' => $teacher->religion,
            'Mata Pelajaran' => $teacher->subject,
            'Pendidikan' => $teacher->education_level,
            'Status Kepegawaian' => ucfirst($teacher->employment_status),
            'Tanggal Masuk' => $teacher->hire_date ? 
                $teacher->hire_date->format('d-m-Y') : null,
            'Gaji' => $teacher->salary ? number_format($teacher->salary, 0, ',', '.') : null,
            'Status Aktif' => $teacher->is_active ? 'Aktif' : 'Tidak Aktif',
            'Dibuat' => $teacher->created_at->format('d-m-Y H:i:s'),
            'Diperbarui' => $teacher->updated_at->format('d-m-Y H:i:s'),
        ];
    }

    /**
     * Before create hook
     */
    protected function beforeCreate(array &$data): void
    {
        // Validate unique fields
        if (isset($data['nuptk']) && !$this->isNuptkAvailable($data['nuptk'])) {
            throw new \Exception('NUPTK sudah digunakan');
        }
        
        if (isset($data['nip']) && !$this->isNipAvailable($data['nip'])) {
            throw new \Exception('NIP sudah digunakan');
        }
    }

    /**
     * Before update hook
     */
    protected function beforeUpdate(Teacher $teacher, array &$data): void
    {
        // Check unique fields if they're being changed
        if (isset($data['nuptk']) && $data['nuptk'] !== $teacher->nuptk) {
            if (!$this->isNuptkAvailable($data['nuptk'], $teacher->id)) {
                throw new \Exception('NUPTK sudah digunakan');
            }
        }
        
        if (isset($data['nip']) && $data['nip'] !== $teacher->nip) {
            if (!$this->isNipAvailable($data['nip'], $teacher->id)) {
                throw new \Exception('NIP sudah digunakan');
            }
        }
    }

    /**
     * After delete hook
     */
    protected function afterDelete(Teacher $teacher): void
    {
        // Delete photo file when teacher is deleted
        if ($teacher->photo) {
            $this->deletePhoto($teacher->photo);
        }
    }
}
