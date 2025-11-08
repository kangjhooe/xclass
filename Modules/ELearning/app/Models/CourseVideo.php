<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseVideo extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'source',
        'video_url',
        'video_id',
        'file_path',
        'duration_seconds',
        'thumbnail',
        'allow_download',
        'has_subtitle',
        'subtitle_file',
        'order',
        'chapter',
        'is_published',
        'publish_date',
    ];

    protected $casts = [
        'allow_download' => 'boolean',
        'has_subtitle' => 'boolean',
        'is_published' => 'boolean',
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

    // Helper methods
    public function getVideoEmbedUrlAttribute()
    {
        if ($this->source === 'youtube' && $this->video_id) {
            return "https://www.youtube.com/embed/{$this->video_id}";
        }
        if ($this->source === 'vimeo' && $this->video_id) {
            return "https://player.vimeo.com/video/{$this->video_id}";
        }
        return $this->video_url;
    }

    public function getFormattedDurationAttribute()
    {
        if (!$this->duration_seconds) return null;
        
        $hours = floor($this->duration_seconds / 3600);
        $minutes = floor(($this->duration_seconds % 3600) / 60);
        $seconds = $this->duration_seconds % 60;
        
        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }
        return sprintf('%d:%02d', $minutes, $seconds);
    }
}

