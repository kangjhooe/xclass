<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Book extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'isbn',
        'title',
        'author',
        'publisher',
        'publication_year',
        'category',
        'subcategory',
        'language',
        'pages',
        'description',
        'cover_image',
        'total_copies',
        'available_copies',
        'location',
        'shelf_number',
        'price',
        'status',
        'condition',
        'purchase_date',
        'purchase_price',
        'donor',
        'notes',
        'is_online',
        'pdf_file',
        'pdf_file_name',
        'pdf_file_size',
        'is_public',
        'allow_download',
        'view_count',
        'download_count',
        'published_at',
    ];

    protected $casts = [
        'publication_year' => 'integer',
        'pages' => 'integer',
        'total_copies' => 'integer',
        'available_copies' => 'integer',
        'price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'purchase_date' => 'date',
        'is_online' => 'boolean',
        'is_public' => 'boolean',
        'allow_download' => 'boolean',
        'view_count' => 'integer',
        'download_count' => 'integer',
        'pdf_file_size' => 'integer',
        'published_at' => 'datetime',
    ];

    const STATUS_AVAILABLE = 'available';
    const STATUS_UNAVAILABLE = 'unavailable';
    const STATUS_MAINTENANCE = 'maintenance';
    const STATUS_LOST = 'lost';
    const STATUS_DAMAGED = 'damaged';

    const CONDITION_EXCELLENT = 'excellent';
    const CONDITION_GOOD = 'good';
    const CONDITION_FAIR = 'fair';
    const CONDITION_POOR = 'poor';

    /**
     * Get the tenant that owns the book
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get book loans
     */
    public function loans()
    {
        return $this->hasMany(BookLoan::class);
    }

    /**
     * Get active loans
     */
    public function activeLoans()
    {
        return $this->loans()->where('status', BookLoan::STATUS_ACTIVE);
    }

    /**
     * Get book reviews
     */
    public function reviews()
    {
        return $this->hasMany(BookReview::class);
    }

    /**
     * Get book readings (online reading progress)
     */
    public function readings()
    {
        return $this->hasMany(BookReading::class);
    }

    /**
     * Get reading for specific user
     */
    public function readingForUser($userId = null)
    {
        $query = $this->readings();
        
        if ($userId) {
            $query->where('user_id', $userId);
        } elseif (auth()->check()) {
            $query->where('user_id', auth()->id());
        }
        
        return $query->first();
    }

    /**
     * Increment view count
     */
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    /**
     * Increment download count
     */
    public function incrementDownloadCount()
    {
        $this->increment('download_count');
    }

    /**
     * Check if book has PDF
     */
    public function hasPdf()
    {
        if (!$this->is_online || !$this->pdf_file) {
            return false;
        }
        
        $filePath = storage_path('app/public/' . $this->pdf_file);
        return file_exists($filePath);
    }

    /**
     * Get PDF URL
     */
    public function getPdfUrlAttribute()
    {
        if ($this->hasPdf()) {
            return asset('storage/' . $this->pdf_file);
        }
        return null;
    }

    /**
     * Get formatted file size
     */
    public function getFormattedFileSizeAttribute()
    {
        if (!$this->pdf_file_size) {
            return 'N/A';
        }
        
        $bytes = $this->pdf_file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $unit = 0;
        
        while ($bytes >= 1024 && $unit < count($units) - 1) {
            $bytes /= 1024;
            $unit++;
        }
        
        return round($bytes, 2) . ' ' . $units[$unit];
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for filtering by author
     */
    public function scopeByAuthor($query, $author)
    {
        return $query->where('author', 'like', "%{$author}%");
    }

    /**
     * Scope for available books
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_AVAILABLE)
                    ->where('available_copies', '>', 0);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_AVAILABLE => 'Tersedia',
            self::STATUS_UNAVAILABLE => 'Tidak Tersedia',
            self::STATUS_MAINTENANCE => 'Perawatan',
            self::STATUS_LOST => 'Hilang',
            self::STATUS_DAMAGED => 'Rusak',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get condition label
     */
    public function getConditionLabelAttribute()
    {
        return match($this->condition) {
            self::CONDITION_EXCELLENT => 'Sangat Baik',
            self::CONDITION_GOOD => 'Baik',
            self::CONDITION_FAIR => 'Cukup',
            self::CONDITION_POOR => 'Buruk',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_AVAILABLE => 'success',
            self::STATUS_UNAVAILABLE => 'secondary',
            self::STATUS_MAINTENANCE => 'warning',
            self::STATUS_LOST => 'danger',
            self::STATUS_DAMAGED => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Get condition color for display
     */
    public function getConditionColorAttribute()
    {
        return match($this->condition) {
            self::CONDITION_EXCELLENT => 'success',
            self::CONDITION_GOOD => 'info',
            self::CONDITION_FAIR => 'warning',
            self::CONDITION_POOR => 'danger',
            default => 'secondary'
        };
    }

    /**
     * Check if book is available for loan
     */
    public function isAvailable()
    {
        return $this->status === self::STATUS_AVAILABLE && $this->available_copies > 0;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted purchase price
     */
    public function getFormattedPurchasePriceAttribute()
    {
        return 'Rp ' . number_format($this->purchase_price, 0, ',', '.');
    }

    /**
     * Get average rating
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    /**
     * Get total reviews count
     */
    public function getTotalReviewsAttribute()
    {
        return $this->reviews()->count();
    }

    /**
     * Update available copies when loan is created/returned
     */
    public function updateAvailableCopies()
    {
        $activeLoans = $this->activeLoans()->count();
        $this->available_copies = $this->total_copies - $activeLoans;
        $this->save();
    }

    /**
     * Get book location string
     */
    public function getLocationStringAttribute()
    {
        return "Rak {$this->shelf_number}, {$this->location}";
    }
}
