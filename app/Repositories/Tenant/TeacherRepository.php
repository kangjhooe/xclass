<?php

namespace App\Repositories\Tenant;

use App\Models\Tenant\Teacher;
use Illuminate\Database\Eloquent\Builder;

/**
 * Repository for Teacher entity
 * 
 * Handles all database operations for teachers within tenant scope
 */
class TeacherRepository extends BaseTenantRepository
{
    public function __construct()
    {
        parent::__construct(new Teacher());
    }

    /**
     * Apply search conditions for teachers
     */
    protected function applySearchConditions(Builder $query, string $searchTerm): void
    {
        $query->where(function (Builder $q) use ($searchTerm) {
            $q->where('name', 'like', "%{$searchTerm}%")
              ->orWhere('nuptk', 'like', "%{$searchTerm}%")
              ->orWhere('nip', 'like', "%{$searchTerm}%")
              ->orWhere('email', 'like', "%{$searchTerm}%")
              ->orWhere('phone', 'like', "%{$searchTerm}%")
              ->orWhere('subject', 'like', "%{$searchTerm}%");
        });
    }

    /**
     * Get teachers by subject
     */
    public function getBySubject(string $subject): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('subject', $subject)
            ->get();
    }

    /**
     * Get teachers by employment status
     */
    public function getByEmploymentStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('employment_status', $status)
            ->get();
    }

    /**
     * Get active teachers
     */
    public function getActive(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('is_active', true)
            ->get();
    }

    /**
     * Get teachers by gender
     */
    public function getByGender(string $gender): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('gender', $gender)
            ->get();
    }

    /**
     * Get teachers by education level
     */
    public function getByEducationLevel(string $level): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('education_level', $level)
            ->get();
    }

    /**
     * Get teachers with missing data
     */
    public function getWithMissingData(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where(function (Builder $q) {
                $q->whereNull('nuptk')
                  ->orWhereNull('nip')
                  ->orWhereNull('email')
                  ->orWhereNull('phone')
                  ->orWhereNull('address');
            })
            ->get();
    }

    /**
     * Get teacher statistics
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
            'by_subject' => $query->selectRaw('subject, COUNT(*) as count')
                ->groupBy('subject')
                ->pluck('count', 'subject')
                ->toArray(),
        ];
    }

    /**
     * Check if NUPTK exists in current tenant
     */
    public function nuptkExists(string $nuptk, ?int $excludeId = null): bool
    {
        $query = $this->getTenantQuery()->where('nuptk', $nuptk);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
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
     * Get teachers by hire date range
     */
    public function getByHireDateRange(string $startDate, string $endDate): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereBetween('hire_date', [$startDate, $endDate])
            ->get();
    }

    /**
     * Get teachers with profile photos
     */
    public function getWithPhotos(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNotNull('photo')
            ->get();
    }

    /**
     * Get teachers without profile photos
     */
    public function getWithoutPhotos(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNull('photo')
            ->get();
    }

    /**
     * Get teachers by age range
     */
    public function getByAgeRange(int $minAge, int $maxAge): \Illuminate\Database\Eloquent\Collection
    {
        $minBirthDate = now()->subYears($maxAge)->format('Y-m-d');
        $maxBirthDate = now()->subYears($minAge)->format('Y-m-d');
        
        return $this->getTenantQuery()
            ->whereBetween('birth_date', [$minBirthDate, $maxBirthDate])
            ->get();
    }
}
