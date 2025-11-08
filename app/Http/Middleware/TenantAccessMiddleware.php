<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Core\Services\TenantService;
use Symfony\Component\HttpFoundation\Response;

class TenantAccessMiddleware
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $type, string $key = null): Response
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
        }

        // Get authenticated user
        $user = auth()->user();
        
        // Super admin needs approved access to tenant
        if ($user && $user->role === 'super_admin') {
            $access = \App\Models\SuperAdminTenantAccess::where('user_id', $user->id)
                ->where('tenant_id', $tenant->id)
                ->where('status', 'approved')
                ->first();
            
            if ($access && $access->isActive()) {
                // Super admin has approved and active access, grant full access like school_admin
                return $next($request);
            } else {
                // Super admin doesn't have access, redirect to request access page
                if ($request->expectsJson()) {
                    abort(403, 'Anda tidak memiliki izin akses ke tenant ini. Silakan minta izin terlebih dahulu.');
                }
                return redirect()->route('admin.super-admin-access.index')
                    ->with('error', 'Anda tidak memiliki izin akses ke tenant ini. Silakan minta izin terlebih dahulu.');
            }
        }

        // Cek akses berdasarkan tipe (feature atau module)
        if ($type === 'feature' && $key) {
            // Semua user termasuk school_admin harus mengecek fitur
            if (!$tenant->hasFeature($key)) {
                abort(403, 'Akses ke fitur ini tidak diizinkan untuk tenant Anda');
            }
        } elseif ($type === 'module' && $key) {
            // Core modules yang selalu tersedia untuk semua tenant
            $coreModules = ['students', 'teachers', 'classes', 'subjects', 'schedules', 'attendances', 'grades', 'users', 'settings', 'academic-years', 'announcements', 'events', 'additional-duties'];
            
            // School admin (admin tenant) has full access to all modules for their tenant
            if ($user && $user->role === 'school_admin' && $user->instansi_id == $tenant->id) {
                // Core modules selalu tersedia untuk school_admin
                if (in_array($key, $coreModules)) {
                    return $next($request);
                }
                // Untuk modul non-core, tetap cek apakah tersedia
                if (!$tenant->hasModule($key)) {
                    abort(403, 'Akses ke modul ini tidak diizinkan untuk tenant Anda');
                }
                return $next($request);
            }
            
            // Untuk user selain school_admin, cek apakah module tersedia untuk tenant
            // Core modules dianggap selalu tersedia jika belum ada di database
            $hasModule = in_array($key, $coreModules) || $tenant->hasModule($key);
            if (!$hasModule) {
                abort(403, 'Akses ke modul ini tidak diizinkan untuk tenant Anda');
            }
            // If user is teacher, check additional duties access
            if ($user && $user->role === 'teacher') {
                $teacher = $user->teacher;
                if ($teacher) {
                    // Check if teacher has access through additional duties
                    // Headmaster (kepala_sekolah) has full access (*)
                    if (!$teacher->hasAdditionalDuty('kepala_sekolah')) {
                        if (!$teacher->hasModuleAccess($key)) {
                            abort(403, 'Anda tidak memiliki akses ke modul ini. Hubungi admin untuk menambahkan tugas tambahan yang sesuai.');
                        }
                    }
                } else {
                    abort(403, 'Data guru tidak ditemukan');
                }
            }
        } elseif ($type === 'permission' && $key) {
            // Format: module_key:permission_name
            $parts = explode(':', $key);
            if (count($parts) !== 2) {
                abort(500, 'Format permission tidak valid');
            }
            
            [$moduleKey, $permission] = $parts;
            if (!$tenant->hasModulePermission($moduleKey, $permission)) {
                abort(403, 'Akses ke permission ini tidak diizinkan untuk tenant Anda');
            }
            
            // If user is teacher, check additional duties permission
            if ($user && $user->role === 'teacher') {
                $teacher = $user->teacher;
                if ($teacher) {
                    // Headmaster has all permissions
                    if (!$teacher->hasAdditionalDuty('kepala_sekolah')) {
                        $accessibleModules = $teacher->getAccessibleModules();
                        $moduleAccess = $accessibleModules->where('module_code', $moduleKey)->first();
                        
                        if (!$moduleAccess || !$moduleAccess->hasPermission($permission)) {
                            abort(403, 'Anda tidak memiliki permission ini untuk modul tersebut.');
                        }
                    }
                }
            }
        }

        return $next($request);
    }
}
