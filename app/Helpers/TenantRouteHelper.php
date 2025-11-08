<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Route;
use App\Core\Services\TenantService;

class TenantRouteHelper
{
    /**
     * Generate URL untuk tenant route
     */
    public static function url(string $route, array $parameters = [], string $tenant = null): string
    {
        if (!$tenant) {
            $tenant = app(TenantService::class)->getCurrentTenant();
            $tenant = $tenant ? $tenant->npsn : 'default';
        }

        $parameters = array_merge(['tenant' => $tenant], $parameters);
        
        return route($route, $parameters);
    }

    /**
     * Generate URL untuk tenant route dengan parameter tambahan
     */
    public static function tenantUrl(string $route, array $parameters = [], string $tenant = null): string
    {
        return self::url("tenant.{$route}", $parameters, $tenant);
    }

    /**
     * Check apakah route tenant tersedia
     */
    public static function hasRoute(string $route, string $tenant = null): bool
    {
        try {
            if (!$tenant) {
                $tenant = app(TenantService::class)->getCurrentTenant();
                $tenant = $tenant ? $tenant->npsn : 'default';
            }

            $parameters = ['tenant' => $tenant];
            route("tenant.{$route}", $parameters);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get semua route yang tersedia untuk tenant
     */
    public static function getAvailableRoutes(string $tenant = null): array
    {
        if (!$tenant) {
            $tenant = app(TenantService::class)->getCurrentTenant();
            $tenant = $tenant ? $tenant->npsn : 'default';
        }

        $routes = [];
        $routeList = [
            'students.index',
            'teachers.index',
            'classes.index',
            'subjects.index',
            'schedules.index',
            'attendance.index',
            'grades.index',
        ];

        foreach ($routeList as $route) {
            if (self::hasRoute($route, $tenant)) {
                $routes[] = $route;
            }
        }

        return $routes;
    }

    /**
     * Generate breadcrumb untuk tenant
     */
    public static function breadcrumb(array $items): array
    {
        $breadcrumb = [
            [
                'name' => 'Dashboard',
                'url' => self::tenantUrl('dashboard'),
                'active' => false
            ]
        ];

        foreach ($items as $item) {
            $breadcrumb[] = [
                'name' => $item['name'],
                'url' => $item['url'] ?? null,
                'active' => $item['active'] ?? false
            ];
        }

        return $breadcrumb;
    }

    /**
     * Generate navigation menu untuk tenant
     */
    public static function navigationMenu(): array
    {
        $tenant = app(TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            return [];
        }

        $menu = [
            [
                'name' => 'Dashboard',
                'icon' => 'fas fa-tachometer-alt',
                'url' => self::tenantUrl('dashboard'),
                'active' => request()->routeIs('tenant.dashboard'),
                'permission' => null
            ],
            [
                'name' => 'Siswa',
                'icon' => 'fas fa-user-graduate',
                'url' => self::tenantUrl('students.index'),
                'active' => request()->routeIs('tenant.students.*'),
                'permission' => 'module:students'
            ],
            [
                'name' => 'Guru',
                'icon' => 'fas fa-chalkboard-teacher',
                'url' => self::tenantUrl('teachers.index'),
                'active' => request()->routeIs('tenant.teachers.*'),
                'permission' => 'module:teachers'
            ],
            [
                'name' => 'Kelas',
                'icon' => 'fas fa-door-open',
                'url' => self::tenantUrl('classes.index'),
                'active' => request()->routeIs('tenant.classes.*'),
                'permission' => 'module:classes'
            ],
            [
                'name' => 'Mata Pelajaran',
                'icon' => 'fas fa-book',
                'url' => self::tenantUrl('subjects.index'),
                'active' => request()->routeIs('tenant.subjects.*'),
                'permission' => 'module:subjects'
            ],
            [
                'name' => 'Jadwal',
                'icon' => 'fas fa-calendar-alt',
                'url' => self::tenantUrl('schedules.index'),
                'active' => request()->routeIs('tenant.schedules.*'),
                'permission' => 'module:schedules'
            ],
            [
                'name' => 'Kehadiran',
                'icon' => 'fas fa-user-check',
                'url' => self::tenantUrl('attendance.index'),
                'active' => request()->routeIs('tenant.attendance.*'),
                'permission' => 'module:attendance'
            ],
            [
                'name' => 'Nilai',
                'icon' => 'fas fa-chart-line',
                'url' => self::tenantUrl('grades.index'),
                'active' => request()->routeIs('tenant.grades.*'),
                'permission' => 'module:grades'
            ]
        ];

        // Filter menu berdasarkan permission
        return array_filter($menu, function ($item) use ($tenant) {
            if (!$item['permission']) {
                return true;
            }

            return TenantAccessHelper::hasModuleAccess($tenant, $item['permission']);
        });
    }

    /**
     * Generate pagination links untuk tenant
     */
    public static function paginationLinks($paginator, array $parameters = []): array
    {
        $tenant = app(TenantService::class)->getCurrentTenant();
        $tenantParam = $tenant ? $tenant->npsn : 'default';
        
        $parameters = array_merge(['tenant' => $tenantParam], $parameters);
        
        return $paginator->appends($parameters)->links();
    }

    /**
     * Generate redirect response untuk tenant
     */
    public static function redirect(string $route, array $parameters = [], int $status = 302)
    {
        $url = self::tenantUrl($route, $parameters);
        return redirect($url, $status);
    }

    /**
     * Generate back redirect dengan tenant context
     */
    public static function back(array $parameters = [])
    {
        $tenant = app(TenantService::class)->getCurrentTenant();
        $tenantParam = $tenant ? $tenant->npsn : 'default';
        
        $parameters = array_merge(['tenant' => $tenantParam], $parameters);
        
        return back()->withInput($parameters);
    }
}
