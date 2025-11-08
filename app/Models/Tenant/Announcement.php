<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\User;

class Announcement extends Model
{
    use HasFactory, HasNpsn, HasInstansi;

    protected $fillable = [
        'author_id',
        'title',
        'content',
        'priority',
        'status',
        'target_audience',
        'publish_at',
        'is_active',
    ];

    protected $casts = [
        'target_audience' => 'array',
        'publish_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the author of the announcement
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get the tenant (instansi) for this announcement
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Check if announcement is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->publish_at <= now();
    }

    /**
     * Check if announcement is draft
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if announcement is archived
     */
    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    /**
     * Get priority color
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'urgent' => 'danger',
            'high' => 'warning',
            'medium' => 'info',
            'low' => 'secondary',
            default => 'secondary',
        };
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'published' => 'success',
            'draft' => 'warning',
            'archived' => 'secondary',
            default => 'secondary',
        };
    }
}
