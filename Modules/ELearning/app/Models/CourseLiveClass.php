<?php

namespace Modules\ELearning\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class CourseLiveClass extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'course_id',
        'instansi_id',
        'title',
        'description',
        'platform',
        'meeting_url',
        'meeting_id',
        'meeting_password',
        'scheduled_at',
        'duration_minutes',
        'record_meeting',
        'recording_url',
        'status',
        'settings',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'record_meeting' => 'boolean',
        'settings' => 'array',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
            ->where('status', 'scheduled');
    }

    public function scopeLive($query)
    {
        return $query->where('status', 'live');
    }

    // Helper methods
    public function isLive()
    {
        if ($this->status !== 'live') return false;
        
        $endTime = $this->scheduled_at->addMinutes($this->duration_minutes);
        return now() >= $this->scheduled_at && now() <= $endTime;
    }

    public function start()
    {
        $this->update(['status' => 'live']);
    }

    public function end()
    {
        $this->update(['status' => 'completed']);
    }
}

