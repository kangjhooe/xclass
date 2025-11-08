<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseAnnouncement extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'created_by',
        'title',
        'content',
        'is_important',
        'send_notification',
        'publish_date',
        'expires_at',
    ];

    protected $casts = [
        'is_important' => 'boolean',
        'send_notification' => 'boolean',
        'publish_date' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    // Scopes
    public function scopePublished($query)
    {
        $now = now();
        return $query->where(function($q) use ($now) {
            $q->whereNull('publish_date')->orWhere('publish_date', '<=', $now);
        })->where(function($q) use ($now) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
        });
    }

    public function scopeImportant($query)
    {
        return $query->where('is_important', true);
    }
}

