<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Event extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'title',
        'description',
        'event_type',
        'category',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'venue',
        'location',
        'organizer',
        'target_audience',
        'max_participants',
        'registration_required',
        'registration_deadline',
        'cost',
        'status',
        'is_public',
        'images',
        'attachments',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'registration_deadline' => 'datetime',
        'registration_required' => 'boolean',
        'is_public' => 'boolean',
        'cost' => 'decimal:2',
        'max_participants' => 'integer',
        'images' => 'array',
        'attachments' => 'array',
        'target_audience' => 'array',
    ];

    const TYPE_ACADEMIC = 'academic';
    const TYPE_SOCIAL = 'social';
    const TYPE_SPORTS = 'sports';
    const TYPE_CULTURAL = 'cultural';
    const TYPE_RELIGIOUS = 'religious';
    const TYPE_MEETING = 'meeting';
    const TYPE_CEREMONY = 'ceremony';

    const CATEGORY_SCHOOL = 'school';
    const CATEGORY_CLASS = 'class';
    const CATEGORY_GRADE = 'grade';
    const CATEGORY_EXTRACURRICULAR = 'extracurricular';
    const CATEGORY_PARENT = 'parent';
    const CATEGORY_TEACHER = 'teacher';
    const CATEGORY_STUDENT = 'student';

    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';
    const STATUS_ONGOING = 'ongoing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the tenant that owns the event
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get event registrations
     */
    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    /**
     * Get the user who created the event
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
        return $query->where('event_type', $type);
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for public events
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for upcoming events
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>=', now()->toDateString())
                    ->whereIn('status', [self::STATUS_PUBLISHED, self::STATUS_ONGOING]);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return match($this->event_type) {
            self::TYPE_ACADEMIC => 'Akademik',
            self::TYPE_SOCIAL => 'Sosial',
            self::TYPE_SPORTS => 'Olahraga',
            self::TYPE_CULTURAL => 'Budaya',
            self::TYPE_RELIGIOUS => 'Keagamaan',
            self::TYPE_MEETING => 'Rapat',
            self::TYPE_CEREMONY => 'Upacara',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute()
    {
        return match($this->category) {
            self::CATEGORY_SCHOOL => 'Sekolah',
            self::CATEGORY_CLASS => 'Kelas',
            self::CATEGORY_GRADE => 'Tingkat',
            self::CATEGORY_EXTRACURRICULAR => 'Ekstrakurikuler',
            self::CATEGORY_PARENT => 'Orang Tua',
            self::CATEGORY_TEACHER => 'Guru',
            self::CATEGORY_STUDENT => 'Siswa',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_PUBLISHED => 'Dipublikasikan',
            self::STATUS_ONGOING => 'Sedang Berlangsung',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get type color for display
     */
    public function getTypeColorAttribute()
    {
        return match($this->event_type) {
            self::TYPE_ACADEMIC => 'info',
            self::TYPE_SOCIAL => 'primary',
            self::TYPE_SPORTS => 'success',
            self::TYPE_CULTURAL => 'pink',
            self::TYPE_RELIGIOUS => 'warning',
            self::TYPE_MEETING => 'secondary',
            self::TYPE_CEREMONY => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'secondary',
            self::STATUS_PUBLISHED => 'info',
            self::STATUS_ONGOING => 'warning',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if event is upcoming
     */
    public function isUpcoming()
    {
        return $this->start_date >= now()->toDateString() && 
               in_array($this->status, [self::STATUS_PUBLISHED, self::STATUS_ONGOING]);
    }

    /**
     * Check if event is ongoing
     */
    public function isOngoing()
    {
        return $this->status === self::STATUS_ONGOING;
    }

    /**
     * Check if event is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if registration is open
     */
    public function isRegistrationOpen()
    {
        if (!$this->registration_required) {
            return false;
        }

        if (!$this->registration_deadline) {
            return $this->isUpcoming();
        }

        return now() <= $this->registration_deadline && $this->isUpcoming();
    }

    /**
     * Get formatted cost
     */
    public function getFormattedCostAttribute()
    {
        if ($this->cost > 0) {
            return 'Rp ' . number_format($this->cost, 0, ',', '.');
        }
        return 'Gratis';
    }

    /**
     * Get formatted date range
     */
    public function getFormattedDateRangeAttribute()
    {
        if ($this->start_date->isSameDay($this->end_date)) {
            return $this->start_date->format('d M Y');
        }
        return $this->start_date->format('d M Y') . ' - ' . $this->end_date->format('d M Y');
    }

    /**
     * Get formatted time range
     */
    public function getFormattedTimeRangeAttribute()
    {
        if ($this->start_time && $this->end_time) {
            return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
        }
        return 'Waktu belum ditentukan';
    }

    /**
     * Get registration statistics
     */
    public function getRegistrationStatsAttribute()
    {
        $totalRegistrations = $this->registrations()->count();
        $confirmedRegistrations = $this->registrations()->where('status', EventRegistration::STATUS_CONFIRMED)->count();
        
        return [
            'total_registrations' => $totalRegistrations,
            'confirmed_registrations' => $confirmedRegistrations,
            'available_slots' => $this->max_participants ? max(0, $this->max_participants - $confirmedRegistrations) : null,
            'is_full' => $this->max_participants ? $confirmedRegistrations >= $this->max_participants : false,
        ];
    }

    /**
     * Publish event
     */
    public function publish()
    {
        $this->update(['status' => self::STATUS_PUBLISHED]);
    }

    /**
     * Start event
     */
    public function start()
    {
        $this->update(['status' => self::STATUS_ONGOING]);
    }

    /**
     * Complete event
     */
    public function complete()
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Cancel event
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $reason,
        ]);
    }
}
