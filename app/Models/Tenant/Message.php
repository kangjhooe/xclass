<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\User;

class Message extends Model
{
    use HasFactory, HasNpsn, HasInstansi;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'subject',
        'content',
        'type',
        'priority',
        'is_read',
        'read_at',
        'is_archived',
        'archived_at',
        'parent_id',
        'attachments',
        'is_active',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
        'attachments' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the sender of the message
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the receiver of the message
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Get the parent message (for replies)
     */
    public function parent()
    {
        return $this->belongsTo(Message::class, 'parent_id');
    }

    /**
     * Get the replies to this message
     */
    public function replies()
    {
        return $this->hasMany(Message::class, 'parent_id');
    }

    /**
     * Get the tenant (instansi) for this message
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Mark message as read
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Mark message as unread
     */
    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Archive message
     */
    public function archive()
    {
        $this->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);
    }

    /**
     * Unarchive message
     */
    public function unarchive()
    {
        $this->update([
            'is_archived' => false,
            'archived_at' => null,
        ]);
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
     * Get type color
     */
    public function getTypeColorAttribute(): string
    {
        return match($this->type) {
            'direct' => 'primary',
            'group' => 'success',
            'broadcast' => 'warning',
            default => 'secondary',
        };
    }

    /**
     * Check if message is unread
     */
    public function isUnread(): bool
    {
        return !$this->is_read;
    }

    /**
     * Check if message is archived
     */
    public function isArchived(): bool
    {
        return $this->is_archived;
    }

    /**
     * Get message preview (first 100 characters)
     */
    public function getPreviewAttribute(): string
    {
        return strlen($this->content) > 100 
            ? substr($this->content, 0, 100) . '...' 
            : $this->content;
    }
}
