<?php

namespace App\Services\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;
use App\Repositories\Tenant\BaseTenantRepository;

/**
 * Base Service for Tenant-scoped entities
 * 
 * This base service provides common functionality for all tenant-scoped services
 * including validation, business logic, and data transformation.
 */
abstract class BaseTenantService
{
    protected BaseTenantRepository $repository;
    protected array $validationRules = [];
    protected array $searchableFields = [];

    public function __construct(BaseTenantRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all records with optional filtering
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->repository->getTenantQuery();

        // Apply filters
        foreach ($filters as $field => $value) {
            if (!empty($value)) {
                $query->where($field, 'like', "%{$value}%");
            }
        }

        return $query->paginate($perPage);
    }

    /**
     * Find record by ID
     */
    public function findById(int $id): ?Model
    {
        return $this->repository->find($id);
    }

    /**
     * Create new record with validation
     */
    public function create(array $data): Model
    {
        $this->validateData($data);
        $this->beforeCreate($data);
        
        $record = $this->repository->create($data);
        
        $this->afterCreate($record, $data);
        
        return $record;
    }

    /**
     * Update record with validation
     */
    public function update(int $id, array $data): Model
    {
        $record = $this->repository->findOrFail($id);
        
        $this->validateData($data, $id);
        $this->beforeUpdate($record, $data);
        
        $record->update($data);
        
        $this->afterUpdate($record, $data);
        
        return $record->fresh();
    }

    /**
     * Delete record
     */
    public function delete(int $id): bool
    {
        $record = $this->repository->findOrFail($id);
        
        $this->beforeDelete($record);
        
        $result = $this->repository->delete($id);
        
        $this->afterDelete($record);
        
        return $result;
    }

    /**
     * Search records
     */
    public function search(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->search($query, $perPage);
    }

    /**
     * Get statistics
     */
    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    /**
     * Validate data using rules
     */
    protected function validateData(array $data, ?int $id = null): void
    {
        $rules = $this->getValidationRules($id);
        
        if (empty($rules)) {
            return;
        }

        $validator = validator($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Get validation rules - to be implemented by child classes
     */
    protected function getValidationRules(?int $id = null): array
    {
        return $this->validationRules;
    }

    /**
     * Hook methods - to be implemented by child classes
     */
    protected function beforeCreate(array &$data): void
    {
        // Override in child classes
    }

    protected function afterCreate(Model $record, array $data): void
    {
        // Override in child classes
    }

    protected function beforeUpdate(Model $record, array &$data): void
    {
        // Override in child classes
    }

    protected function afterUpdate(Model $record, array $data): void
    {
        // Override in child classes
    }

    protected function beforeDelete(Model $record): void
    {
        // Override in child classes
    }

    protected function afterDelete(Model $record): void
    {
        // Override in child classes
    }

    /**
     * Prepare data for export
     */
    public function prepareExportData(array $filters = []): array
    {
        $query = $this->repository->getTenantQuery();

        // Apply filters
        foreach ($filters as $field => $value) {
            if (!empty($value)) {
                $query->where($field, 'like', "%{$value}%");
            }
        }

        return $query->get()->toArray();
    }

    /**
     * Bulk operations
     */
    public function bulkUpdate(array $ids, array $data): int
    {
        $this->validateData($data);
        return $this->repository->bulkUpdate($ids, $data);
    }

    public function bulkDelete(array $ids): int
    {
        return $this->repository->bulkDelete($ids);
    }

    /**
     * Get searchable fields
     */
    public function getSearchableFields(): array
    {
        return $this->searchableFields;
    }

    /**
     * Format data for API response
     */
    public function formatForApi(Model $record): array
    {
        return $record->toArray();
    }

    /**
     * Format data for export
     */
    public function formatForExport(Model $record): array
    {
        return $record->toArray();
    }
}
