<?php

namespace App\Repositories\Tenant;

use App\Models\Tenant\Institution;
use Illuminate\Database\Eloquent\Builder;

/**
 * Repository for Institution entity
 * 
 * Handles all database operations for institutions within tenant scope
 */
class InstitutionRepository extends BaseTenantRepository
{
    public function __construct()
    {
        parent::__construct(new Institution());
    }

    /**
     * Apply search conditions for institutions
     */
    protected function applySearchConditions(Builder $query, string $searchTerm): void
    {
        $query->where(function (Builder $q) use ($searchTerm) {
            $q->where('name', 'like', "%{$searchTerm}%")
              ->orWhere('npsn', 'like', "%{$searchTerm}%")
              ->orWhere('headmaster_name', 'like', "%{$searchTerm}%")
              ->orWhere('address', 'like', "%{$searchTerm}%")
              ->orWhere('phone', 'like', "%{$searchTerm}%")
              ->orWhere('email', 'like', "%{$searchTerm}%");
        });
    }

    /**
     * Get institutions by type
     */
    public function getByType(string $type): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('type', $type)
            ->get();
    }

    /**
     * Get institutions by accreditation status
     */
    public function getByAccreditationStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('accreditation_status', $status)
            ->get();
    }

    /**
     * Get active institutions
     */
    public function getActive(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->where('is_active', true)
            ->get();
    }

    /**
     * Get institutions with expiring accreditation
     */
    public function getWithExpiringAccreditation(int $daysBeforeExpiry = 30): \Illuminate\Database\Eloquent\Collection
    {
        $expiryDate = now()->addDays($daysBeforeExpiry);
        
        return $this->getTenantQuery()
            ->where('accreditation_date', '<=', $expiryDate)
            ->where('accreditation_status', '!=', 'expired')
            ->get();
    }

    /**
     * Get institution statistics
     */
    public function getStatistics(): array
    {
        $query = $this->getTenantQuery();
        
        return [
            'total' => $query->count(),
            'active' => $query->where('is_active', true)->count(),
            'inactive' => $query->where('is_active', false)->count(),
            'by_type' => $query->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'by_accreditation' => $query->selectRaw('accreditation_status, COUNT(*) as count')
                ->groupBy('accreditation_status')
                ->pluck('count', 'accreditation_status')
                ->toArray(),
        ];
    }

    /**
     * Check if NPSN exists in current tenant
     */
    public function npsnExists(string $npsn, ?int $excludeId = null): bool
    {
        $query = $this->getTenantQuery()->where('npsn', $npsn);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Get institutions with logo
     */
    public function getWithLogo(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNotNull('logo')
            ->get();
    }

    /**
     * Get institutions without logo
     */
    public function getWithoutLogo(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->whereNull('logo')
            ->get();
    }
}
