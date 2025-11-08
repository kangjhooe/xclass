<?php

namespace Modules\PublicPage\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class News extends Model
{
    use HasFactory;

    protected $fillable = [
        'instansi_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'featured_image',
        'author',
        'status',
        'published_at',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'is_featured',
        'view_count',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
        'view_count' => 'integer',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($news) {
            if (empty($news->slug)) {
                $news->slug = Str::slug($news->title);
            }
        });
    }

    /**
     * Get the tenant that owns the news
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the featured image URL
     */
    public function getFeaturedImageUrlAttribute()
    {
        if ($this->featured_image) {
            return asset('storage/' . $this->featured_image);
        }
        
        return asset('images/default-news.jpg');
    }

    /**
     * Get the excerpt or truncated content
     */
    public function getExcerptAttribute($value)
    {
        if ($value) {
            return $value;
        }
        
        return Str::limit(strip_tags($this->content), 150);
    }

    /**
     * Get the URL for the news
     */
    public function getUrlAttribute()
    {
        return tenant_route('public.news.show', $this->slug);
    }

    /**
     * Scope for published news
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    /**
     * Scope for featured news
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for active news
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope for recent news
     */
    public function scopeRecent($query, $limit = 5)
    {
        return $query->orderBy('published_at', 'desc')->limit($limit);
    }

    /**
     * Increment view count
     */
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    /**
     * Get formatted published date
     */
    public function getFormattedPublishedDateAttribute()
    {
        return $this->published_at ? $this->published_at->format('d-m-Y') : null;
    }

    /**
     * Get reading time estimate
     */
    public function getReadingTimeAttribute()
    {
        $wordCount = str_word_count(strip_tags($this->content));
        $minutes = ceil($wordCount / 200); // Average reading speed: 200 words per minute
        
        return $minutes . ' menit';
    }

    /**
     * Scope for draft news
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope for archived news
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    /**
     * Scope for news by author
     */
    public function scopeByAuthor($query, $author)
    {
        return $query->where('author', 'like', '%' . $author . '%');
    }

    /**
     * Scope for news by date range
     */
    public function scopeDateRange($query, $from, $to)
    {
        if ($from) {
            $query->whereDate('published_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('published_at', '<=', $to);
        }
        return $query;
    }

    /**
     * Scope for popular news (by views)
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->orderBy('view_count', 'desc')->limit($limit);
    }

    /**
     * Check if news is published
     */
    public function isPublished()
    {
        return $this->status === 'published' && 
               $this->published_at && 
               $this->published_at <= now();
    }

    /**
     * Check if news is draft
     */
    public function isDraft()
    {
        return $this->status === 'draft';
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute()
    {
        return match($this->status) {
            'published' => 'bg-success',
            'draft' => 'bg-secondary',
            'archived' => 'bg-dark',
            default => 'bg-secondary'
        };
    }

    /**
     * Get formatted created date
     */
    public function getFormattedCreatedDateAttribute()
    {
        return $this->created_at ? $this->created_at->format('d-m-Y') : null;
    }

    /**
     * Get formatted created datetime
     */
    public function getFormattedCreatedDateTimeAttribute()
    {
        return $this->created_at ? $this->created_at->format('d-m-Y H:i') : null;
    }
}
