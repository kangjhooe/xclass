<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class BookReading extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'book_id',
        'user_id',
        'reader_type',
        'student_id',
        'last_page',
        'progress_percentage',
        'total_pages_read',
        'last_read_at',
        'started_at',
        'completed_at',
        'is_favorite',
        'bookmark_notes',
        'bookmarks',
        'reading_time_seconds',
    ];

    protected $casts = [
        'last_page' => 'integer',
        'progress_percentage' => 'decimal:2',
        'total_pages_read' => 'integer',
        'last_read_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_favorite' => 'boolean',
        'bookmarks' => 'array',
        'reading_time_seconds' => 'integer',
    ];

    /**
     * Get the book that this reading belongs to
     */
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the user who is reading
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Get the student who is reading
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Update reading progress
     */
    public function updateProgress($page, $totalPages)
    {
        $progress = ($page / $totalPages) * 100;
        
        $this->update([
            'last_page' => $page,
            'progress_percentage' => min(100, max(0, $progress)),
            'total_pages_read' => max($this->total_pages_read, $page),
            'last_read_at' => now(),
        ]);

        if (!$this->started_at) {
            $this->update(['started_at' => now()]);
        }

        // Mark as completed if reached end
        if ($page >= $totalPages && !$this->completed_at) {
            $this->update(['completed_at' => now()]);
        }
    }

    /**
     * Add bookmark
     */
    public function addBookmark($page, $note = null)
    {
        $bookmarks = $this->bookmarks ?? [];
        if (!in_array($page, $bookmarks)) {
            $bookmarks[] = $page;
            $this->update(['bookmarks' => $bookmarks]);
        }
        if ($note) {
            $this->update(['bookmark_notes' => $note]);
        }
    }

    /**
     * Remove bookmark
     */
    public function removeBookmark($page)
    {
        $bookmarks = $this->bookmarks ?? [];
        $bookmarks = array_values(array_filter($bookmarks, fn($p) => $p != $page));
        $this->update(['bookmarks' => $bookmarks]);
    }

    /**
     * Toggle favorite
     */
    public function toggleFavorite()
    {
        $this->update(['is_favorite' => !$this->is_favorite]);
        return $this->is_favorite;
    }

    /**
     * Get formatted reading time
     */
    public function getFormattedReadingTimeAttribute()
    {
        $hours = floor($this->reading_time_seconds / 3600);
        $minutes = floor(($this->reading_time_seconds % 3600) / 60);
        
        if ($hours > 0) {
            return "{$hours} jam {$minutes} menit";
        }
        return "{$minutes} menit";
    }
}
