<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseForumPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'forum_id',
        'parent_id',
        'user_id',
        'student_id',
        'teacher_id',
        'title',
        'content',
        'attachments',
        'is_pinned',
        'is_locked',
        'views_count',
        'replies_count',
        'last_reply_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
        'last_reply_at' => 'datetime',
    ];

    // Relationships
    public function forum()
    {
        return $this->belongsTo(CourseForum::class);
    }

    public function parent()
    {
        return $this->belongsTo(CourseForumPost::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(CourseForumPost::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function student()
    {
        return $this->belongsTo(\App\Models\Tenant\Student::class);
    }

    public function teacher()
    {
        return $this->belongsTo(\App\Models\Tenant\Teacher::class);
    }

    // Helper methods
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function updateRepliesCount()
    {
        $this->update([
            'replies_count' => $this->replies()->count(),
            'last_reply_at' => $this->replies()->latest()->first()?->created_at ?? now(),
        ]);
    }
}

