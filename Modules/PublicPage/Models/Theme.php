<?php

namespace Modules\PublicPage\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Theme extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_system',
        'created_by_instansi_id',
        'theme_config',
        'menu_config',
        'layout_type',
        'custom_css',
        'custom_js',
        'is_public',
        'download_count',
        'usage_count',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_public' => 'boolean',
        'theme_config' => 'array',
        'menu_config' => 'array',
        'download_count' => 'integer',
        'usage_count' => 'integer',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($theme) {
            if (empty($theme->slug)) {
                $theme->slug = Str::slug($theme->name);
            }
        });
    }

    /**
     * Get the tenant that created this theme
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'created_by_instansi_id');
    }

    /**
     * Scope for system themes
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope for public themes
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for available themes (system or public)
     */
    public function scopeAvailable($query, $instansiId = null)
    {
        return $query->where(function ($q) use ($instansiId) {
            $q->where('is_system', true)
              ->orWhere('is_public', true);
            
            if ($instansiId) {
                $q->orWhere('created_by_instansi_id', $instansiId);
            }
        });
    }

    /**
     * Increment download count
     */
    public function incrementDownload()
    {
        $this->increment('download_count');
    }

    /**
     * Increment usage count
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }

    /**
     * Get menu config with default fallback (for backward compatibility)
     */
    public function getMenuConfig()
    {
        if ($this->attributes['menu_config'] ?? null) {
            return $this->menu_config;
        }

        // Return default menu config if not set (backward compatibility)
        return [
            'menu_style' => 'sidebar',
            'menu_position' => 'left',
            'show_menu_icons' => true,
            'show_menu_search' => true,
            'menu_font_size' => '14px',
            'menu_font_weight' => '500',
            'menu_item_padding' => '12px 20px',
            'menu_border_radius' => '0px',
            'menu_hover_effect' => 'background',
            'custom_menu_items' => [],
        ];
    }

    /**
     * Export theme to array for JSON export
     */
    public function toExportArray()
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'theme_config' => $this->theme_config,
            'menu_config' => $this->getMenuConfig(),
            'layout_type' => $this->layout_type,
            'custom_css' => $this->custom_css,
            'custom_js' => $this->custom_js,
            'exported_at' => now()->toIso8601String(),
            'version' => '1.1', // Updated version to include menu_config
        ];
    }

    /**
     * Import theme from array
     */
    public static function fromImportArray(array $data, $instansiId = null, $isPublic = false)
    {
        // Default menu config for imported themes
        $defaultMenuConfig = [
            'menu_style' => 'sidebar',
            'menu_position' => 'left',
            'show_menu_icons' => true,
            'show_menu_search' => true,
            'menu_font_size' => '14px',
            'menu_font_weight' => '500',
            'menu_item_padding' => '12px 20px',
            'menu_border_radius' => '0px',
            'menu_hover_effect' => 'background',
            'custom_menu_items' => [],
        ];

        return static::create([
            'name' => $data['name'] ?? 'Imported Theme',
            'slug' => Str::slug($data['slug'] ?? $data['name'] ?? 'imported-theme') . '-' . Str::random(6),
            'description' => $data['description'] ?? null,
            'theme_config' => $data['theme_config'] ?? null,
            'menu_config' => $data['menu_config'] ?? $defaultMenuConfig,
            'layout_type' => $data['layout_type'] ?? 'sidebar-left',
            'custom_css' => $data['custom_css'] ?? null,
            'custom_js' => $data['custom_js'] ?? null,
            'is_system' => false,
            'created_by_instansi_id' => $instansiId,
            'is_public' => $isPublic,
        ]);
    }
}

