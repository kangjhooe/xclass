<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Modules\PublicPage\Models\Theme;

class ThemeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $themes = [
            [
                'name' => 'Default Blue',
                'slug' => 'default-blue',
                'description' => 'Tema default dengan warna biru dan ungu yang elegan',
                'is_system' => true,
                'created_by_instansi_id' => null,
                'theme_config' => [
                    'primary_color' => '#007bff',
                    'secondary_color' => '#6c757d',
                    'success_color' => '#28a745',
                    'info_color' => '#17a2b8',
                    'warning_color' => '#ffc107',
                    'danger_color' => '#dc3545',
                    'light_color' => '#f8f9fa',
                    'dark_color' => '#343a40',
                    'sidebar_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'card_header_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'footer_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'button_bg' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                ],
                'layout_type' => 'sidebar-left',
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
                'custom_css' => null,
                'custom_js' => null,
                'is_public' => true,
            ],
            [
                'name' => 'Green Theme',
                'slug' => 'green',
                'description' => 'Tema dengan warna hijau yang segar dan menyegarkan',
                'is_system' => true,
                'created_by_instansi_id' => null,
                'theme_config' => [
                    'primary_color' => '#28a745',
                    'secondary_color' => '#6c757d',
                    'success_color' => '#28a745',
                    'info_color' => '#17a2b8',
                    'warning_color' => '#ffc107',
                    'danger_color' => '#dc3545',
                    'light_color' => '#f8f9fa',
                    'dark_color' => '#343a40',
                    'sidebar_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                    'card_header_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                    'footer_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                    'button_bg' => 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                ],
                'layout_type' => 'sidebar-left',
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
                'custom_css' => null,
                'custom_js' => null,
                'is_public' => true,
            ],
            [
                'name' => 'Red Theme',
                'slug' => 'red',
                'description' => 'Tema dengan warna merah yang dinamis dan penuh energi',
                'is_system' => true,
                'created_by_instansi_id' => null,
                'theme_config' => [
                    'primary_color' => '#dc3545',
                    'secondary_color' => '#6c757d',
                    'success_color' => '#28a745',
                    'info_color' => '#17a2b8',
                    'warning_color' => '#ffc107',
                    'danger_color' => '#dc3545',
                    'light_color' => '#f8f9fa',
                    'dark_color' => '#343a40',
                    'sidebar_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    'card_header_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    'footer_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    'button_bg' => 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                ],
                'layout_type' => 'sidebar-left',
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
                'custom_css' => null,
                'custom_js' => null,
                'is_public' => true,
            ],
        ];

        foreach ($themes as $theme) {
            Theme::updateOrCreate(
                ['slug' => $theme['slug']],
                $theme
            );
        }
    }
}
