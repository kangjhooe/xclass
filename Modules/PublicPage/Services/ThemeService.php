<?php

namespace Modules\PublicPage\Services;

use Modules\PublicPage\Models\Theme;
use Modules\PublicPage\Models\TenantProfile;
use App\Core\Services\TenantService;

class ThemeService
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Get active theme for current tenant
     */
    public function getActiveTheme($instansiId = null)
    {
        if (!$instansiId) {
            $tenant = $this->tenantService->getCurrentTenant();
            $instansiId = $tenant ? $tenant->id : null;
        }

        if (!$instansiId) {
            return $this->getDefaultTheme();
        }

        $profile = TenantProfile::where('instansi_id', $instansiId)->first();
        
        if (!$profile) {
            return $this->getDefaultTheme();
        }

        return $profile->getActiveTheme();
    }

    /**
     * Get default theme
     */
    public function getDefaultTheme()
    {
        $defaultConfig = [
            'primary_color' => '#007bff',
            'secondary_color' => '#6c757d',
            'sidebar_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'card_header_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'footer_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        ];

        $defaultMenuConfig = [
            'menu_style' => 'sidebar', // sidebar, topbar, dropdown, accordion
            'menu_position' => 'left', // left, right, top
            'show_menu_icons' => true,
            'show_menu_search' => true,
            'menu_font_size' => '14px',
            'menu_font_weight' => '500',
            'menu_item_padding' => '12px 20px',
            'menu_border_radius' => '0px',
            'menu_hover_effect' => 'background', // background, underline, border-left
            'custom_menu_items' => [], // untuk override menu items yang ditampilkan
        ];

        return (object) [
            'name' => 'Default Blue',
            'slug' => 'default-blue',
            'theme_config' => $defaultConfig,
            'menu_config' => $defaultMenuConfig,
            'layout_type' => 'sidebar-left',
            'custom_css' => null,
            'custom_js' => null,
        ];
    }

    /**
     * Get available themes for tenant
     */
    public function getAvailableThemes($instansiId = null)
    {
        if (!$instansiId) {
            $tenant = $this->tenantService->getCurrentTenant();
            $instansiId = $tenant ? $tenant->id : null;
        }

        return Theme::available($instansiId)->get();
    }

    /**
     * Get predefined themes list
     */
    public function getPredefinedThemes()
    {
        return [
            'default-blue' => [
                'name' => 'Default Blue',
                'description' => 'Tema default dengan warna biru dan ungu',
                'config' => [
                    'primary_color' => '#007bff',
                    'secondary_color' => '#6c757d',
                    'sidebar_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'card_header_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'footer_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                ],
                'menu_config' => [
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
                ],
            ],
            'green' => [
                'name' => 'Green Theme',
                'description' => 'Tema dengan warna hijau yang segar',
                'config' => [
                    'primary_color' => '#28a745',
                    'secondary_color' => '#6c757d',
                    'sidebar_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                    'card_header_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                    'footer_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                ],
                'menu_config' => [
                    'menu_style' => 'sidebar',
                    'menu_position' => 'left',
                    'show_menu_icons' => true,
                    'show_menu_search' => true,
                    'menu_font_size' => '14px',
                    'menu_font_weight' => '500',
                    'menu_item_padding' => '12px 20px',
                    'menu_border_radius' => '5px',
                    'menu_hover_effect' => 'background',
                    'custom_menu_items' => [],
                ],
            ],
            'red' => [
                'name' => 'Red Theme',
                'description' => 'Tema dengan warna merah yang dinamis',
                'config' => [
                    'primary_color' => '#dc3545',
                    'secondary_color' => '#6c757d',
                    'sidebar_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    'card_header_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    'footer_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                ],
                'menu_config' => [
                    'menu_style' => 'sidebar',
                    'menu_position' => 'left',
                    'show_menu_icons' => true,
                    'show_menu_search' => true,
                    'menu_font_size' => '14px',
                    'menu_font_weight' => '600',
                    'menu_item_padding' => '12px 20px',
                    'menu_border_radius' => '0px',
                    'menu_hover_effect' => 'border-left',
                    'custom_menu_items' => [],
                ],
            ],
        ];
    }

    /**
     * Apply theme to tenant profile
     */
    public function applyTheme($instansiId, $themeName, $themeConfig = null, $layoutType = 'sidebar-left', $menuConfig = null)
    {
        $tenant = \App\Models\Core\Tenant::find($instansiId);
        $profile = TenantProfile::firstOrCreate(
            ['instansi_id' => $instansiId],
            ['title' => $tenant ? $tenant->name : 'New Profile']
        );

        $updateData = [
            'theme_name' => $themeName,
            'theme_config' => $themeConfig,
            'layout_type' => $layoutType,
        ];

        // Menu config is stored in theme, not in profile
        // Profile will get menu config from theme when rendering

        $profile->update($updateData);

        return $profile;
    }

    /**
     * Generate CSS variables from theme config
     */
    public function generateCssVariables($theme)
    {
        $config = is_object($theme) ? $theme->theme_config : $theme;
        
        if (!$config) {
            $config = $this->getDefaultTheme()->theme_config;
        }

        $css = ':root {' . PHP_EOL;
        foreach ($config as $key => $value) {
            $cssVar = '--' . str_replace('_', '-', $key);
            $css .= "    {$cssVar}: {$value};" . PHP_EOL;
        }
        $css .= '}' . PHP_EOL;

        return $css;
    }

    /**
     * Generate full CSS from theme
     */
    public function generateThemeCss($theme)
    {
        $css = '';
        
        // CSS Variables
        $css .= $this->generateCssVariables($theme);
        $css .= PHP_EOL;

        // Custom CSS if exists
        if (is_object($theme) && $theme->custom_css) {
            $css .= $theme->custom_css . PHP_EOL;
        }

        return $css;
    }
}

