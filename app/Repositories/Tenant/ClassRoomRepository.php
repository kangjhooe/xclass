<?php

namespace App\Repositories\Tenant;

use App\Models\Tenant\ClassRoom;
use Illuminate\Database\Eloquent\Builder;

/**
 * Repository for ClassRoom entity
 * 
 * Handles all database operations for classrooms within tenant scope
 */
class ClassRoomRepository extends BaseTenantRepository
{
    public function __construct()
    {
        parent::__construct(new ClassRoom());
    }

    /**
     * Apply search conditions for classrooms
     */
    protected function applySearchConditions(Builder $query, string $searchTerm): void
    {
        $query->where(function (Builder $q) use ($searchTerm) {
            $q->where('name', 'like', "%{$searchTerm}%")
              ->orWhere('code', 'like', "%{$searchTerm}%")
              ->orWhere('description', 'like', "%{$searchTerm}%");
        });
    }

    /**
     * Get classrooms by level
     */
    public function getByLevel(string $level): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('level', $level)
            ->get();
    }

    /**
     * Get active classrooms
     */
    public function getActive(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('is_active', true)
            ->get();
    }

    /**
     * Get classrooms by capacity range
     */
    public function getByCapacityRange(int $minCapacity, int $maxCapacity): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereBetween('capacity', [$minCapacity, $maxCapacity])
            ->get();
    }

    /**
     * Get classrooms by type
     */
    public function getByType(string $type): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('type', $type)
            ->get();
    }

    /**
     * Get classrooms with students
     */
    public function getWithStudents(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereHas('students')
            ->get();
    }

    /**
     * Get empty classrooms
     */
    public function getEmpty(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereDoesntHave('students')
            ->get();
    }

    /**
     * Get classroom statistics
     */
    public function getStatistics(): array
    {
        $query = $this->getTenantQuery();
        
        return [
            'total' => $query->count(),
            'active' => $query->where('is_active', true)->count(),
            'inactive' => $query->where('is_active', false)->count(),
            'by_level' => $query->selectRaw('level, COUNT(*) as count')
                ->groupBy('level')
                ->pluck('count', 'level')
                ->toArray(),
            'by_type' => $query->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'with_students' => $query->whereHas('students')->count(),
            'empty' => $query->whereDoesntHave('students')->count(),
        ];
    }

    /**
     * Check if class code exists in current tenant
     */
    public function codeExists(string $code, ?int $excludeId = null): bool
    {
        $query = $this->getTenantQuery()->where('code', $code);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Get classrooms by academic year
     */
    public function getByAcademicYear(int $year): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('academic_year', $year)
            ->get();
    }

    /**
     * Get classrooms by teacher
     */
    public function getByTeacher(int $teacherId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('teacher_id', $teacherId)
            ->get();
    }

    /**
     * Get classrooms by building
     */
    public function getByBuilding(string $building): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('building', $building)
            ->get();
    }

    /**
     * Get classrooms by floor
     */
    public function getByFloor(int $floor): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('floor', $floor)
            ->get();
    }

    /**
     * Get classrooms with equipment
     */
    public function getWithEquipment(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNotNull('equipment')
            ->get();
    }

    /**
     * Get classrooms without equipment
     */
    public function getWithoutEquipment(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNull('equipment')
            ->get();
    }

    /**
     * Get classrooms by status
     */
    public function getByStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('status', $status)
            ->get();
    }

    /**
     * Get classrooms by availability
     */
    public function getAvailable(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('is_available', true)
            ->get();
    }

    /**
     * Get classrooms by maintenance status
     */
    public function getByMaintenanceStatus(bool $needsMaintenance): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('needs_maintenance', $needsMaintenance)
            ->get();
    }
}
