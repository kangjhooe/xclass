<?php

namespace App\Models\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Trait for models that need audit logging
 * 
 * This trait provides automatic audit logging for CRUD operations
 */
trait HasAuditLog
{
    /**
     * Boot the trait
     */
    protected static function bootHasAuditLog()
    {
        static::created(function (Model $model) {
            static::logActivity($model, 'create');
        });

        static::updated(function (Model $model) {
            static::logActivity($model, 'update');
        });

        static::deleted(function (Model $model) {
            static::logActivity($model, 'delete');
        });
    }

    /**
     * Log activity for the model
     */
    protected static function logActivity(Model $model, string $action, array $additionalData = [])
    {
        // Skip if no authenticated user
        if (!Auth::check()) {
            return;
        }

        // Skip if model doesn't have tenant scope
        if (!method_exists($model, 'getTenantId')) {
            return;
        }

        $changes = [];
        
        if ($action === 'update' && $model->wasChanged()) {
            $changes = static::getModelChanges($model);
        }

        ActivityLog::create([
            'user_id' => Auth::id(),
            'tenant_id' => $model->getTenantId(),
            'model_type' => get_class($model),
            'model_id' => $model->getKey(),
            'action' => $action,
            'changes' => $changes,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'description' => $additionalData['description'] ?? null,
        ]);
    }

    /**
     * Get changes for update action
     */
    protected static function getModelChanges(Model $model): array
    {
        $changes = [];
        $original = $model->getOriginal();
        $dirty = $model->getDirty();

        foreach ($dirty as $key => $value) {
            // Skip timestamps and hidden fields
            if (in_array($key, ['created_at', 'updated_at']) || 
                in_array($key, $model->getHidden())) {
                continue;
            }

            $changes[$key] = [
                'old' => $original[$key] ?? null,
                'new' => $value,
            ];
        }

        return $changes;
    }

    /**
     * Get tenant ID for the model
     */
    protected function getTenantId(): int
    {
        // Try different tenant ID field names
        if (isset($this->instansi_id)) {
            return $this->instansi_id;
        }
        
        if (isset($this->tenant_id)) {
            return $this->tenant_id;
        }

        // Fallback to current tenant from service
        $tenantService = app(\App\Core\Services\TenantService::class);
        return $tenantService->getCurrentTenant()->id;
    }

    /**
     * Get activity logs for this model
     */
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'model', 'model_type', 'model_id');
    }

    /**
     * Get recent activity logs for this model
     */
    public function recentActivityLogs(int $limit = 10)
    {
        return $this->activityLogs()
            ->with('user')
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Manually log an activity
     */
    public function logActivityManually(string $action, array $changes = [], string $description = null)
    {
        static::logActivity($this, $action, [
            'changes' => $changes,
            'description' => $description,
        ]);
    }
}
