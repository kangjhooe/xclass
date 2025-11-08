<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Parent extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'name',
        'email',
        'phone',
        'relationship',
        'occupation',
        'address',
        'city',
        'province',
        'postal_code',
        'emergency_contact',
        'emergency_phone',
        'status',
        'last_login',
        'notes',
    ];

    protected $casts = [
        'last_login' => 'datetime',
    ];

    const RELATIONSHIP_FATHER = 'father';
    const RELATIONSHIP_MOTHER = 'mother';
    const RELATIONSHIP_GUARDIAN = 'guardian';
    const RELATIONSHIP_GRANDPARENT = 'grandparent';
    const RELATIONSHIP_SIBLING = 'sibling';
    const RELATIONSHIP_OTHER = 'other';

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_SUSPENDED = 'suspended';

    /**
     * Get the tenant that owns the parent
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get students (children)
     */
    public function students()
    {
        return $this->belongsToMany(Student::class, 'parent_students', 'parent_id', 'student_id')
                    ->withPivot('relationship', 'is_primary', 'created_at')
                    ->withTimestamps();
    }

    /**
     * Get primary students
     */
    public function primaryStudents()
    {
        return $this->students()->wherePivot('is_primary', true);
    }

    /**
     * Get parent notifications
     */
    public function notifications()
    {
        return $this->hasMany(ParentNotification::class);
    }

    /**
     * Get parent messages
     */
    public function messages()
    {
        return $this->hasMany(ParentMessage::class);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for active parents
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for filtering by relationship
     */
    public function scopeByRelationship($query, $relationship)
    {
        return $query->where('relationship', $relationship);
    }

    /**
     * Get relationship label
     */
    public function getRelationshipLabelAttribute()
    {
        return match($this->relationship) {
            self::RELATIONSHIP_FATHER => 'Ayah',
            self::RELATIONSHIP_MOTHER => 'Ibu',
            self::RELATIONSHIP_GUARDIAN => 'Wali',
            self::RELATIONSHIP_GRANDPARENT => 'Kakek/Nenek',
            self::RELATIONSHIP_SIBLING => 'Saudara',
            self::RELATIONSHIP_OTHER => 'Lainnya',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Aktif',
            self::STATUS_INACTIVE => 'Tidak Aktif',
            self::STATUS_SUSPENDED => 'Ditangguhkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'success',
            self::STATUS_INACTIVE => 'secondary',
            self::STATUS_SUSPENDED => 'warning',
            default => 'secondary'
        };
    }

    /**
     * Check if parent is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Get total children count
     */
    public function getTotalChildrenAttribute()
    {
        return $this->students()->count();
    }

    /**
     * Get primary children count
     */
    public function getPrimaryChildrenCountAttribute()
    {
        return $this->primaryStudents()->count();
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadNotificationsCountAttribute()
    {
        return $this->notifications()->where('is_read', false)->count();
    }

    /**
     * Get unread messages count
     */
    public function getUnreadMessagesCountAttribute()
    {
        return $this->messages()->where('is_read', false)->count();
    }

    /**
     * Add student relationship
     */
    public function addStudent($studentId, $relationship = null, $isPrimary = false)
    {
        $this->students()->attach($studentId, [
            'relationship' => $relationship ?? $this->relationship,
            'is_primary' => $isPrimary,
        ]);
    }

    /**
     * Remove student relationship
     */
    public function removeStudent($studentId)
    {
        $this->students()->detach($studentId);
    }

    /**
     * Set primary student
     */
    public function setPrimaryStudent($studentId)
    {
        // Remove primary status from all students
        $this->students()->updateExistingPivot($this->students->pluck('id')->toArray(), [
            'is_primary' => false
        ]);

        // Set new primary student
        $this->students()->updateExistingPivot($studentId, [
            'is_primary' => true
        ]);
    }

    /**
     * Update last login
     */
    public function updateLastLogin()
    {
        $this->update(['last_login' => now()]);
    }
}
