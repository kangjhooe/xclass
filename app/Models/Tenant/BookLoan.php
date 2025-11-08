<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;
use Carbon\Carbon;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Staff;

class BookLoan extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'book_id',
        'student_id',
        'teacher_id',
        'staff_id',
        'loan_date',
        'due_date',
        'return_date',
        'status',
        'loan_notes',
        'return_notes',
        'fine_amount',
        'fine_paid',
        'fine_paid_date',
        'created_by',
        'returned_by',
    ];

    protected $casts = [
        'loan_date' => 'datetime',
        'due_date' => 'date',
        'return_date' => 'datetime',
        'fine_paid_date' => 'datetime',
        'fine_amount' => 'decimal:2',
        'fine_paid' => 'boolean',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_RETURNED = 'returned';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_LOST = 'lost';
    const STATUS_DAMAGED = 'damaged';

    /**
     * Get the tenant that owns the loan
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the book that was loaned
     */
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the student who borrowed the book
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the teacher who borrowed the book
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the staff who borrowed the book
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Get the user who created the loan
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get the user who processed the return
     */
    public function returner()
    {
        return $this->belongsTo(\App\Models\User::class, 'returned_by');
    }

    /**
     * Get the borrower (student, teacher, or staff)
     */
    public function borrower()
    {
        if ($this->student_id) {
            return $this->student();
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
     * Scope for active loans
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for overdue loans
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
                    ->where('due_date', '<', now()->toDateString());
    }

    /**
     * Scope for loans by borrower
     */
    public function scopeByBorrower($query, $type, $id)
    {
        return $query->where("{$type}_id", $id);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Aktif',
            self::STATUS_RETURNED => 'Dikembalikan',
            self::STATUS_OVERDUE => 'Terlambat',
            self::STATUS_LOST => 'Hilang',
            self::STATUS_DAMAGED => 'Rusak',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'primary',
            self::STATUS_RETURNED => 'success',
            self::STATUS_OVERDUE => 'danger',
            self::STATUS_LOST => 'dark',
            self::STATUS_DAMAGED => 'warning',
            default => 'secondary'
        };
    }

    /**
     * Check if loan is overdue
     */
    public function isOverdue()
    {
        return $this->status === self::STATUS_ACTIVE && 
               $this->due_date < now()->toDateString();
    }

    /**
     * Check if loan is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Get borrower name
     */
    public function getBorrowerNameAttribute()
    {
        if ($this->student) {
            return $this->student->name;
        } elseif ($this->teacher) {
            return $this->teacher->name;
        } elseif ($this->staff) {
            return $this->staff->name;
        }
        return 'Tidak Diketahui';
    }

    /**
     * Get borrower type
     */
    public function getBorrowerTypeAttribute()
    {
        if ($this->student_id) {
            return 'Siswa';
        } elseif ($this->teacher_id) {
            return 'Guru';
        } elseif ($this->staff_id) {
            return 'Staf';
        }
        return 'Tidak Diketahui';
    }

    /**
     * Get loan duration in days
     */
    public function getLoanDurationAttribute()
    {
        if ($this->return_date) {
            return $this->loan_date->diffInDays($this->return_date);
        }
        return $this->loan_date->diffInDays(now());
    }

    /**
     * Get days overdue
     */
    public function getDaysOverdueAttribute()
    {
        if ($this->isOverdue()) {
            return $this->due_date->diffInDays(now());
        }
        return 0;
    }

    /**
     * Calculate fine amount
     */
    public function calculateFine($finePerDay = 1000)
    {
        if ($this->isOverdue()) {
            return $this->days_overdue * $finePerDay;
        }
        return 0;
    }

    /**
     * Mark loan as returned
     */
    public function markAsReturned($returnedBy, $notes = null)
    {
        $this->update([
            'status' => self::STATUS_RETURNED,
            'return_date' => now(),
            'returned_by' => $returnedBy,
            'return_notes' => $notes,
        ]);

        // Update book available copies
        $this->book->updateAvailableCopies();
    }

    /**
     * Mark loan as overdue
     */
    public function markAsOverdue()
    {
        if ($this->isOverdue()) {
            $this->update(['status' => self::STATUS_OVERDUE]);
        }
    }

    /**
     * Mark loan as lost
     */
    public function markAsLost($notes = null)
    {
        $this->update([
            'status' => self::STATUS_LOST,
            'return_notes' => $notes,
        ]);

        // Update book available copies
        $this->book->updateAvailableCopies();
    }

    /**
     * Mark loan as damaged
     */
    public function markAsDamaged($notes = null)
    {
        $this->update([
            'status' => self::STATUS_DAMAGED,
            'return_notes' => $notes,
        ]);

        // Update book available copies
        $this->book->updateAvailableCopies();
    }

    /**
     * Pay fine
     */
    public function payFine($amount, $paidBy)
    {
        $this->update([
            'fine_paid' => true,
            'fine_paid_date' => now(),
        ]);
    }

    /**
     * Get formatted fine amount
     */
    public function getFormattedFineAmountAttribute()
    {
        return 'Rp ' . number_format($this->fine_amount, 0, ',', '.');
    }
}
