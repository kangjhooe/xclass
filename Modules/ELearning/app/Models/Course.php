<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\HasInstansi;
use Illuminate\Support\Str;

class Course extends Model
{
    use HasFactory, SoftDeletes, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'subject_id',
        'teacher_id',
        'title',
        'slug',
        'description',
        'syllabus',
        'thumbnail',
        'level',
        'category',
        'duration_hours',
        'max_students',
        'is_published',
        'is_featured',
        'status',
        'prerequisite_course_ids',
        'settings',
        'created_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'prerequisite_course_ids' => 'array',
        'settings' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($course) {
            if (empty($course->slug)) {
                $course->slug = Str::slug($course->title);
            }
        });
    }

    // Relationships
    public function subject()
    {
        return $this->belongsTo(\App\Models\Tenant\Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(\App\Models\Tenant\Teacher::class);
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function enrollments()
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function materials()
    {
        return $this->hasMany(CourseMaterial::class)->orderBy('order');
    }

    public function videos()
    {
        return $this->hasMany(CourseVideo::class)->orderBy('order');
    }

    public function assignments()
    {
        return $this->hasMany(CourseAssignment::class);
    }

    public function quizzes()
    {
        return $this->hasMany(CourseQuiz::class);
    }

    public function forums()
    {
        return $this->hasMany(CourseForum::class)->orderBy('order');
    }

    public function announcements()
    {
        return $this->hasMany(CourseAnnouncement::class)->orderBy('created_at', 'desc');
    }

    public function liveClasses()
    {
        return $this->hasMany(CourseLiveClass::class)->orderBy('scheduled_at');
    }

    public function resources()
    {
        return $this->hasMany(CourseResource::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true)->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeForTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    // Helper methods
    public function getTotalEnrollmentsAttribute()
    {
        return $this->enrollments()->where('status', 'enrolled')->count();
    }

    public function getProgressPercentageAttribute()
    {
        // Calculate average progress of all enrolled students
        return $this->enrollments()->avg('progress_percentage') ?? 0;
    }

    public function isEnrolled($studentId)
    {
        return $this->enrollments()->where('student_id', $studentId)->exists();
    }

    public function canEnroll($studentId)
    {
        if ($this->max_students && $this->getTotalEnrollmentsAttribute() >= $this->max_students) {
            return false;
        }
        return !$this->isEnrolled($studentId);
    }
}

