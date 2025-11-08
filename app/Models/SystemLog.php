<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Core\Tenant;

class SystemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'level',
        'message',
        'context',
        'user_id',
        'tenant_id',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'context' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that performed the action
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tenant related to this log
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get log level badge class
     */
    public function getLevelBadgeClassAttribute(): string
    {
        return match($this->level) {
            'info' => 'badge-info',
            'warning' => 'badge-warning',
            'error' => 'badge-danger',
            'critical' => 'badge-danger',
            'debug' => 'badge-secondary',
            default => 'badge-light'
        };
    }

    /**
     * Get formatted context
     */
    public function getFormattedContextAttribute(): string
    {
        if (empty($this->context)) {
            return '-';
        }

        return json_encode($this->context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}
