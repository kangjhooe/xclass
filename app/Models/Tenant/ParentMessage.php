<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ParentMessage extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'parent_id',
        'student_id',
        'sender_id',
        'subject',
        'message',
        'type',
        'priority',
        'is_read',
        'read_at',
        'replied_at',
        'reply_to',
        'attachments',
        'created_by',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'replied_at' => 'datetime',
        'attachments' => 'array',
    ];

    const TYPE_GENERAL = 'general';
    const TYPE_ACADEMIC = 'academic';
    const TYPE_ATTENDANCE = 'attendance';
    const TYPE_BEHAVIOR = 'behavior';
    const TYPE_PAYMENT = 'payment';
    const TYPE_EVENT = 'event';
    const TYPE_EMERGENCY = 'emergency';

    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    /**
     * Get the tenant that owns the message
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the parent
     */
    public function parent()
    {
        return $this->belongsTo(Parent::class);
    }

    /**
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the sender
     */
    public function sender()
    {
        return $this->belongsTo(\App\Models\User::class, 'sender_id');
    }

    /**
     * Get the user who created the message
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get replies to this message
     */
    public function replies()
    {
        return $this->hasMany(ParentMessage::class, 'reply_to');
    }

    /**
     * Get the original message if this is a reply
     */
    public function originalMessage()
    {
        return $this->belongsTo(ParentMessage::class, 'reply_to');
    }

    /**
     * Scope for filtering by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for filtering by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for unread messages
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for read messages
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope for original messages (not replies)
     */
    public function scopeOriginal($query)
    {
        return $query->whereNull('reply_to');
    }

    /**
     * Scope for replies
     */
    public function scopeReplies($query)
    {
        return $query->whereNotNull('reply_to');
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->type) {
            self::TYPE_GENERAL => 'Umum',
            self::TYPE_ACADEMIC => 'Akademik',
            self::TYPE_ATTENDANCE => 'Kehadiran',
            self::TYPE_BEHAVIOR => 'Perilaku',
            self::TYPE_PAYMENT => 'Pembayaran',
            self::TYPE_EVENT => 'Acara',
            self::TYPE_EMERGENCY => 'Darurat',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get priority label
     */
    public function getPriorityLabelAttribute()
    {
        return match($this->priority) {
            self::PRIORITY_LOW => 'Rendah',
            self::PRIORITY_MEDIUM => 'Sedang',
            self::PRIORITY_HIGH => 'Tinggi',
            self::PRIORITY_URGENT => 'Mendesak',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get type color for display
     */
    public function getTypeColorAttribute()
    {
        return match($this->type) {
            self::TYPE_GENERAL => 'secondary',
            self::TYPE_ACADEMIC => 'info',
            self::TYPE_ATTENDANCE => 'warning',
            self::TYPE_BEHAVIOR => 'danger',
            self::TYPE_PAYMENT => 'success',
            self::TYPE_EVENT => 'pink',
            self::TYPE_EMERGENCY => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Get priority color for display
     */
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            self::PRIORITY_LOW => 'success',
            self::PRIORITY_MEDIUM => 'info',
            self::PRIORITY_HIGH => 'warning',
            self::PRIORITY_URGENT => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if message is read
     */
    public function isRead()
    {
        return $this->is_read;
    }

    /**
     * Check if message is unread
     */
    public function isUnread()
    {
        return !$this->is_read;
    }

    /**
     * Check if message is a reply
     */
    public function isReply()
    {
        return !is_null($this->reply_to);
    }

    /**
     * Check if message has replies
     */
    public function hasReplies()
    {
        return $this->replies()->count() > 0;
    }

    /**
     * Get total replies count
     */
    public function getRepliesCountAttribute()
    {
        return $this->replies()->count();
    }

    /**
     * Get formatted message preview
     */
    public function getPreviewAttribute()
    {
        return strlen($this->message) > 100 ? 
            substr($this->message, 0, 100) . '...' : 
            $this->message;
    }

    /**
     * Mark as read
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Mark as unread
     */
    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Mark as replied
     */
    public function markAsReplied()
    {
        $this->update(['replied_at' => now()]);
    }

    /**
     * Create a reply to this message
     */
    public function createReply($data)
    {
        $data['reply_to'] = $this->id;
        $data['instansi_id'] = $this->instansi_id;
        $data['parent_id'] = $this->parent_id;
        $data['student_id'] = $this->student_id;
        
        return self::create($data);
    }
}
