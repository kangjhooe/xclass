<?php

namespace Modules\PublicPage\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TenantProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'instansi_id',
        'institution_name',
        'institution_type',
        'logo',
        'slogan',
        'description',
        'vision',
        'mission',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'email',
        'website',
        'social_media',
        'hero_title',
        'hero_subtitle',
        'hero_image',
        'hero_video',
        'about_title',
        'about_content',
        'about_image',
        'contact_info',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'custom_css',
        'custom_js',
        'is_active',
        'theme_name',
        'theme_config',
        'layout_type',
    ];

    protected $casts = [
        'social_media' => 'array',
        'contact_info' => 'array',
        'theme_config' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant that owns the profile
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the logo URL
     */
    public function getLogoUrlAttribute()
    {
        if ($this->logo) {
            return asset('storage/' . $this->logo);
        }
        
        return asset('images/default-logo.png');
    }

    /**
     * Get the hero image URL
     */
    public function getHeroImageUrlAttribute()
    {
        if ($this->hero_image) {
            return asset('storage/' . $this->hero_image);
        }
        
        return asset('images/default-hero.jpg');
    }

    /**
     * Get the about image URL
     */
    public function getAboutImageUrlAttribute()
    {
        if ($this->about_image) {
            return asset('storage/' . $this->about_image);
        }
        
        return asset('images/default-about.jpg');
    }

    /**
     * Get full address
     */
    public function getFullAddressAttribute()
    {
        $address = [];
        
        if ($this->address) {
            $address[] = $this->address;
        }
        
        if ($this->city) {
            $address[] = $this->city;
        }
        
        if ($this->province) {
            $address[] = $this->province;
        }
        
        if ($this->postal_code) {
            $address[] = $this->postal_code;
        }
        
        return implode(', ', $address);
    }

    /**
     * Scope for active profiles
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the active theme
     */
    public function getActiveTheme()
    {
        $themeName = $this->theme_name ?? 'default-blue';
        
        // Try to get from themes table first (for custom themes)
        $theme = Theme::where('slug', $themeName)->first();
        
        if ($theme) {
            return $theme;
        }
        
        // Fallback to predefined themes
        return $this->getPredefinedTheme($themeName);
    }

    /**
     * Get predefined theme config
     */
    protected function getPredefinedTheme($themeName)
    {
        $themes = [
            'default-blue' => [
                'primary_color' => '#007bff',
                'secondary_color' => '#6c757d',
                'sidebar_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'card_header_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'footer_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            ],
            'green' => [
                'primary_color' => '#28a745',
                'secondary_color' => '#6c757d',
                'sidebar_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                'card_header_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                'footer_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
            ],
            'red' => [
                'primary_color' => '#dc3545',
                'secondary_color' => '#6c757d',
                'sidebar_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                'card_header_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                'footer_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
            ],
        ];

        $config = $themes[$themeName] ?? $themes['default-blue'];
        
        // Get menu config from predefined themes
        $themeService = app(\Modules\PublicPage\Services\ThemeService::class);
        $predefinedThemes = $themeService->getPredefinedThemes();
        $menuConfig = $predefinedThemes[$themeName]['menu_config'] ?? [
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

        return (object) [
            'name' => ucfirst(str_replace('-', ' ', $themeName)),
            'slug' => $themeName,
            'theme_config' => $config,
            'menu_config' => $menuConfig,
            'layout_type' => $this->layout_type ?? 'sidebar-left',
            'custom_css' => null,
            'custom_js' => null,
        ];
    }
}
