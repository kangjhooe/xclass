<?php

namespace App\Repositories\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Core\Services\TenantService;

/**
 * Base Repository for Tenant-scoped entities
 * 
 * This base repository provides common functionality for all tenant-scoped repositories
 * including automatic tenant filtering, pagination, and search capabilities.
 */
abstract class BaseTenantRepository
{
    protected Model $model;
    protected TenantService $tenantService;
    protected int $currentTenantId;

    public function __construct(Model $model)
    {
        $this->model = $model;
        $this->tenantService = app(TenantService::class);
        $this->currentTenantId = $this->tenantService->getCurrentTenant()->id;
    }

    /**
     * Get query builder with tenant scope applied
     */
    protected function getTenantQuery(): Builder
    {
        return $this->model->where('instansi_id', $this->currentTenantId);
    }

    /**
     * Get all records for current tenant
     */
    public function all(array $columns = ['*']): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()->get($columns);
    }

    /**
     * Find record by ID for current tenant
     */
    public function find(int $id, array $columns = ['*']): ?Model
    {
        return $this->getTenantQuery()->find($id, $columns);
    }

    /**
     * Find record by ID or fail for current tenant
     */
    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        return $this->getTenantQuery()->findOrFail($id, $columns);
    }

    /**
     * Create new record with tenant scope
     */
    public function create(array $data): Model
    {
        $data['instansi_id'] = $this->currentTenantId;
        return $this->model->create($data);
    }

    /**
     * Update record by ID for current tenant
     */
    public function update(int $id, array $data): bool
    {
        $record = $this->findOrFail($id);
        return $record->update($data);
    }

    /**
     * Delete record by ID for current tenant
     */
    public function delete(int $id): bool
    {
        $record = $this->findOrFail($id);
        return $record->delete();
    }

    /**
     * Paginate records for current tenant
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->getTenantQuery()->paginate($perPage, $columns);
    }

    /**
     * Search records with pagination
     */
    public function search(string $query, int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->getTenantQuery()
            ->where(function (Builder $q) use ($query) {
                $this->applySearchConditions($q, $query);
            })
            ->paginate($perPage, $columns);
    }

    /**
     * Get count of records for current tenant
     */
    public function count(): int
    {
        return $this->getTenantQuery()->count();
    }

    /**
     * Get latest records for current tenant
     */
    public function latest(int $limit = 10, array $columns = ['*']): \Illuminate\Database\Eloquent\Collection
    {
        return $this->getTenantQuery()
            ->latest()
            ->limit($limit)
            ->get($columns);
    }

    /**
     * Apply search conditions - to be implemented by child classes
     */
    abstract protected function applySearchConditions(Builder $query, string $searchTerm): void;

    /**
     * Get statistics for dashboard
     */
    public function getStatistics(): array
    {
        return [
            'total' => $this->count(),
            'active' => $this->getTenantQuery()->where('is_active', true)->count(),
            'inactive' => $this->getTenantQuery()->where('is_active', false)->count(),
        ];
    }

    /**
     * Bulk update records
     */
    public function bulkUpdate(array $ids, array $data): int
    {
        return $this->getTenantQuery()
            ->whereIn('id', $ids)
            ->update($data);
    }

    /**
     * Bulk delete records
     */
    public function bulkDelete(array $ids): int
    {
        return $this->getTenantQuery()
            ->whereIn('id', $ids)
            ->delete();
    }
}
