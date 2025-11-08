<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseResource extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'course_id',
        'instansi_id',
        'title',
        'description',
        'type',
        'file_path',
        'file_name',
        'external_url',
        'category',
        'is_public',
        'download_count',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Helper methods
    public function incrementDownloads()
    {
        $this->increment('download_count');
    }

    public function getFileUrlAttribute()
    {
        if ($this->file_path) {
            return \Storage::url($this->file_path);
        }
        return $this->external_url;
    }
}

