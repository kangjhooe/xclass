<?php

namespace App\Services\Tenant;

use App\Repositories\Tenant\StudentRepository;
use App\Models\Tenant\Student;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Service for Student entity
 * 
 * Handles business logic for student management
 */
class StudentService extends BaseTenantService
{
    protected array $validationRules = [
        'name' => 'required|string|max:255',
        'nis' => 'nullable|string|max:20|unique:students,nis',
        'nisn' => 'nullable|string|max:10|unique:students,nisn',
        'email' => 'nullable|email|max:255|unique:students,email',
        'phone' => 'nullable|string|max:20',
        'address' => 'nullable|string',
        'birth_date' => 'nullable|date|before:today',
        'birth_place' => 'nullable|string|max:100',
        'gender' => 'required|in:L,P',
        'religion' => 'nullable|string|max:50',
        'class_id' => 'required|exists:classes,id',
        'enrollment_date' => 'nullable|date|before_or_equal:today',
        'graduation_date' => 'nullable|date|after:enrollment_date',
        'status' => 'required|in:active,graduated,transferred,dropped_out',
        'parent_name' => 'nullable|string|max:255',
        'parent_phone' => 'nullable|string|max:20',
        'parent_email' => 'nullable|email|max:255',
        'parent_occupation' => 'nullable|string|max:100',
        'blood_type' => 'nullable|in:A,B,AB,O',
        'has_special_needs' => 'boolean',
        'special_needs_description' => 'nullable|string',
        'transportation' => 'nullable|string|max:50',
        'is_active' => 'boolean',
    ];

    protected array $searchableFields = [
        'name', 'nis', 'nisn', 'email', 'phone', 'parent_name', 'parent_phone'
    ];

    public function __construct(StudentRepository $repository)
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
            $rules['nis'] = [
                'nullable',
                'string',
                'max:20',
                Rule::unique('students', 'nis')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
            $rules['nisn'] = [
                'nullable',
                'string',
                'max:10',
                Rule::unique('students', 'nisn')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
            $rules['email'] = [
                'nullable',
                'email',
                'max:255',
                Rule::unique('students', 'email')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
        }
        
        return $rules;
    }

    /**
     * Create student with photo upload
     */
    public function create(array $data, ?UploadedFile $photo = null): Student
    {
        $this->validateData($data);
        $this->beforeCreate($data);
        
        // Handle photo upload
        if ($photo) {
            $data['photo'] = $this->uploadPhoto($photo);
        }
        
        $student = $this->repository->create($data);
        
        $this->afterCreate($student, $data);
        
        return $student;
    }

    /**
     * Update student with photo upload
     */
    public function update(int $id, array $data, ?UploadedFile $photo = null): Student
    {
        $student = $this->repository->findOrFail($id);
        
        $this->validateData($data, $id);
        $this->beforeUpdate($student, $data);
        
        // Handle photo upload
        if ($photo) {
            // Delete old photo if exists
            if ($student->photo) {
                $this->deletePhoto($student->photo);
            }
            $data['photo'] = $this->uploadPhoto($photo);
        }
        
        $student->update($data);
        
        $this->afterUpdate($student, $data);
        
        return $student->fresh();
    }

    /**
     * Upload student photo
     */
    protected function uploadPhoto(UploadedFile $photo): string
    {
        $filename = 'student_' . time() . '.' . $photo->getClientOriginalExtension();
        $path = $photo->storeAs('students/photos', $filename, 'public');
        
        return $path;
    }

    /**
     * Delete student photo
     */
    protected function deletePhoto(string $photoPath): void
    {
        if (Storage::disk('public')->exists($photoPath)) {
            Storage::disk('public')->delete($photoPath);
        }
    }

    /**
     * Get students by class
     */
    public function getByClass(int $classId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByClass($classId);
    }

    /**
     * Get students by gender
     */
    public function getByGender(string $gender): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByGender($gender);
    }

    /**
     * Get students by religion
     */
    public function getByReligion(string $religion): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByReligion($religion);
    }

    /**
     * Get students by enrollment year
     */
    public function getByEnrollmentYear(int $year): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByEnrollmentYear($year);
    }

    /**
     * Get students by age range
     */
    public function getByAgeRange(int $minAge, int $maxAge): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByAgeRange($minAge, $maxAge);
    }

    /**
     * Get students with missing data
     */
    public function getWithMissingData(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithMissingData();
    }

    /**
     * Get students by status
     */
    public function getByStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByStatus($status);
    }

    /**
     * Get students by graduation year
     */
    public function getByGraduationYear(int $year): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByGraduationYear($year);
    }

    /**
     * Get students by parent occupation
     */
    public function getByParentOccupation(string $occupation): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByParentOccupation($occupation);
    }

    /**
     * Get students by blood type
     */
    public function getByBloodType(string $bloodType): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByBloodType($bloodType);
    }

    /**
     * Get students with special needs
     */
    public function getWithSpecialNeeds(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithSpecialNeeds();
    }

    /**
     * Get students by transportation method
     */
    public function getByTransportation(string $transportation): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByTransportation($transportation);
    }

    /**
     * Check if NIS is available
     */
    public function isNisAvailable(string $nis, ?int $excludeId = null): bool
    {
        return !$this->repository->nisExists($nis, $excludeId);
    }

    /**
     * Check if NISN is available
     */
    public function isNisnAvailable(string $nisn, ?int $excludeId = null): bool
    {
        return !$this->repository->nisnExists($nisn, $excludeId);
    }

    /**
     * Get student statistics
     */
    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    /**
     * Get students without photos
     */
    public function getWithoutPhotos(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithoutPhotos();
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(array $ids, string $status): int
    {
        return $this->repository->bulkUpdate($ids, [
            'status' => $status,
            'updated_at' => now()
        ]);
    }

    /**
     * Format student for export
     */
    public function formatForExport(Student $student): array
    {
        return [
            'Nama' => $student->name,
            'NIS' => $student->nis,
            'NISN' => $student->nisn,
            'Email' => $student->email,
            'Telepon' => $student->phone,
            'Alamat' => $student->address,
            'Tanggal Lahir' => $student->birth_date ? 
                $student->birth_date->format('d-m-Y') : null,
            'Tempat Lahir' => $student->birth_place,
            'Jenis Kelamin' => $student->gender === 'L' ? 'Laki-laki' : 'Perempuan',
            'Agama' => $student->religion,
            'Kelas' => $student->class->name ?? null,
            'Tanggal Masuk' => $student->enrollment_date ? 
                $student->enrollment_date->format('d-m-Y') : null,
            'Tanggal Lulus' => $student->graduation_date ? 
                $student->graduation_date->format('d-m-Y') : null,
            'Status' => ucfirst($student->status),
            'Nama Orang Tua' => $student->parent_name,
            'Telepon Orang Tua' => $student->parent_phone,
            'Email Orang Tua' => $student->parent_email,
            'Pekerjaan Orang Tua' => $student->parent_occupation,
            'Golongan Darah' => $student->blood_type,
            'Kebutuhan Khusus' => $student->has_special_needs ? 'Ya' : 'Tidak',
            'Deskripsi Kebutuhan Khusus' => $student->special_needs_description,
            'Transportasi' => $student->transportation,
            'Status Aktif' => $student->is_active ? 'Aktif' : 'Tidak Aktif',
            'Dibuat' => $student->created_at->format('d-m-Y H:i:s'),
            'Diperbarui' => $student->updated_at->format('d-m-Y H:i:s'),
        ];
    }

    /**
     * Before create hook
     */
    protected function beforeCreate(array &$data): void
    {
        // Validate unique fields
        if (isset($data['nis']) && !$this->isNisAvailable($data['nis'])) {
            throw new \Exception('NIS sudah digunakan');
        }
        
        if (isset($data['nisn']) && !$this->isNisnAvailable($data['nisn'])) {
            throw new \Exception('NISN sudah digunakan');
        }
    }

    /**
     * Before update hook
     */
    protected function beforeUpdate(Student $student, array &$data): void
    {
        // Check unique fields if they're being changed
        if (isset($data['nis']) && $data['nis'] !== $student->nis) {
            if (!$this->isNisAvailable($data['nis'], $student->id)) {
                throw new \Exception('NIS sudah digunakan');
            }
        }
        
        if (isset($data['nisn']) && $data['nisn'] !== $student->nisn) {
            if (!$this->isNisnAvailable($data['nisn'], $student->id)) {
                throw new \Exception('NISN sudah digunakan');
            }
        }
    }

    /**
     * After delete hook
     */
    protected function afterDelete(Student $student): void
    {
        // Delete photo file when student is deleted
        if ($student->photo) {
            $this->deletePhoto($student->photo);
        }
    }
}
