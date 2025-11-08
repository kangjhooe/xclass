<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ActivityLog Model
 * 
 * Tracks all CRUD operations on Data Pokok entities for audit purposes
 */
class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tenant_id',
        'model_type',
        'model_id',
        'action',
        'changes',
        'ip_address',
        'user_agent',
        'description',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    /**
     * Get the user who performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tenant where the action was performed
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class);
    }

    /**
     * Get the model that was affected
     */
    public function model()
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }

    /**
     * Scope to filter by tenant
     */
    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Scope to filter by user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by model type
     */
    public function scopeForModel($query, $modelType)
    {
        return $query->where('model_type', $modelType);
    }

    /**
     * Scope to filter by action
     */
    public function scopeForAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get formatted changes for display
     */
    public function getFormattedChangesAttribute(): array
    {
        if (!$this->changes) {
            return [];
        }

        $formatted = [];
        foreach ($this->changes as $field => $change) {
            $formatted[$field] = [
                'old' => $change['old'] ?? null,
                'new' => $change['new'] ?? null,
            ];
        }

        return $formatted;
    }

    /**
     * Get action label in Indonesian
     */
    public function getActionLabelAttribute(): string
    {
        return match($this->action) {
            'create' => 'Membuat',
            'update' => 'Memperbarui',
            'delete' => 'Menghapus',
            'export' => 'Mengekspor',
            'import' => 'Mengimpor',
            default => ucfirst($this->action)
        };
    }

    /**
     * Get model name in Indonesian
     */
    public function getModelNameAttribute(): string
    {
        return match($this->model_type) {
            'App\\Models\\Tenant\\Institution' => 'Lembaga',
            'App\\Models\\Tenant\\Teacher' => 'Guru',
            'App\\Models\\Tenant\\Student' => 'Siswa',
            'App\\Models\\Tenant\\Staff' => 'Staf',
            'App\\Models\\Tenant\\ClassRoom' => 'Kelas',
            default => class_basename($this->model_type)
        };
    }

    /**
     * Get description for the activity
     */
    public function getDescriptionAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        $modelName = $this->model_name;
        $action = $this->action_label;

        return "{$action} data {$modelName}";
    }
}