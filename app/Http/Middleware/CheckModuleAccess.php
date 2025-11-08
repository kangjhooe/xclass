<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk check akses modul berdasarkan additional duties
 * 
 * Usage: Route::middleware('module.access:counseling')->group(...)
 */
class CheckModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$moduleCodes): Response
    {
        $user = auth()->user();
        
        if (!$user) {
            abort(401, 'Anda harus login terlebih dahulu');
        }

        // Super admin dan school admin punya akses penuh
        if (in_array($user->role, ['super_admin', 'school_admin'])) {
            return $next($request);
        }

        // Untuk teacher, check melalui additional duties
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            
            if (!$teacher) {
                abort(403, 'Data guru tidak ditemukan');
            }

            // Kepala sekolah punya akses ke semua modul
            if ($teacher->hasAdditionalDuty('kepala_sekolah')) {
                return $next($request);
            }

            // Check apakah teacher punya akses ke salah satu modul yang diminta
            $hasAccess = false;
            foreach ($moduleCodes as $moduleCode) {
                if ($teacher->hasModuleAccess($moduleCode)) {
                    $hasAccess = true;
                    break;
                }
            }

            if (!$hasAccess) {
                $moduleNames = implode(', ', $moduleCodes);
                abort(403, "Anda tidak memiliki akses ke modul: {$moduleNames}. Hubungi admin untuk menambahkan tugas tambahan yang sesuai.");
            }
        } else {
            // Role lain belum dihandle, bisa dikembangkan lebih lanjut
            abort(403, 'Akses ditolak');
        }

        return $next($request);
    }
}
