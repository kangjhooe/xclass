<?php

namespace App\Helpers;

use App\Core\Services\TenantService;
use App\Models\Core\Tenant;

class TenantAccessHelper
{
    protected static $tenantService;

    /**
     * Get current tenant
     */
    public static function getCurrentTenant(): ?Tenant
    {
        if (!self::$tenantService) {
            self::$tenantService = app(TenantService::class);
        }

        return self::$tenantService->getCurrentTenant();
    }

    /**
     * Check if current tenant has access to feature
     */
    public static function hasFeature(string $featureKey): bool
    {
        $tenant = self::getCurrentTenant();
        return $tenant ? $tenant->hasFeature($featureKey) : false;
    }

    /**
     * Check if current tenant has access to module
     */
    public static function hasModule(string $moduleKey): bool
    {
        $tenant = self::getCurrentTenant();
        return $tenant ? $tenant->hasModule($moduleKey) : false;
    }

    /**
     * Check if current tenant has specific permission for module
     */
    public static function hasPermission(string $moduleKey, string $permission): bool
    {
        $tenant = self::getCurrentTenant();
        return $tenant ? $tenant->hasModulePermission($moduleKey, $permission) : false;
    }

    /**
     * Get feature setting for current tenant
     */
    public static function getFeatureSetting(string $featureKey, string $settingKey, $default = null)
    {
        $tenant = self::getCurrentTenant();
        if (!$tenant) {
            return $default;
        }

        $feature = $tenant->features()
            ->where('feature_name', $featureKey)
            ->where('is_active', true)
            ->first();

        return $feature ? $feature->getSetting($settingKey, $default) : $default;
    }

    /**
     * Get module setting for current tenant
     */
    public static function getModuleSetting(string $moduleKey, string $settingKey, $default = null)
    {
        $tenant = self::getCurrentTenant();
        if (!$tenant) {
            return $default;
        }

        $module = $tenant->modules()
            ->where('module_key', $moduleKey)
            ->active()
            ->first();

        return $module ? $module->getSetting($settingKey, $default) : $default;
    }

    /**
     * Get active features for current tenant
     */
    public static function getActiveFeatures()
    {
        $tenant = self::getCurrentTenant();
        return $tenant ? $tenant->getActiveFeatures() : collect();
    }

    /**
     * Get active modules for current tenant
     */
    public static function getActiveModules()
    {
        $tenant = self::getCurrentTenant();
        return $tenant ? $tenant->getActiveModules() : collect();
    }

    /**
     * Check if feature is available (not expired)
     */
    public static function isFeatureAvailable(string $featureKey): bool
    {
        $tenant = self::getCurrentTenant();
        if (!$tenant) {
            return false;
        }

        $feature = $tenant->features()
            ->where('feature_name', $featureKey)
            ->where('is_active', true)
            ->first();

        return $feature ? true : false;
    }

    /**
     * Check if module is available (not expired)
     */
    public static function isModuleAvailable(string $moduleKey): bool
    {
        $tenant = self::getCurrentTenant();
        if (!$tenant) {
            return false;
        }

        $module = $tenant->modules()
            ->where('module_key', $moduleKey)
            ->first();

        return $module ? $module->isActive() : false;
    }

    /**
     * Get tenant subscription info
     */
    public static function getSubscriptionInfo(): array
    {
        $tenant = self::getCurrentTenant();
        if (!$tenant) {
            return [
                'plan' => null,
                'expires_at' => null,
                'is_valid' => false,
                'days_remaining' => 0,
            ];
        }

        return [
            'plan' => $tenant->subscription_plan,
            'expires_at' => $tenant->subscription_expires_at,
            'is_valid' => $tenant->hasValidSubscription(),
            'days_remaining' => $tenant->subscription_expires_at ? 
                now()->diffInDays($tenant->subscription_expires_at, false) : 0,
        ];
    }

    /**
     * Get access summary for current tenant
     */
    public static function getAccessSummary(): array
    {
        $tenant = self::getCurrentTenant();
        if (!$tenant) {
            return [
                'features' => [],
                'modules' => [],
                'subscription' => null,
            ];
        }

        return [
            'features' => self::getActiveFeatures()->pluck('feature_name')->toArray(),
            'modules' => self::getActiveModules()->pluck('module_key')->toArray(),
            'subscription' => self::getSubscriptionInfo(),
        ];
    }

    /**
     * Check if tenant can access specific route
     */
    public static function canAccessRoute(string $routeName): bool
    {
        // Define route to module mapping
        $routeModuleMap = [
            'tenant.ppdb.*' => 'ppdb',
            'tenant.spp.*' => 'spp',
            'tenant.library.*' => 'library',
            'tenant.inventory.*' => 'inventory',
            'tenant.exam.*' => 'exam',
            'tenant.extracurricular.*' => 'extracurricular',
            'tenant.parent-portal.*' => 'parent_portal',
            'tenant.counseling.*' => 'counseling',
            'tenant.discipline.*' => 'discipline',
            'tenant.graduation.*' => 'graduation',
            'tenant.events.*' => 'events',
            'tenant.health.*' => 'health',
            'tenant.transportation.*' => 'transportation',
            'tenant.cafeteria.*' => 'cafeteria',
            'tenant.alumni.*' => 'alumni',
            'tenant.correspondence.*' => 'correspondence',
            'tenant.academic.*' => 'academic',
            'tenant.finance.*' => 'finance',
            'tenant.hr.*' => 'hr',
            'tenant.facility.*' => 'facility',
            'tenant.report.*' => 'report',
        ];

        // Check if route requires module access
        foreach ($routeModuleMap as $routePattern => $moduleKey) {
            if (str_starts_with($routeName, str_replace('*', '', $routePattern))) {
                return self::hasModule($moduleKey);
            }
        }

        return true; // Default allow if no specific module required
    }

    /**
     * Get menu items based on tenant access
     */
    public static function getAccessibleMenuItems(): array
    {
        $menuItems = [
            [
                'name' => 'Dashboard',
                'route' => 'tenant.dashboard',
                'icon' => 'fas fa-tachometer-alt',
                'access' => true, // Always accessible
            ],
        ];

        // Only add modules that have routes defined
        $availableModules = [
            'ppdb' => [
                'name' => 'PPDB',
                'route' => 'tenant.ppdb.index',
                'icon' => 'fas fa-user-plus',
            ],
            'spp' => [
                'name' => 'SPP',
                'route' => 'tenant.spp.index',
                'icon' => 'fas fa-money-bill-wave',
            ],
            'library' => [
                'name' => 'Perpustakaan',
                'route' => 'tenant.library.index',
                'icon' => 'fas fa-book',
            ],
            'inventory' => [
                'name' => 'Inventori',
                'route' => 'tenant.inventory.index',
                'icon' => 'fas fa-boxes',
            ],
            'exam' => [
                'name' => 'Ujian Online',
                'route' => 'tenant.exam.index',
                'icon' => 'fas fa-clipboard-list',
            ],
            'extracurricular' => [
                'name' => 'Ekstrakurikuler',
                'route' => 'tenant.extracurricular.index',
                'icon' => 'fas fa-running',
            ],
            'parent_portal' => [
                'name' => 'Portal Orang Tua',
                'route' => 'tenant.parent-portal.index',
                'icon' => 'fas fa-users',
            ],
            'counseling' => [
                'name' => 'Bimbingan Konseling',
                'route' => 'tenant.counseling.index',
                'icon' => 'fas fa-comments',
            ],
            'discipline' => [
                'name' => 'Kedisiplinan',
                'route' => 'tenant.discipline.index',
                'icon' => 'fas fa-gavel',
            ],
            'graduation' => [
                'name' => 'Kelulusan',
                'route' => 'tenant.graduation.index',
                'icon' => 'fas fa-graduation-cap',
            ],
            'events' => [
                'name' => 'Event',
                'route' => 'tenant.events.index',
                'icon' => 'fas fa-calendar',
            ],
            'health' => [
                'name' => 'Kesehatan',
                'route' => 'tenant.health.index',
                'icon' => 'fas fa-heartbeat',
            ],
            'transportation' => [
                'name' => 'Transportasi',
                'route' => 'tenant.transportation.index',
                'icon' => 'fas fa-bus',
            ],
            'cafeteria' => [
                'name' => 'Kafetaria',
                'route' => 'tenant.cafeteria.index',
                'icon' => 'fas fa-utensils',
            ],
            'alumni' => [
                'name' => 'Alumni',
                'route' => 'tenant.alumni.index',
                'icon' => 'fas fa-user-graduate',
            ],
            'correspondence' => [
                'name' => 'Persuratan',
                'route' => 'tenant.correspondence.index',
                'icon' => 'fas fa-envelope',
            ],
            'academic' => [
                'name' => 'Akademik',
                'route' => 'tenant.academic.index',
                'icon' => 'fas fa-graduation-cap',
            ],
            'finance' => [
                'name' => 'Keuangan',
                'route' => 'tenant.finance.index',
                'icon' => 'fas fa-calculator',
            ],
            'hr' => [
                'name' => 'SDM',
                'route' => 'tenant.hr.index',
                'icon' => 'fas fa-users-cog',
            ],
            'facility' => [
                'name' => 'Sarana Prasarana',
                'route' => 'tenant.facility.index',
                'icon' => 'fas fa-building',
            ],
            'report' => [
                'name' => 'Laporan',
                'route' => 'tenant.report.index',
                'icon' => 'fas fa-chart-bar',
            ],
        ];

        // Check if routes exist before adding to menu
        foreach ($availableModules as $moduleKey => $module) {
            try {
                // Check if route exists
                route($module['route'], ['tenant' => 'test']);
                $menuItems[] = array_merge($module, [
                    'access' => self::hasModule($moduleKey)
                ]);
            } catch (\Exception $e) {
                // Route doesn't exist, skip this module
                continue;
            }
        }

        return array_filter($menuItems, fn($item) => $item['access']);
    }
}
