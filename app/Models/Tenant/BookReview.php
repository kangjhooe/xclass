<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class BookReview extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'book_id',
        'student_id',
        'teacher_id',
        'staff_id',
        'rating',
        'review',
        'is_anonymous',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_anonymous' => 'boolean',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    const RATING_MIN = 1;
    const RATING_MAX = 5;

    /**
     * Get the tenant that owns the review
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the book being reviewed
     */
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the student who wrote the review
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the teacher who wrote the review
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the staff who wrote the review
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Get the reviewer (student, teacher, or staff)
     */
    public function reviewer()
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
     * Scope for approved reviews
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope for filtering by rating
     */
    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Menunggu',
            self::STATUS_APPROVED => 'Disetujui',
            self::STATUS_REJECTED => 'Ditolak',
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
            self::STATUS_APPROVED => 'success',
            self::STATUS_REJECTED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Get reviewer name
     */
    public function getReviewerNameAttribute()
    {
        if ($this->is_anonymous) {
            return 'Anonim';
        }

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
     * Get reviewer type
     */
    public function getReviewerTypeAttribute()
    {
        if ($this->is_anonymous) {
            return 'Anonim';
        }

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
     * Get star rating display
     */
    public function getStarRatingAttribute()
    {
        $stars = '';
        for ($i = 1; $i <= self::RATING_MAX; $i++) {
            if ($i <= $this->rating) {
                $stars .= '★';
            } else {
                $stars .= '☆';
            }
        }
        return $stars;
    }

    /**
     * Get rating label
     */
    public function getRatingLabelAttribute()
    {
        return match($this->rating) {
            1 => 'Sangat Buruk',
            2 => 'Buruk',
            3 => 'Cukup',
            4 => 'Baik',
            5 => 'Sangat Baik',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Check if review is approved
     */
    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if review is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Approve review
     */
    public function approve()
    {
        $this->update(['status' => self::STATUS_APPROVED]);
    }

    /**
     * Reject review
     */
    public function reject()
    {
        $this->update(['status' => self::STATUS_REJECTED]);
    }

    /**
     * Get truncated review text
     */
    public function getTruncatedReviewAttribute()
    {
        return strlen($this->review) > 100 ? 
            substr($this->review, 0, 100) . '...' : 
            $this->review;
    }
}
