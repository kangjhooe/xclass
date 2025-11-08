<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Core\Tenant;
use App\Core\Services\TenantService;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
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
    public function handle(Request $request, Closure $next): Response
    {
        // Resolve tenant dari domain atau parameter
        $tenant = $this->resolveTenant($request);
        
        if (!$tenant) {
            $tenantParam = $request->route('tenant');
            $host = $request->getHost();
            
            // Berikan pesan error yang lebih informatif
            $message = 'Tenant tidak ditemukan';
            
            if ($tenantParam) {
                // Cek apakah tenant ada tapi tidak aktif
                $inactiveTenant = Tenant::where('npsn', $tenantParam)->first();
                if ($inactiveTenant && !$inactiveTenant->is_active) {
                    $message = "Tenant dengan NPSN '{$tenantParam}' ditemukan tetapi tidak aktif. Silakan hubungi administrator.";
                } else {
                    $message = "Tenant dengan NPSN '{$tenantParam}' tidak ditemukan. Pastikan URL yang Anda gunakan benar.";
                }
            }
            
            abort(404, $message);
        }

        // Validasi akses user ke tenant (kecuali super_admin)
        $user = auth()->user();
        if ($user && $user->role !== 'super_admin') {
            // School admin, teacher, student, parent hanya bisa akses tenant mereka sendiri
            if ($user->instansi_id != $tenant->id) {
                abort(403, 'Anda tidak memiliki akses ke tenant ini. Silakan hubungi administrator.');
            }
        }

        // Set tenant ke service container
        $this->tenantService->setCurrentTenant($tenant);
        
        // Set tenant ke request
        $request->attributes->set('tenant', $tenant);
        
        // Set database connection untuk tenant
        $this->setTenantDatabase($tenant);

        return $next($request);
    }

    /**
     * Resolve tenant dari request
     */
    protected function resolveTenant(Request $request): ?Tenant
    {
        $host = $request->getHost();
        
        // Cek apakah ini admin domain (super admin)
        if ($host === config('tenant.domain.admin') || $host === 'localhost' || $host === '127.0.0.1') {
            // Untuk localhost, cek apakah ada tenant parameter
            $tenantParam = $request->route('tenant');
            if ($tenantParam) {
                return Tenant::where('npsn', $tenantParam)
                    ->where('is_active', true)
                    ->first();
            }
            return null; // Admin tidak perlu tenant
        }

        // Cek tenant dari URL path parameter
        $tenantParam = $request->route('tenant');
        if ($tenantParam) {
            return Tenant::where('npsn', $tenantParam)
                ->where('is_active', true)
                ->first();
        }

        // Extract tenant dari subdomain atau domain
        $tenantIdentifier = $this->extractTenantIdentifier($host);
        
        if (!$tenantIdentifier) {
            return null;
        }

        // Cari tenant berdasarkan NPSN atau custom domain
        $tenant = Tenant::where('npsn', $tenantIdentifier)
            ->where('is_active', true)
            ->first();
            
        // Jika tidak ditemukan dengan NPSN, coba cari dengan custom domain
        if (!$tenant) {
            $tenant = Tenant::where('custom_domain', $host)
                ->where('is_active', true)
                ->first();
        }

        return $tenant;
    }

    /**
     * Extract tenant identifier dari host
     */
    protected function extractTenantIdentifier(string $host): ?string
    {
        $mainDomain = config('tenant.domain.main');
        
        // Cek subdomain
        if (str_ends_with($host, '.' . $mainDomain)) {
            $subdomain = str_replace('.' . $mainDomain, '', $host);
            return $subdomain;
        }
        
        // Cek custom domain
        if ($host !== $mainDomain) {
            return $host;
        }
        
        return null;
    }

    /**
     * Set database connection untuk tenant
     */
    protected function setTenantDatabase(Tenant $tenant): void
    {
        // Untuk sementara, tidak perlu set database prefix
        // Karena semua model sudah menggunakan instansi_id
        // config([
        //     'database.connections.tenant' => array_merge(
        //         config('database.connections.mysql'),
        //         [
        //             'database' => config('database.connections.mysql.database'),
        //             'prefix' => 'tenant_' . $tenant->npsn . '_',
        //         ]
        //     )
        // ]);
    }
}
