<?php

namespace App\Services\Tenant;

use App\Repositories\Tenant\ClassRoomRepository;
use App\Models\Tenant\ClassRoom;
use Illuminate\Validation\Rule;

/**
 * Service for ClassRoom entity
 * 
 * Handles business logic for classroom management
 */
class ClassRoomService extends BaseTenantService
{
    protected array $validationRules = [
        'name' => 'required|string|max:255',
        'code' => 'required|string|max:20|unique:classes,code',
        'level' => 'required|string|max:50',
        'type' => 'nullable|string|max:50',
        'capacity' => 'required|integer|min:1|max:100',
        'description' => 'nullable|string',
        'building' => 'nullable|string|max:100',
        'floor' => 'nullable|integer|min:0|max:10',
        'room_number' => 'nullable|string|max:20',
        'teacher_id' => 'nullable|exists:teachers,id',
        'academic_year' => 'nullable|integer|min:2020|max:2030',
        'equipment' => 'nullable|string',
        'status' => 'nullable|in:available,occupied,maintenance,closed',
        'is_available' => 'boolean',
        'needs_maintenance' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected array $searchableFields = [
        'name', 'code', 'description', 'building', 'room_number'
    ];

    public function __construct(ClassRoomRepository $repository)
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
            $rules['code'] = [
                'required',
                'string',
                'max:20',
                Rule::unique('classes', 'code')->ignore($id)->where('instansi_id', $this->repository->currentTenantId)
            ];
        }
        
        return $rules;
    }

    /**
     * Get classrooms by level
     */
    public function getByLevel(string $level): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByLevel($level);
    }

    /**
     * Get classrooms by capacity range
     */
    public function getByCapacityRange(int $minCapacity, int $maxCapacity): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByCapacityRange($minCapacity, $maxCapacity);
    }

    /**
     * Get classrooms by type
     */
    public function getByType(string $type): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByType($type);
    }

    /**
     * Get classrooms with students
     */
    public function getWithStudents(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithStudents();
    }

    /**
     * Get empty classrooms
     */
    public function getEmpty(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getEmpty();
    }

    /**
     * Get classrooms by academic year
     */
    public function getByAcademicYear(int $year): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByAcademicYear($year);
    }

    /**
     * Get classrooms by teacher
     */
    public function getByTeacher(int $teacherId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByTeacher($teacherId);
    }

    /**
     * Get classrooms by building
     */
    public function getByBuilding(string $building): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByBuilding($building);
    }

    /**
     * Get classrooms by floor
     */
    public function getByFloor(int $floor): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByFloor($floor);
    }

    /**
     * Get classrooms with equipment
     */
    public function getWithEquipment(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithEquipment();
    }

    /**
     * Get classrooms without equipment
     */
    public function getWithoutEquipment(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getWithoutEquipment();
    }

    /**
     * Get classrooms by status
     */
    public function getByStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByStatus($status);
    }

    /**
     * Get available classrooms
     */
    public function getAvailable(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getAvailable();
    }

    /**
     * Get classrooms by maintenance status
     */
    public function getByMaintenanceStatus(bool $needsMaintenance): \Illuminate\Database\Eloquent\Collection
    {
        return $this->repository->getByMaintenanceStatus($needsMaintenance);
    }

    /**
     * Check if class code is available
     */
    public function isCodeAvailable(string $code, ?int $excludeId = null): bool
    {
        return !$this->repository->codeExists($code, $excludeId);
    }

    /**
     * Get classroom statistics
     */
    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
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
     * Bulk update maintenance status
     */
    public function bulkUpdateMaintenanceStatus(array $ids, bool $needsMaintenance): int
    {
        return $this->repository->bulkUpdate($ids, [
            'needs_maintenance' => $needsMaintenance,
            'updated_at' => now()
        ]);
    }

    /**
     * Format classroom for export
     */
    public function formatForExport(ClassRoom $classRoom): array
    {
        return [
            'Nama Kelas' => $classRoom->name,
            'Kode Kelas' => $classRoom->code,
            'Jenjang' => $classRoom->level,
            'Tipe' => $classRoom->type,
            'Kapasitas' => $classRoom->capacity,
            'Deskripsi' => $classRoom->description,
            'Gedung' => $classRoom->building,
            'Lantai' => $classRoom->floor,
            'Nomor Ruang' => $classRoom->room_number,
            'Wali Kelas' => $classRoom->teacher->name ?? null,
            'Tahun Akademik' => $classRoom->academic_year,
            'Peralatan' => $classRoom->equipment,
            'Status' => ucfirst($classRoom->status),
            'Tersedia' => $classRoom->is_available ? 'Ya' : 'Tidak',
            'Perlu Perawatan' => $classRoom->needs_maintenance ? 'Ya' : 'Tidak',
            'Status Aktif' => $classRoom->is_active ? 'Aktif' : 'Tidak Aktif',
            'Jumlah Siswa' => $classRoom->students->count(),
            'Dibuat' => $classRoom->created_at->format('d-m-Y H:i:s'),
            'Diperbarui' => $classRoom->updated_at->format('d-m-Y H:i:s'),
        ];
    }

    /**
     * Before create hook
     */
    protected function beforeCreate(array &$data): void
    {
        // Validate unique code
        if (!$this->isCodeAvailable($data['code'])) {
            throw new \Exception('Kode kelas sudah digunakan');
        }
    }

    /**
     * Before update hook
     */
    protected function beforeUpdate(ClassRoom $classRoom, array &$data): void
    {
        // Check code uniqueness if it's being changed
        if (isset($data['code']) && $data['code'] !== $classRoom->code) {
            if (!$this->isCodeAvailable($data['code'], $classRoom->id)) {
                throw new \Exception('Kode kelas sudah digunakan');
            }
        }
    }

    /**
     * After create hook
     */
    protected function afterCreate(ClassRoom $classRoom, array $data): void
    {
        // Log classroom creation
        \Log::info("Classroom created: {$classRoom->name} ({$classRoom->code})");
    }

    /**
     * After update hook
     */
    protected function afterUpdate(ClassRoom $classRoom, array $data): void
    {
        // Log classroom update
        \Log::info("Classroom updated: {$classRoom->name} ({$classRoom->code})");
    }

    /**
     * After delete hook
     */
    protected function afterDelete(ClassRoom $classRoom): void
    {
        // Log classroom deletion
        \Log::info("Classroom deleted: {$classRoom->name} ({$classRoom->code})");
    }
}
