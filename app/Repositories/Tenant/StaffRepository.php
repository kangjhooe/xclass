<?php

namespace App\Repositories\Tenant;

use App\Models\Tenant\Staff;
use Illuminate\Database\Eloquent\Builder;

/**
 * Repository for Staff entity
 * 
 * Handles all database operations for staff within tenant scope
 */
class StaffRepository extends BaseTenantRepository
{
    public function __construct()
    {
        parent::__construct(new Staff());
    }

    /**
     * Apply search conditions for staff
     */
    protected function applySearchConditions(Builder $query, string $searchTerm): void
    {
        $query->where(function (Builder $q) use ($searchTerm) {
            $q->where('name', 'like', "%{$searchTerm}%")
              ->orWhere('nip', 'like', "%{$searchTerm}%")
              ->orWhere('email', 'like', "%{$searchTerm}%")
              ->orWhere('phone', 'like', "%{$searchTerm}%")
              ->orWhere('position', 'like', "%{$searchTerm}%")
              ->orWhere('department', 'like', "%{$searchTerm}%");
        });
    }

    /**
     * Get staff by position
     */
    public function getByPosition(string $position): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('position', $position)
            ->get();
    }

    /**
     * Get staff by department
     */
    public function getByDepartment(string $department): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('department', $department)
            ->get();
    }

    /**
     * Get staff by employment status
     */
    public function getByEmploymentStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('employment_status', $status)
            ->get();
    }

    /**
     * Get active staff
     */
    public function getActive(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('is_active', true)
            ->get();
    }

    /**
     * Get staff by gender
     */
    public function getByGender(string $gender): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('gender', $gender)
            ->get();
    }

    /**
     * Get staff by education level
     */
    public function getByEducationLevel(string $level): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('education_level', $level)
            ->get();
    }

    /**
     * Get staff with missing data
     */
    public function getWithMissingData(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where(function (Builder $q) {
                $q->whereNull('nip')
                  ->orWhereNull('email')
                  ->orWhereNull('phone')
                  ->orWhereNull('address')
                  ->orWhereNull('position')
                  ->orWhereNull('department');
            })
            ->get();
    }

    /**
     * Get staff by hire date range
     */
    public function getByHireDateRange(string $startDate, string $endDate): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereBetween('hire_date', [$startDate, $endDate])
            ->get();
    }

    /**
     * Get staff by salary range
     */
    public function getBySalaryRange(float $minSalary, float $maxSalary): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereBetween('salary', [$minSalary, $maxSalary])
            ->get();
    }

    /**
     * Get staff statistics
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
            'by_employment_status' => $query->selectRaw('employment_status, COUNT(*) as count')
                ->groupBy('employment_status')
                ->pluck('count', 'employment_status')
                ->toArray(),
            'by_education_level' => $query->selectRaw('education_level, COUNT(*) as count')
                ->groupBy('education_level')
                ->pluck('count', 'education_level')
                ->toArray(),
            'by_position' => $query->selectRaw('position, COUNT(*) as count')
                ->groupBy('position')
                ->pluck('count', 'position')
                ->toArray(),
            'by_department' => $query->selectRaw('department, COUNT(*) as count')
                ->groupBy('department')
                ->pluck('count', 'department')
                ->toArray(),
        ];
    }

    /**
     * Check if NIP exists in current tenant
     */
    public function nipExists(string $nip, ?int $excludeId = null): bool
    {
        $query = $this->getTenantQuery()->where('nip', $nip);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Get staff with photos
     */
    public function getWithPhotos(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNotNull('photo')
            ->get();
    }

    /**
     * Get staff without photos
     */
    public function getWithoutPhotos(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNull('photo')
            ->get();
    }

    /**
     * Get staff by age range
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
     * Get staff by religion
     */
    public function getByReligion(string $religion): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('religion', $religion)
            ->get();
    }

    /**
     * Get staff by blood type
     */
    public function getByBloodType(string $bloodType): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('blood_type', $bloodType)
            ->get();
    }

    /**
     * Get staff by marital status
     */
    public function getByMaritalStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('marital_status', $status)
            ->get();
    }

    /**
     * Get staff by emergency contact
     */
    public function getByEmergencyContact(string $contact): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('emergency_contact', $contact)
            ->get();
    }
}
