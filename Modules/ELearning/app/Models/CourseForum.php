<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseForum extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'is_locked',
        'is_pinned',
        'order',
    ];

    protected $casts = [
        'is_locked' => 'boolean',
        'is_pinned' => 'boolean',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function posts()
    {
        return $this->hasMany(CourseForumPost::class, 'forum_id')
            ->whereNull('parent_id')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc');
    }

    public function allPosts()
    {
        return $this->hasMany(CourseForumPost::class, 'forum_id');
    }

    // Scopes
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeUnlocked($query)
    {
        return $query->where('is_locked', false);
    }
}

