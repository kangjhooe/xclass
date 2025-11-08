<?php

namespace Modules\PublicPage\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'instansi_id',
        'name',
        'url',
        'icon',
        'parent_id',
        'order',
        'is_active',
        'target',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
        'parent_id' => 'integer',
    ];

    /**
     * Get the tenant that owns the menu
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the parent menu
     */
    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    /**
     * Get the child menus
     */
    public function children()
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('order');
    }

    /**
     * Scope for active menus
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for root menus (no parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get formatted URL
     */
    public function getFormattedUrlAttribute()
    {
        if (filter_var($this->url, FILTER_VALIDATE_URL)) {
            return $this->url;
        }
        
        return url($this->url);
    }

    /**
     * Scope for inactive menus
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope for menus with parent
     */
    public function scopeWithParent($query)
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Scope for menus without parent
     */
    public function scopeWithoutParent($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope for external menus
     */
    public function scopeExternal($query)
    {
        return $query->where('target', '_blank');
    }

    /**
     * Scope for internal menus
     */
    public function scopeInternal($query)
    {
        return $query->where('target', '_self');
    }

    /**
     * Check if menu is active
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Check if menu is root (no parent)
     */
    public function isRoot()
    {
        return is_null($this->parent_id);
    }

    /**
     * Check if menu has children
     */
    public function hasChildren()
    {
        return $this->children()->count() > 0;
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute()
    {
        return $this->is_active ? 'bg-success' : 'bg-secondary';
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
     * Get full path (breadcrumb)
     */
    public function getFullPathAttribute()
    {
        $path = [$this->name];
        $parent = $this->parent;
        
        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }
        
        return implode(' > ', $path);
    }

    /**
     * Get depth level (0 for root, 1 for first level child, etc)
     */
    public function getDepthAttribute()
    {
        $depth = 0;
        $parent = $this->parent;
        
        while ($parent) {
            $depth++;
            $parent = $parent->parent;
        }
        
        return $depth;
    }
}
