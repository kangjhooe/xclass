<?php

namespace Modules\PublicPage\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\PublicPage\Models\Theme;
use Modules\PublicPage\Models\TenantProfile;
use Modules\PublicPage\Services\ThemeService;
use App\Core\Services\TenantService;
use Illuminate\Support\Str;

class ThemeController extends Controller
{
    protected $themeService;
    protected $tenantService;

    public function __construct(ThemeService $themeService, TenantService $tenantService)
    {
        $this->themeService = $themeService;
        $this->tenantService = $tenantService;
    }

    /**
     * Display a listing of themes
     */
    public function index()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $profile = TenantProfile::where('instansi_id', $tenant->id)->first();
        
        $systemThemes = Theme::system()->get();
        $publicThemes = Theme::public()->where('created_by_instansi_id', '!=', $tenant->id)->get();
        $myThemes = Theme::where('created_by_instansi_id', $tenant->id)->get();
        $predefinedThemes = $this->themeService->getPredefinedThemes();
        
        $activeThemeName = $profile ? $profile->theme_name : 'default-blue';

        return view('publicpage::admin.themes.index', compact(
            'systemThemes',
            'publicThemes',
            'myThemes',
            'predefinedThemes',
            'activeThemeName',
            'profile'
        ));
    }

    /**
     * Show the form for creating a new theme
     */
    public function create()
    {
        $predefinedThemes = $this->themeService->getPredefinedThemes();
        return view('publicpage::admin.themes.create', compact('predefinedThemes'));
    }

    /**
     * Store a newly created theme
     */
    public function store(Request $request)
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'theme_config' => 'nullable|array',
            'menu_config' => 'nullable|array',
            'layout_type' => 'required|in:sidebar-left,full-width,boxed',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'is_public' => 'boolean',
            'base_theme' => 'nullable|string', // predefined theme sebagai base
        ]);

        // Process menu_config checkboxes
        $menuConfig = $request->menu_config ?? [];
        // Checkboxes: if exists and value is "1", then true; if not exists, then false
        $menuConfig['show_menu_icons'] = isset($menuConfig['show_menu_icons']) && $menuConfig['show_menu_icons'] == '1';
        $menuConfig['show_menu_search'] = isset($menuConfig['show_menu_search']) && $menuConfig['show_menu_search'] == '1';

        // Jika ada base theme, gunakan config-nya
        if ($request->base_theme) {
            $predefinedThemes = $this->themeService->getPredefinedThemes();
            if (isset($predefinedThemes[$request->base_theme])) {
                $validated['theme_config'] = $predefinedThemes[$request->base_theme]['config'] ?? [];
                $menuConfig = $predefinedThemes[$request->base_theme]['menu_config'] ?? $menuConfig;
            }
        }

        $theme = Theme::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(6),
            'description' => $validated['description'] ?? null,
            'is_system' => false,
            'created_by_instansi_id' => $tenant->id,
            'theme_config' => $validated['theme_config'] ?? [],
            'menu_config' => $menuConfig,
            'layout_type' => $validated['layout_type'],
            'custom_css' => $validated['custom_css'] ?? null,
            'custom_js' => $validated['custom_js'] ?? null,
            'is_public' => $request->has('is_public') && $request->is_public,
        ]);

        return redirect()
            ->route('tenant.public-page.themes.index', ['tenant' => $tenant->npsn])
            ->with('success', 'Tema berhasil dibuat');
    }

    /**
     * Show the form for editing a theme
     */
    public function edit($tenant, Theme $theme)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        // Hanya bisa edit tema sendiri atau sistem
        if (!$theme->is_system && $theme->created_by_instansi_id != $currentTenant->id) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit tema ini');
        }

        $predefinedThemes = $this->themeService->getPredefinedThemes();
        
        return view('publicpage::admin.themes.edit', compact('theme', 'predefinedThemes'));
    }

    /**
     * Update a theme
     */
    public function update(Request $request, $tenant, Theme $theme)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        // Hanya bisa edit tema sendiri atau sistem
        if (!$theme->is_system && $theme->created_by_instansi_id != $currentTenant->id) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit tema ini');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'theme_config' => 'nullable|array',
            'menu_config' => 'nullable|array',
            'layout_type' => 'required|in:sidebar-left,full-width,boxed',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        // Process menu_config checkboxes
        $menuConfig = $request->menu_config ?? [];
        // Checkboxes: if exists and value is "1", then true; if not exists, then false
        $menuConfig['show_menu_icons'] = isset($menuConfig['show_menu_icons']) && $menuConfig['show_menu_icons'] == '1';
        $menuConfig['show_menu_search'] = isset($menuConfig['show_menu_search']) && $menuConfig['show_menu_search'] == '1';
        
        $validated['menu_config'] = $menuConfig;

        // Jika tema sistem, tidak bisa diubah is_public
        if ($theme->is_system) {
            unset($validated['is_public']);
        }

        $theme->update($validated);

        return redirect()
            ->route('tenant.public-page.themes.index', ['tenant' => $currentTenant->npsn])
            ->with('success', 'Tema berhasil diperbarui');
    }

    /**
     * Delete a theme
     */
    public function destroy($tenant, Theme $theme)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        // Hanya bisa hapus tema sendiri
        if ($theme->is_system) {
            return redirect()
                ->route('tenant.public-page.themes.index', ['tenant' => $currentTenant->npsn])
                ->with('error', 'Tema sistem tidak dapat dihapus');
        }

        if ($theme->created_by_instansi_id != $currentTenant->id) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus tema ini');
        }

        $theme->delete();

        return redirect()
            ->route('tenant.public-page.themes.index', ['tenant' => $currentTenant->npsn])
            ->with('success', 'Tema berhasil dihapus');
    }

    /**
     * Apply theme to tenant profile
     */
    public function apply(Request $request, $tenant)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        $validated = $request->validate([
            'theme_name' => 'required|string',
            'layout_type' => 'nullable|in:sidebar-left,full-width,boxed',
        ]);

        $themeName = $validated['theme_name'];
        $layoutType = $validated['layout_type'] ?? 'sidebar-left';

        // Cek apakah tema ada di database atau predefined
        $theme = Theme::where('slug', $themeName)->first();
        
        if ($theme) {
            $themeConfig = $theme->theme_config;
            $menuConfig = $theme->menu_config;
            $this->themeService->applyTheme($currentTenant->id, $themeName, $themeConfig, $layoutType, $menuConfig);
        } else {
            // Predefined theme
            $predefinedThemes = $this->themeService->getPredefinedThemes();
            if (isset($predefinedThemes[$themeName])) {
                $themeConfig = $predefinedThemes[$themeName]['config'];
                $menuConfig = $predefinedThemes[$themeName]['menu_config'] ?? [];
                $this->themeService->applyTheme($currentTenant->id, $themeName, $themeConfig, $layoutType, $menuConfig);
            }
        }

        return redirect()
            ->route('tenant.public-page.themes.index', ['tenant' => $currentTenant->npsn])
            ->with('success', 'Tema berhasil diterapkan');
    }

    /**
     * Preview theme
     */
    public function preview($tenant, $theme = null, $themeName = null)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        $profile = TenantProfile::where('instansi_id', $currentTenant->id)->first();

        // Jika $theme adalah object Theme (dari route model binding)
        if (is_object($theme) && $theme instanceof Theme) {
            // Gunakan tema dari database
        } 
        // Jika ada themeName dari URL parameter
        elseif ($themeName) {
            $theme = Theme::where('slug', $themeName)->first();
            
            if (!$theme) {
                // Predefined theme
                $predefinedThemes = $this->themeService->getPredefinedThemes();
                if (isset($predefinedThemes[$themeName])) {
                    $theme = (object) [
                        'name' => $predefinedThemes[$themeName]['name'],
                        'slug' => $themeName,
                        'theme_config' => $predefinedThemes[$themeName]['config'],
                        'menu_config' => $predefinedThemes[$themeName]['menu_config'] ?? [],
                        'layout_type' => $profile ? ($profile->layout_type ?? 'sidebar-left') : 'sidebar-left',
                        'custom_css' => null,
                        'custom_js' => null,
                    ];
                } else {
                    abort(404, 'Tema tidak ditemukan');
                }
            }
        } 
        // Jika $theme adalah string (slug dari route parameter)
        elseif (is_string($theme)) {
            $themeModel = Theme::where('slug', $theme)->first();
            
            if (!$themeModel) {
                // Predefined theme
                $predefinedThemes = $this->themeService->getPredefinedThemes();
                if (isset($predefinedThemes[$theme])) {
                    $theme = (object) [
                        'name' => $predefinedThemes[$theme]['name'],
                        'slug' => $theme,
                        'theme_config' => $predefinedThemes[$theme]['config'],
                        'menu_config' => $predefinedThemes[$theme]['menu_config'] ?? [],
                        'layout_type' => $profile ? ($profile->layout_type ?? 'sidebar-left') : 'sidebar-left',
                        'custom_css' => null,
                        'custom_js' => null,
                    ];
                } else {
                    abort(404, 'Tema tidak ditemukan');
                }
            } else {
                $theme = $themeModel;
            }
        }
        // Fallback: gunakan tema aktif
        else {
            $theme = $profile ? $profile->getActiveTheme() : $this->themeService->getDefaultTheme();
        }

        return view('publicpage::admin.themes.preview', compact('theme', 'profile', 'currentTenant'));
    }

    /**
     * Export theme as JSON
     */
    public function export($tenant, Theme $theme)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        // Hanya bisa export tema sendiri atau public/system
        if (!$theme->is_system && !$theme->is_public && $theme->created_by_instansi_id != $currentTenant->id) {
            abort(403, 'Anda tidak memiliki akses untuk export tema ini');
        }

        $theme->incrementDownload();

        $data = $theme->toExportArray();
        $filename = Str::slug($theme->name) . '-theme.json';

        return response()->json($data, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Import theme from JSON
     */
    public function import(Request $request, $tenant)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        $validated = $request->validate([
            'theme_file' => 'required|file|mimes:json',
            'is_public' => 'boolean',
        ]);

        $fileContent = file_get_contents($validated['theme_file']->getRealPath());
        $data = json_decode($fileContent, true);

        if (!$data || json_last_error() !== JSON_ERROR_NONE) {
            return redirect()
                ->route('tenant.public-page.themes.index', ['tenant' => $currentTenant->npsn])
                ->with('error', 'File JSON tidak valid');
        }

        try {
            $theme = Theme::fromImportArray(
                $data,
                $currentTenant->id,
                $request->has('is_public') && $request->is_public
            );

            return redirect()
                ->route('tenant.public-page.themes.index', ['tenant' => $currentTenant->npsn])
                ->with('success', 'Tema berhasil diimpor');
        } catch (\Exception $e) {
            return redirect()
                ->route('tenant.public-page.themes.index', ['tenant' => $currentTenant->npsn])
                ->with('error', 'Gagal mengimpor tema: ' . $e->getMessage());
        }
    }

    /**
     * Duplicate theme
     */
    public function duplicate($tenant, Theme $theme)
    {
        $currentTenant = $this->tenantService->getCurrentTenant();
        
        // Hanya bisa duplicate tema sendiri, public, atau sistem
        if (!$theme->is_system && !$theme->is_public && $theme->created_by_instansi_id != $currentTenant->id) {
            abort(403, 'Anda tidak memiliki akses untuk menduplikasi tema ini');
        }

        $newTheme = $theme->replicate();
        $newTheme->name = $theme->name . ' (Copy)';
        $newTheme->slug = Str::slug($newTheme->name) . '-' . Str::random(6);
        $newTheme->is_system = false;
        $newTheme->created_by_instansi_id = $currentTenant->id;
        $newTheme->is_public = false;
        $newTheme->download_count = 0;
        $newTheme->usage_count = 0;
        $newTheme->save();

        return redirect()
            ->route('tenant.public-page.themes.index', ['tenant' => $currentTenant->npsn])
            ->with('success', 'Tema berhasil diduplikasi');
    }
}

