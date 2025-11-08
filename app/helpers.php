<?php

if (!function_exists('tenant_route')) {
    /**
     * Generate a URL to a named route with tenant parameter
     */
    function tenant_route($name, $parameters = [], $absolute = true)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        // Jika tenant belum di-set di TenantService, coba ambil dari request route parameter
        if (!$tenant) {
            $request = app('request');
            $tenantParam = $request->route('tenant');
            
            if ($tenantParam) {
                $tenant = app(\App\Core\Services\TenantService::class)->getTenantByNpsn($tenantParam);
                // Set tenant untuk penggunaan selanjutnya
                if ($tenant) {
                    app(\App\Core\Services\TenantService::class)->setCurrentTenant($tenant);
                }
            }
        }

        // Handle case where parameters is a single model object
        if (is_object($parameters) && method_exists($parameters, 'getRouteKey')) {
            // Extract route parameter name from route name
            // e.g., 'tenant.classes.destroy' -> 'class', 'tenant.teachers.show' -> 'teacher'
            $routeParts = explode('.', $name);
            $routePartsCount = count($routeParts);
            $lastPart = $routeParts[$routePartsCount - 1] ?? '';
            
            // Get the route key from model (uses getRouteKeyName() method)
            $modelId = $parameters->getRouteKey();
            
            // Map common route actions to parameter names
            if (in_array($lastPart, ['show', 'edit', 'update', 'destroy', 'students', 'schedules'])) {
                // Get the resource name from route (e.g., 'classes' -> 'class', 'teachers' -> 'teacher')
                // Usually the second to last part, but skip 'tenant' prefix if exists
                $resourceName = null;
                for ($i = $routePartsCount - 2; $i >= 0; $i--) {
                    if ($routeParts[$i] !== 'tenant') {
                        $resourceName = $routeParts[$i];
                        break;
                    }
                }
                
                if ($resourceName) {
                    // Convert kebab-case or hyphenated names to snake_case first
                    $normalizedName = str_replace('-', '_', $resourceName);
                    
                    // Special handling for specific routes
                    $specialRoutes = [
                        'ppdb' => 'application', // tenant.ppdb.show uses {application} parameter
                        'non_teaching_staff' => 'nonTeachingStaff', // tenant.data-pokok.non-teaching-staff.show uses {nonTeachingStaff} parameter
                    ];
                    
                    // Routes that use {id} parameter instead of resource name
                    $routesUsingId = ['lands', 'buildings', 'rooms'];
                    
                    if (isset($specialRoutes[$normalizedName])) {
                        $parameterName = $specialRoutes[$normalizedName];
                    } elseif (in_array($normalizedName, $routesUsingId)) {
                        // Facility routes use {id} parameter
                        $parameterName = 'id';
                    } else {
                        // Convert plural to singular
                        // Handle special cases: duties -> duty, cities -> city, etc.
                        if (preg_match('/ies$/', $normalizedName)) {
                            $parameterName = preg_replace('/ies$/', 'y', $normalizedName);
                        } elseif (preg_match('/ses$/', $normalizedName)) {
                            // Handle cases like: classes -> class
                            $parameterName = preg_replace('/es$/', '', $normalizedName);
                        } else {
                            $parameterName = rtrim($normalizedName, 's'); // Simple plural handling
                        }
                        
                        // Convert snake_case to camelCase for route parameters
                        // e.g., 'non_teaching_staf' -> 'nonTeachingStaf'
                        if (strpos($parameterName, '_') !== false) {
                            $parts = explode('_', $parameterName);
                            $parameterName = $parts[0];
                            for ($j = 1; $j < count($parts); $j++) {
                                $parameterName .= ucfirst($parts[$j]);
                            }
                        }
                    }
                    
                    $parameterName = $parameterName === 'tenant' ? 'tenant' : $parameterName;
                    $parameters = [$parameterName => $modelId];
                } else {
                    $parameters = ['id' => $modelId];
                }
            } else {
                $parameters = [$parameters];
            }
        }
        
        // Handle case where parameters is a string (single ID/UUID/slug)
        if (is_string($parameters) || is_numeric($parameters)) {
            // Try to extract the route parameter name from the route name
            // For routes like 'news.show', we need 'slug' parameter
            // For routes like 'facility.lands.show', we need 'id' parameter
            if (strpos($name, '.show') !== false || strpos($name, '.edit') !== false || 
                strpos($name, '.update') !== false || strpos($name, '.destroy') !== false) {
                // Check if this is a news route that uses slug
                if (strpos($name, 'news') !== false || strpos($name, 'berita') !== false) {
                    $parameters = ['slug' => $parameters];
                } else {
                    // Extract resource name from route
                    $routeParts = explode('.', $name);
                    $routePartsCount = count($routeParts);
                    $resourceName = null;
                    for ($i = $routePartsCount - 2; $i >= 0; $i--) {
                        if ($routeParts[$i] !== 'tenant') {
                            $resourceName = $routeParts[$i];
                            break;
                        }
                    }
                    
                    if ($resourceName) {
                        // Convert kebab-case or hyphenated names to snake_case first
                        $normalizedName = str_replace('-', '_', $resourceName);
                        
                        // Special handling for specific routes
                        $specialRoutes = [
                            'ppdb' => 'application', // tenant.ppdb.show uses {application} parameter
                            'non_teaching_staff' => 'nonTeachingStaff', // tenant.data-pokok.non-teaching-staff.show uses {nonTeachingStaff} parameter
                        ];
                        
                        // Routes that use {id} parameter instead of resource name
                        $routesUsingId = ['lands', 'buildings', 'rooms'];
                        
                        if (isset($specialRoutes[$normalizedName])) {
                            $parameterName = $specialRoutes[$normalizedName];
                        } elseif (in_array($normalizedName, $routesUsingId)) {
                            // Facility routes use {id} parameter
                            $parameterName = 'id';
                        } else {
                            // Convert plural to singular
                            // Handle special cases: duties -> duty, cities -> city, etc.
                            if (preg_match('/ies$/', $normalizedName)) {
                                $parameterName = preg_replace('/ies$/', 'y', $normalizedName);
                            } elseif (preg_match('/ses$/', $normalizedName)) {
                                // Handle cases like: classes -> class
                                $parameterName = preg_replace('/es$/', '', $normalizedName);
                            } else {
                                $parameterName = rtrim($normalizedName, 's');
                            }
                            
                            // Convert snake_case to camelCase for route parameters
                            // e.g., 'non_teaching_staf' -> 'nonTeachingStaf'
                            if (strpos($parameterName, '_') !== false) {
                                $parts = explode('_', $parameterName);
                                $parameterName = $parts[0];
                                for ($j = 1; $j < count($parts); $j++) {
                                    $parameterName .= ucfirst($parts[$j]);
                                }
                            }
                        }
                        
                        $parameterName = $parameterName === 'tenant' ? 'tenant' : $parameterName;
                        $parameters = [$parameterName => $parameters];
                    } else {
                        $parameters = ['id' => $parameters];
                    }
                }
            } else {
                $parameters = [$parameters];
            }
        }
        
        // Ensure parameters is an array
        if (!is_array($parameters)) {
            $parameters = [];
        }

        // Jika tidak ada tenant saat ini (dipanggil dari konteks publik/non-tenant),
        // jangan paksa prefix dan jangan suntik parameter tenant; fallback ke route() biasa.
        if (!$tenant) {
            // Untuk route tenant yang memerlukan parameter tenant, coba ambil dari request
            if (strpos($name, 'tenant.') === 0) {
                $request = app('request');
                $tenantParam = $request->route('tenant');
                if ($tenantParam) {
                    $parameters = array_merge(['tenant' => $tenantParam], $parameters);
                } else {
                    // Fallback: coba ambil dari user jika user ter-authenticate
                    if (auth()->check() && auth()->user()->tenant) {
                        $parameters = array_merge(['tenant' => auth()->user()->tenant->npsn], $parameters);
                    } else {
                        throw new \Exception("Missing required parameter 'tenant' for route '{$name}'");
                    }
                }
            }
            return route($name, $parameters, $absolute);
        }

        // Inject parameter tenant
        $parameters = array_merge(['tenant' => $tenant->npsn], $parameters);

        // Pastikan nama route memuat prefix tenant hanya jika tenant tersedia
        if (strpos($name, 'tenant.') !== 0) {
            $name = 'tenant.' . ltrim($name, '.');
        }

        return route($name, $parameters, $absolute);
    }
}

if (!function_exists('system_setting')) {
    /**
     * Get system setting value
     */
    function system_setting($key, $default = null)
    {
        return \App\Models\SystemSetting::getValue($key, $default);
    }
}

if (!function_exists('system_logo')) {
    /**
     * Get system logo URL
     */
    function system_logo()
    {
        $logo = system_setting('system_logo');
        return $logo ? \Storage::url($logo) : null;
    }
}

if (!function_exists('system_favicon')) {
    /**
     * Get system favicon URL
     */
    function system_favicon()
    {
        $favicon = system_setting('system_favicon');
        return $favicon ? \Storage::url($favicon) : null;
    }
}

if (!function_exists('system_name')) {
    /**
     * Get system name
     */
    function system_name()
    {
        return system_setting('system_name', 'CLASS');
    }
}

if (!function_exists('tenant_logo')) {
    /**
     * Get current tenant logo URL
     */
    function tenant_logo()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        if ($tenant && $tenant->logo) {
            return \Storage::url($tenant->logo);
        }
        return null;
    }
}

if (!function_exists('tenant_favicon')) {
    /**
     * Get current tenant favicon URL
     */
    function tenant_favicon()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        if ($tenant && $tenant->favicon) {
            return \Storage::url($tenant->favicon);
        }
        return null;
    }
}

if (!function_exists('tenant_name')) {
    /**
     * Get current tenant name
     */
    function tenant_name()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        return $tenant ? $tenant->name : 'CLASS';
    }
}

if (!function_exists('tenant_url')) {
    /**
     * Generate a URL with tenant parameter
     */
    function tenant_url($path = '', $parameters = [], $secure = null)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            throw new \Exception('No current tenant found');
        }
        
        $url = url($tenant->npsn . '/' . ltrim($path, '/'), $parameters, $secure);
        
        return $url;
    }
}

if (!function_exists('current_tenant')) {
    /**
     * Get current tenant
     */
    function current_tenant()
    {
        return app(\App\Core\Services\TenantService::class)->getCurrentTenant();
    }
}

if (!function_exists('tenant_has_feature')) {
    /**
     * Check if current tenant has feature
     */
    function tenant_has_feature($featureKey)
    {
        $tenant = current_tenant();
        return $tenant ? $tenant->hasFeature($featureKey) : false;
    }
}

if (!function_exists('tenant_has_module')) {
    /**
     * Check if current tenant has module
     */
    function tenant_has_module($moduleKey)
    {
        $tenant = current_tenant();
        return $tenant ? $tenant->hasModule($moduleKey) : false;
    }
}

if (!function_exists('tenant_has_permission')) {
    /**
     * Check if current tenant has permission
     */
    function tenant_has_permission($moduleKey, $permission)
    {
        $tenant = current_tenant();
        return $tenant ? $tenant->hasModulePermission($moduleKey, $permission) : false;
    }
}

if (!function_exists('tenant')) {
    /**
     * Get current tenant or specific property
     */
    function tenant($property = null)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            throw new \Exception('No current tenant found');
        }
        
        if ($property === null) {
            return $tenant;
        }
        
        return $tenant->$property ?? null;
    }
}

if (!function_exists('tenant_public_route')) {
    /**
     * Generate a URL to a named public route with tenant parameter
     */
    function tenant_public_route($name, $parameters = [], $absolute = true)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        if (!$tenant) {
            throw new \Exception('No current tenant found');
        }
        
        // Handle case where parameters is a single model object
        if (is_object($parameters) && method_exists($parameters, 'getKey')) {
            $parameters = [$parameters];
        }
        
        // Ensure parameters is an array
        if (!is_array($parameters)) {
            $parameters = [];
        }
        
        $parameters = array_merge(['tenant' => $tenant->npsn], $parameters);
        
        return route($name, $parameters, $absolute);
    }
}

if (!function_exists('validate_nik')) {
    /**
     * Validate NIK format (16 digits)
     */
    function validate_nik($nik): bool
    {
        // NIK must be exactly 16 digits
        return preg_match('/^[0-9]{16}$/', $nik);
    }
}

if (!function_exists('validate_nuptk')) {
    /**
     * Validate NUPTK format (16 digits)
     */
    function validate_nuptk($nuptk): bool
    {
        // NUPTK must be exactly 16 digits
        return preg_match('/^[0-9]{16}$/', $nuptk);
    }
}

if (!function_exists('validate_nip')) {
    /**
     * Validate NIP format (18 digits)
     */
    function validate_nip($nip): bool
    {
        // NIP must be exactly 18 digits
        return preg_match('/^[0-9]{18}$/', $nip);
    }
}

if (!function_exists('teacher_has_module_access')) {
    /**
     * Check if current teacher has access to a module
     */
    function teacher_has_module_access(string $moduleCode): bool
    {
        $user = auth()->user();
        
        if (!$user || $user->role !== 'teacher') {
            return false;
        }

        // Super admin dan school admin punya akses penuh
        if (in_array($user->role, ['super_admin', 'school_admin'])) {
            return true;
        }

        $teacher = $user->teacher;
        if (!$teacher) {
            return false;
        }

        // Kepala sekolah punya akses ke semua modul
        if ($teacher->hasAdditionalDuty('kepala_sekolah')) {
            return true;
        }

        return $teacher->hasModuleAccess($moduleCode);
    }
}

if (!function_exists('current_instansi_id')) {
    /**
     * Get current instansi_id from multiple sources
     * 
     * Priority:
     * 1. TenantService (from middleware) - most reliable
     * 2. Authenticated user's instansi_id
     * 3. Session (fallback)
     * 
     * @return int|null
     */
    function current_instansi_id()
    {
        // Try to get from TenantService first (most reliable)
        try {
            $tenantService = app(\App\Core\Services\TenantService::class);
            $tenant = $tenantService->getCurrentTenant();
            if ($tenant) {
                return $tenant->id;
            }
        } catch (\Exception $e) {
            // Service not available, continue to next option
        }

        // Try to get from authenticated user
        if (auth()->check() && auth()->user()->instansi_id) {
            return auth()->user()->instansi_id;
        }

        // Fallback to session
        return session('instansi_id');
    }
}