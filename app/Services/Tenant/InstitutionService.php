<?php

namespace App\Services\Tenant;

use App\Repositories\Tenant\InstitutionRepository;
use App\Models\Tenant\Institution;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Service for Institution entity
 * 
 * Handles business logic for institution management
 */
class InstitutionService extends BaseTenantService
{
    protected array $validationRules = [
        'npsn' => 'required|string|size:8|unique:institutions,npsn',
        'name' => 'required|string|max:255',
        'type' => 'required|in:sekolah,madrasah,pondok,lainnya',
        'address' => 'required|string',
        'phone' => 'nullable|string|max:20',
        'email' => 'nullable|email|max:255',
        'website' => 'nullable|url|max:255',
        'headmaster_name' => 'nullable|string|max:255',
        'headmaster_phone' => 'nullable|string|max:20',
        'headmaster_email' => 'nullable|email|max:255',
        'accreditation_status' => 'required|in:A,B,C,D,pending,expired',
        'accreditation_number' => 'nullable|string|max:100',
        'accreditation_date' => 'nullable|date',
        'is_active' => 'boolean',
    ];

    protected array $searchableFields = [
        'name', 'npsn', 'headmaster_name', 'address', 'phone', 'email'
    ];

    public function __construct(InstitutionRepository $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get validation rules with dynamic unique rule
     */
    protected function getValidationRules(?int $id = null): array
    {
        $rules = $this->validationRules;
        
        if ($id) {
            $rules['npsn'] = [
                'required',
                'string',
                'size:8',
                Rule::unique('institutions', 'npsn')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
        }
        
        return $rules;
    }

    /**
     * Create institution with logo upload
     */
    public function create(array $data, ?UploadedFile $logo = null): Institution
    {
        $this->validateData($data);
        $this->beforeCreate($data);
        
        // Handle logo upload
        if ($logo) {
            $data['logo'] = $this->uploadLogo($logo);
        }
        
        $institution = $this->repository->create($data);
        
        $this->afterCreate($institution, $data);
        
        return $institution;
    }

    /**
     * Update institution with logo upload
     */
    public function update(int $id, array $data, ?UploadedFile $logo = null): Institution
    {
        $institution = $this->repository->findOrFail($id);
        
        $this->validateData($data, $id);
        $this->beforeUpdate($institution, $data);
        
        // Handle logo upload
        if ($logo) {
            // Delete old logo if exists
            if ($institution->logo) {
                $this->deleteLogo($institution->logo);
            }
            $data['logo'] = $this->uploadLogo($logo);
        }
        
        $institution->update($data);
        
        $this->afterUpdate($institution, $data);
        
        return $institution->fresh();
    }

    /**
     * Upload institution logo
     */
    protected function uploadLogo(UploadedFile $logo): string
    {
        $filename = 'institution_' . time() . '.' . $logo->getClientOriginalExtension();
        $path = $logo->storeAs('institutions/logos', $filename, 'public');
        
        return $path;
    }

    /**
     * Delete institution logo
     */
    protected function deleteLogo(string $logoPath): void
    {
        if (Storage::disk('public')->exists($logoPath)) {
            Storage::disk('public')->delete($logoPath);
        }
    }

    /**
     * Get institutions by type
     */
    public function getByType(string $type): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByType($type);
    }

    /**
     * Get institutions by accreditation status
     */
    public function getByAccreditationStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByAccreditationStatus($status);
    }

    /**
     * Get institutions with expiring accreditation
     */
    public function getWithExpiringAccreditation(int $daysBeforeExpiry = 30): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithExpiringAccreditation($daysBeforeExpiry);
    }

    /**
     * Check if NPSN is available
     */
    public function isNpsnAvailable(string $npsn, ?int $excludeId = null): bool
    {
        return !$this->repository->npsnExists($npsn, $excludeId);
    }

    /**
     * Get institution statistics
     */
    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    /**
     * Get institutions with missing logos
     */
    public function getWithoutLogo(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithoutLogo();
    }

    /**
     * Bulk update accreditation status
     */
    public function bulkUpdateAccreditationStatus(array $ids, string $status): int
    {
        return $this->repository->bulkUpdate($ids, [
            'accreditation_status' => $status,
            'updated_at' => now()
        ]);
    }

    /**
     * Format institution for export
     */
    public function formatForExport(Institution $institution): array
    {
        return [
            'NPSN' => $institution->npsn,
            'Nama Lembaga' => $institution->name,
            'Tipe' => ucfirst($institution->type),
            'Alamat' => $institution->address,
            'Telepon' => $institution->phone,
            'Email' => $institution->email,
            'Website' => $institution->website,
            'Kepala Sekolah' => $institution->headmaster_name,
            'Telepon Kepala' => $institution->headmaster_phone,
            'Email Kepala' => $institution->headmaster_email,
            'Status Akreditasi' => $institution->accreditation_status,
            'Nomor Akreditasi' => $institution->accreditation_number,
            'Tanggal Akreditasi' => $institution->accreditation_date ? 
                $institution->accreditation_date->format('d-m-Y') : null,
            'Status Aktif' => $institution->is_active ? 'Aktif' : 'Tidak Aktif',
            'Dibuat' => $institution->created_at->format('d-m-Y H:i:s'),
            'Diperbarui' => $institution->updated_at->format('d-m-Y H:i:s'),
        ];
    }

    /**
     * Before create hook
     */
    protected function beforeCreate(array &$data): void
    {
        // Ensure NPSN is unique within tenant
        if (!$this->isNpsnAvailable($data['npsn'])) {
            throw new \Exception('NPSN sudah digunakan di lembaga ini');
        }
    }

    /**
     * Before update hook
     */
    protected function beforeUpdate(Institution $institution, array &$data): void
    {
        // Check NPSN uniqueness if it's being changed
        if (isset($data['npsn']) && $data['npsn'] !== $institution->npsn) {
            if (!$this->isNpsnAvailable($data['npsn'], $institution->id)) {
                throw new \Exception('NPSN sudah digunakan di lembaga ini');
            }
        }
    }

    /**
     * After delete hook
     */
    protected function afterDelete(Institution $institution): void
    {
        // Delete logo file when institution is deleted
        if ($institution->logo) {
            $this->deleteLogo($institution->logo);
        }
    }
}
