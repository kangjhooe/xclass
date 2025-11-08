<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class ParentNotification extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'parent_id',
        'student_id',
        'title',
        'message',
        'type',
        'priority',
        'is_read',
        'read_at',
        'sent_at',
        'created_by',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    const TYPE_ACADEMIC = 'academic';
    const TYPE_ATTENDANCE = 'attendance';
    const TYPE_BEHAVIOR = 'behavior';
    const TYPE_ANNOUNCEMENT = 'announcement';
    const TYPE_PAYMENT = 'payment';
    const TYPE_EVENT = 'event';
    const TYPE_EMERGENCY = 'emergency';

    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    /**
     * Get the tenant that owns the notification
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
     * Get the user who created the notification
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
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
     * Scope for unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for read notifications
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->type) {
            self::TYPE_ACADEMIC => 'Akademik',
            self::TYPE_ATTENDANCE => 'Kehadiran',
            self::TYPE_BEHAVIOR => 'Perilaku',
            self::TYPE_ANNOUNCEMENT => 'Pengumuman',
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
            self::TYPE_ACADEMIC => 'info',
            self::TYPE_ATTENDANCE => 'warning',
            self::TYPE_BEHAVIOR => 'danger',
            self::TYPE_ANNOUNCEMENT => 'primary',
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
     * Check if notification is read
     */
    public function isRead()
    {
        return $this->is_read;
    }

    /**
     * Check if notification is unread
     */
    public function isUnread()
    {
        return !$this->is_read;
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
     * Mark as sent
     */
    public function markAsSent()
    {
        $this->update(['sent_at' => now()]);
    }
}
