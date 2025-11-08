<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Notification extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'user_id',
        'instansi_id',
        'title',
        'message',
        'link',
        'read_at',
        'type',
        'data',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'data' => 'array',
    ];

    /**
     * Get the user that owns the notification
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tenant that owns the notification
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Scope for unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope for read notifications
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope for notifications by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread()
    {
        $this->update(['read_at' => null]);
    }

    /**
     * Check if notification is read
     */
    public function isRead()
    {
        return !is_null($this->read_at);
    }

    /**
     * Check if notification is unread
     */
    public function isUnread()
    {
        return is_null($this->read_at);
    }

    /**
     * Get notification types
     */
    public static function getTypes()
    {
        return [
            'info' => 'Info',
            'success' => 'Success',
            'warning' => 'Warning',
            'error' => 'Error',
            'letter_incoming' => 'Surat Masuk',
            'letter_outgoing' => 'Surat Keluar',
            'letter_approved' => 'Surat Disetujui',
            'letter_signed' => 'Surat Ditandatangani',
        ];
    }

    /**
     * Create notification for letter events
     */
    public static function createLetterNotification($userId, $instansiId, $type, $title, $message, $link = null, $data = [])
    {
        return self::create([
            'user_id' => $userId,
            'instansi_id' => $instansiId,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'type' => $type,
            'data' => $data,
        ]);
    }
}
