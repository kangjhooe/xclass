<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class EventRegistration extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'event_id',
        'student_id',
        'parent_id',
        'teacher_id',
        'staff_id',
        'registration_date',
        'status',
        'payment_status',
        'payment_amount',
        'payment_receipt',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'registration_date' => 'datetime',
        'payment_status' => 'boolean',
        'payment_amount' => 'decimal:2',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_ATTENDED = 'attended';
    const STATUS_NO_SHOW = 'no_show';

    /**
     * Get the tenant that owns the registration
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the event
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the parent
     */
    public function parent()
    {
        return $this->belongsTo(Parent::class);
    }

    /**
     * Get the teacher
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the staff
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Get the user who created the registration
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the registrant (student, parent, teacher, or staff)
     */
    public function registrant()
    {
        if ($this->student_id) {
            return $this->student();
        } elseif ($this->parent_id) {
            return $this->parent();
        } elseif ($this->teacher_id) {
            return $this->teacher();
        } elseif ($this->staff_id) {
            return $this->staff();
        }
        return null;
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for confirmed registrations
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    /**
     * Scope for filtering by event
     */
    public function scopeByEvent($query, $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu',
            self::STATUS_CONFIRMED => 'Dikonfirmasi',
            self::STATUS_CANCELLED => 'Dibatalkan',
            self::STATUS_ATTENDED => 'Hadir',
            self::STATUS_NO_SHOW => 'Tidak Hadir',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_CONFIRMED => 'success',
            self::STATUS_CANCELLED => 'danger',
            self::STATUS_ATTENDED => 'info',
            self::STATUS_NO_SHOW => 'dark',
            default => 'secondary'
        };
    }

    /**
     * Check if registration is confirmed
     */
    public function isConfirmed()
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    /**
     * Check if registration is cancelled
     */
    public function isCancelled()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if registrant attended
     */
    public function isAttended()
    {
        return $this->status === self::STATUS_ATTENDED;
    }

    /**
     * Get registrant name
     */
    public function getRegistrantNameAttribute()
    {
        if ($this->student) {
            return $this->student->name;
        } elseif ($this->parent) {
            return $this->parent->name;
        } elseif ($this->teacher) {
            return $this->teacher->name;
        } elseif ($this->staff) {
            return $this->staff->name;
        }
        return 'Tidak Diketahui';
    }

    /**
     * Get registrant type
     */
    public function getRegistrantTypeAttribute()
    {
        if ($this->student_id) {
            return 'Siswa';
        } elseif ($this->parent_id) {
            return 'Orang Tua';
        } elseif ($this->teacher_id) {
            return 'Guru';
        } elseif ($this->staff_id) {
            return 'Staf';
        }
        return 'Tidak Diketahui';
    }

    /**
     * Get formatted payment amount
     */
    public function getFormattedPaymentAmountAttribute()
    {
        if ($this->payment_amount > 0) {
            return 'Rp ' . number_format($this->payment_amount, 0, ',', '.');
        }
        return 'Gratis';
    }

    /**
     * Confirm registration
     */
    public function confirm()
    {
        $this->update(['status' => self::STATUS_CONFIRMED]);
    }

    /**
     * Cancel registration
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'notes' => $reason,
        ]);
    }

    /**
     * Mark as attended
     */
    public function markAttended()
    {
        $this->update(['status' => self::STATUS_ATTENDED]);
    }

    /**
     * Mark as no show
     */
    public function markNoShow()
    {
        $this->update(['status' => self::STATUS_NO_SHOW]);
    }

    /**
     * Mark payment as completed
     */
    public function markPaymentCompleted($amount = null, $receipt = null)
    {
        $this->update([
            'payment_status' => true,
            'payment_amount' => $amount ?? $this->payment_amount,
            'payment_receipt' => $receipt,
        ]);
    }
}
