<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'content',
        'type',
        'file_path',
        'file_name',
        'file_size',
        'external_url',
        'order',
        'chapter',
        'is_published',
        'allow_download',
        'publish_date',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'allow_download' => 'boolean',
        'publish_date' => 'datetime',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function progress()
    {
        return $this->morphMany(CourseProgress::class, 'progressable');
    }

    public function notes()
    {
        return $this->morphMany(CourseNote::class, 'noteable');
    }

    public function bookmarks()
    {
        return $this->morphMany(CourseBookmark::class, 'bookmarkable');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByChapter($query, $chapter)
    {
        return $query->where('chapter', $chapter);
    }

    // Helper methods
    public function getFileUrlAttribute()
    {
        if ($this->file_path) {
            return \Storage::url($this->file_path);
        }
        return null;
    }
}

