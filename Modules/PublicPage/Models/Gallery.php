<?php

namespace Modules\PublicPage\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'instansi_id',
        'title',
        'description',
        'image',
        'file_path',
        'file_type',
        'file_size',
        'category',
        'tags',
        'is_featured',
        'sort_order',
        'order',
        'status',
        'is_active',
        'alt_text',
        'caption',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the tenant that owns the gallery
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the image URL
     */
    public function getImageUrlAttribute()
    {
        if ($this->file_path) {
            // Check if it's a URL (for videos) or a file path
            if (filter_var($this->file_path, FILTER_VALIDATE_URL)) {
                return $this->file_path;
            }
            return asset('storage/' . $this->file_path);
        }
        
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        
        return asset('images/default-gallery.jpg');
    }

    /**
     * Get the thumbnail URL (assuming thumbnails are stored with _thumb suffix)
     */
    public function getThumbnailUrlAttribute()
    {
        if ($this->image) {
            $pathInfo = pathinfo($this->image);
            $thumbnailPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
            
            if (file_exists(storage_path('app/public/' . $thumbnailPath))) {
                return asset('storage/' . $thumbnailPath);
            }
        }
        
        return $this->image_url;
    }

    /**
     * Get formatted tags as string
     */
    public function getTagsStringAttribute()
    {
        return is_array($this->tags) ? implode(', ', $this->tags) : '';
    }

    /**
     * Scope for active galleries
     */
    public function scopeActive($query)
    {
        return $query->where(function($q) {
            $q->where('is_active', true)
              ->orWhere('status', 'active');
        });
    }

    /**
     * Scope for featured galleries
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for galleries by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for galleries with tags
     */
    public function scopeWithTags($query, $tags)
    {
        if (is_string($tags)) {
            $tags = explode(',', $tags);
        }
        
        return $query->whereJsonContains('tags', $tags);
    }

    /**
     * Scope for ordered galleries
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    /**
     * Get galleries by category with pagination
     */
    public static function getByCategory($category, $perPage = 12)
    {
        return static::active()
            ->byCategory($category)
            ->ordered()
            ->paginate($perPage);
    }

    /**
     * Get featured galleries
     */
    public static function getFeatured($limit = 6)
    {
        return static::active()
            ->featured()
            ->ordered()
            ->limit($limit)
            ->get();
    }

    /**
     * Get random galleries
     */
    public static function getRandom($limit = 8)
    {
        return static::active()
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }

    /**
     * Search galleries by title or description
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('caption', 'like', "%{$search}%");
        });
    }

    /**
     * Get next gallery in the same category
     */
    public function getNextAttribute()
    {
        return static::active()
            ->byCategory($this->category)
            ->where('sort_order', '>', $this->sort_order)
            ->orderBy('sort_order')
            ->first();
    }

    /**
     * Get previous gallery in the same category
     */
    public function getPreviousAttribute()
    {
        return static::active()
            ->byCategory($this->category)
            ->where('sort_order', '<', $this->sort_order)
            ->orderBy('sort_order', 'desc')
            ->first();
    }

    /**
     * Scope for inactive galleries
     */
    public function scopeInactive($query)
    {
        return $query->where(function($q) {
            $q->where('is_active', false)
              ->orWhere('status', 'inactive');
        });
    }

    /**
     * Scope for galleries by date range
     */
    public function scopeDateRange($query, $from, $to)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
        return $query;
    }

    /**
     * Scope for galleries by file type
     */
    public function scopeByFileType($query, $fileType)
    {
        return $query->where('file_type', $fileType);
    }

    /**
     * Check if gallery is active
     */
    public function isActive()
    {
        return $this->is_active || $this->status === 'active';
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute()
    {
        if ($this->isActive()) {
            return 'bg-success';
        }
        return 'bg-secondary';
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

    /**
     * Get formatted file size
     */
    public function getFormattedFileSizeAttribute()
    {
        if (!$this->file_size) {
            return '-';
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get file extension
     */
    public function getFileExtensionAttribute()
    {
        if ($this->file_path) {
            if (filter_var($this->file_path, FILTER_VALIDATE_URL)) {
                return 'url';
            }
            return pathinfo($this->file_path, PATHINFO_EXTENSION);
        }
        if ($this->image) {
            return pathinfo($this->image, PATHINFO_EXTENSION);
        }
        return null;
    }
}
