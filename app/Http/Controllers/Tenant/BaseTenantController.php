<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Core\Services\TenantService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Base Tenant Controller
 * 
 * Provides consistent patterns for all tenant controllers:
 * - Authorization checks
 * - Tenant scoping
 * - Error handling
 * - Mass assignment protection
 */
abstract class BaseTenantController extends Controller
{
    use AuthorizesRequests;
    protected TenantService $tenantService;
    protected string $tenantColumn = 'instansi_id';

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Get current tenant
     */
    protected function getCurrentTenant()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
        }

        return $tenant;
    }

    /**
     * Ensure model belongs to current tenant
     */
    protected function ensureTenantAccess(Model $model): void
    {
        $tenant = $this->getCurrentTenant();

        // Check if model has tenant column attribute
        if (!isset($model->{$this->tenantColumn})) {
            Log::warning('Model missing tenant column', [
                'model_type' => get_class($model),
                'model_id' => $model->id ?? null,
                'tenant_column' => $this->tenantColumn,
            ]);
            // For models without tenant column (like Core models), skip check
            return;
        }

        if ($model->{$this->tenantColumn} != $tenant->id) {
            Log::warning('Cross-tenant access attempt detected', [
                'user_id' => auth()->id(),
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'expected_tenant' => $tenant->id,
                'actual_tenant' => $model->{$this->tenantColumn},
            ]);

            abort(403, 'Akses ditolak: Data tidak berada dalam scope tenant saat ini.');
        }
    }

    /**
     * Resolve model with tenant scoping
     * Handles both route model binding and manual lookup
     */
    protected function resolveModel(string $modelClass, $id, array $with = []): Model
    {
        $tenant = $this->getCurrentTenant();

        // If it's already a model instance, just ensure tenant access
        if ($id instanceof Model) {
            $this->ensureTenantAccess($id);
            if (!empty($with)) {
                $id->load($with);
            }
            return $id;
        }

        // Otherwise, query with tenant scope
        $query = $modelClass::where($this->tenantColumn, $tenant->id);

        if (!empty($with)) {
            $query->with($with);
        }

        try {
            return $query->findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Model not found in tenant scope', [
                'model_class' => $modelClass,
                'model_id' => $id,
                'tenant_id' => $tenant->id,
                'user_id' => auth()->id(),
            ]);
            throw $e;
        }
    }

    /**
     * Get only allowed fields from request
     * Prevents mass assignment vulnerability
     */
    protected function getAllowedFields(Request $request, array $allowedFields): array
    {
        return $request->only($allowedFields);
    }

    /**
     * Get validated data from request
     * Uses Laravel's validated() method if available
     */
    protected function getValidatedData(Request $request, array $rules = null): array
    {
        if (method_exists($request, 'validated')) {
            return $request->validated();
        }

        // Fallback to manual validation
        if ($rules) {
            $validated = $request->validate($rules);
            return $validated;
        }

        // If no rules, return empty array (should not happen)
        return [];
    }

    /**
     * Prepare data for model creation with tenant info
     */
    protected function prepareTenantData(array $data): array
    {
        $tenant = $this->getCurrentTenant();

        // Only add tenant column if not already set
        if (!isset($data[$this->tenantColumn])) {
            $data[$this->tenantColumn] = $tenant->id;
        }
        
        // Only add npsn if not already set
        if (!isset($data['npsn'])) {
            $data['npsn'] = $tenant->npsn;
        }

        return $data;
    }

    /**
     * Handle database transaction with proper error handling
     */
    protected function transaction(callable $callback)
    {
        try {
            return DB::transaction($callback);
        } catch (\Exception $e) {
            Log::error('Transaction failed in ' . get_class($this), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle exception and return user-friendly response
     */
    protected function handleException(\Exception $e, string $action = 'operasi'): \Illuminate\Http\RedirectResponse
    {
        Log::error("Error in {$action}", [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'user_id' => auth()->id(),
        ]);

        // In production, don't expose detailed error messages
        if (config('app.debug')) {
            $message = "Terjadi kesalahan saat {$action}: " . $e->getMessage();
        } else {
            $message = "Terjadi kesalahan saat {$action}. Silakan coba lagi atau hubungi administrator.";
        }

        return redirect()->back()
            ->with('error', $message)
            ->withInput();
    }

    /**
     * Check if model has related records before deletion
     */
    protected function checkRelationsBeforeDelete(Model $model, array $relations): array
    {
        $issues = [];

        foreach ($relations as $relation => $message) {
            if (is_numeric($relation)) {
                // Simple relation name
                $relation = $message;
                $message = "Masih memiliki relasi {$relation}";
            }

            try {
                // Check if relation method exists
                if (method_exists($model, $relation)) {
                    $count = $model->{$relation}()->count();
                    if ($count > 0) {
                        $issues[] = str_replace(':count', $count, $message);
                    }
                }
            } catch (\Exception $e) {
                // Relation doesn't exist or error, skip
                Log::debug('Error checking relation before delete', [
                    'model' => get_class($model),
                    'relation' => $relation,
                    'error' => $e->getMessage(),
                ]);
                continue;
            }
        }

        return $issues;
    }
}

