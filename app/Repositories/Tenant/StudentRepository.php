<?php

namespace App\Repositories\Tenant;

use App\Models\Tenant\Student;
use Illuminate\Database\Eloquent\Builder;

/**
 * Repository for Student entity
 * 
 * Handles all database operations for students within tenant scope
 */
class StudentRepository extends BaseTenantRepository
{
    public function __construct()
    {
        parent::__construct(new Student());
    }

    /**
     * Apply search conditions for students
     */
    protected function applySearchConditions(Builder $query, string $searchTerm): void
    {
        $query->where(function (Builder $q) use ($searchTerm) {
            $q->where('name', 'like', "%{$searchTerm}%")
              ->orWhere('nis', 'like', "%{$searchTerm}%")
              ->orWhere('nisn', 'like', "%{$searchTerm}%")
              ->orWhere('email', 'like', "%{$searchTerm}%")
              ->orWhere('phone', 'like', "%{$searchTerm}%")
              ->orWhere('parent_name', 'like', "%{$searchTerm}%")
              ->orWhere('parent_phone', 'like', "%{$searchTerm}%");
        });
    }

    /**
     * Get students by class
     */
    public function getByClass(int $classId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('class_id', $classId)
            ->get();
    }

    /**
     * Get students by gender
     */
    public function getByGender(string $gender): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('gender', $gender)
            ->get();
    }

    /**
     * Get students by religion
     */
    public function getByReligion(string $religion): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('religion', $religion)
            ->get();
    }

    /**
     * Get active students
     */
    public function getActive(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('is_active', true)
            ->get();
    }

    /**
     * Get students by enrollment year
     */
    public function getByEnrollmentYear(int $year): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereYear('enrollment_date', $year)
            ->get();
    }

    /**
     * Get students by age range
     */
    public function getByAgeRange(int $minAge, int $maxAge): \Illuminate\Database\Eloquent\Collection
    {
        $minBirthDate = now()->subYears($maxAge)->format('Y-m-d');
        $maxBirthDate = now()->subYears($minAge)->format('Y-m-d');
        
        return $this->getTenantQuery()
            ->whereBetween('birth_date', [$minBirthDate, $maxBirthDate])
            ->get();
    }

    /**
     * Get students with missing data
     */
    public function getWithMissingData(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where(function (Builder $q) {
                $q->whereNull('nis')
                  ->orWhereNull('nisn')
                  ->orWhereNull('email')
                  ->orWhereNull('phone')
                  ->orWhereNull('address')
                  ->orWhereNull('parent_name')
                  ->orWhereNull('parent_phone');
            })
            ->get();
    }

    /**
     * Get students by status
     */
    public function getByStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('status', $status)
            ->get();
    }

    /**
     * Get student statistics
     */
    public function getStatistics(): array
    {
        $query = $this->getTenantQuery();
        
        return [
            'total' => $query->count(),
            'active' => $query->where('is_active', true)->count(),
            'inactive' => $query->where('is_active', false)->count(),
            'by_gender' => $query->selectRaw('gender, COUNT(*) as count')
                ->groupBy('gender')
                ->pluck('count', 'gender')
                ->toArray(),
            'by_religion' => $query->selectRaw('religion, COUNT(*) as count')
                ->groupBy('religion')
                ->pluck('count', 'religion')
                ->toArray(),
            'by_status' => $query->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray(),
            'by_class' => $query->join('classes', 'students.class_id', '=', 'classes.id')
                ->selectRaw('classes.name as class_name, COUNT(*) as count')
                ->groupBy('classes.name')
                ->pluck('count', 'class_name')
                ->toArray(),
        ];
    }

    /**
     * Check if NIS exists in current tenant
     */
    public function nisExists(string $nis, ?int $excludeId = null): bool
    {
        $query = $this->getTenantQuery()->where('nis', $nis);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Check if NISN exists in current tenant
     */
    public function nisnExists(string $nisn, ?int $excludeId = null): bool
    {
        $query = $this->getTenantQuery()->where('nisn', $nisn);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Get students with photos
     */
    public function getWithPhotos(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNotNull('photo')
            ->get();
    }

    /**
     * Get students without photos
     */
    public function getWithoutPhotos(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNull('photo')
            ->get();
    }

    /**
     * Get students by graduation year
     */
    public function getByGraduationYear(int $year): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereYear('graduation_date', $year)
            ->get();
    }

    /**
     * Get students by parent occupation
     */
    public function getByParentOccupation(string $occupation): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('parent_occupation', $occupation)
            ->get();
    }

    /**
     * Get students by blood type
     */
    public function getByBloodType(string $bloodType): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('blood_type', $bloodType)
            ->get();
    }

    /**
     * Get students by special needs
     */
    public function getWithSpecialNeeds(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('has_special_needs', true)
            ->get();
    }

    /**
     * Get students by transportation method
     */
    public function getByTransportation(string $transportation): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('transportation', $transportation)
            ->get();
    }
}
