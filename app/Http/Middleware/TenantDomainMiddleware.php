<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Core\Tenant;
use App\Core\Services\TenantService;
use Symfony\Component\HttpFoundation\Response;

class TenantDomainMiddleware
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
        $host = $request->getHost();
        
        // Skip middleware untuk localhost dan 127.0.0.1
        // Kecuali untuk route yang bisa konflik dengan route utama
        if ($host === 'localhost' || $host === '127.0.0.1') {
            // Untuk localhost, skip middleware untuk menghindari konflik route
            // Route utama (web.php) akan menangani authentication
            return $next($request);
        }
        
        // Resolve tenant dari domain
        $tenant = $this->resolveTenantFromDomain($request);
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
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
     * Resolve tenant dari domain
     */
    protected function resolveTenantFromDomain(Request $request): ?Tenant
    {
        $host = $request->getHost();
        
        // Cek apakah ini admin domain (super admin)
        if ($host === config('tenant.domain.admin')) {
            return null; // Admin tidak perlu tenant
        }

        // Cari tenant berdasarkan custom domain
        $tenant = Tenant::where('custom_domain', $host)
            ->where('is_active', true)
            ->first();
            
        // Jika tidak ditemukan dengan custom domain, coba cari dengan subdomain
        if (!$tenant) {
            $mainDomain = config('tenant.domain.main');
            
            // Cek subdomain
            if (str_ends_with($host, '.' . $mainDomain)) {
                $subdomain = str_replace('.' . $mainDomain, '', $host);
                $tenant = Tenant::where('npsn', $subdomain)
                    ->where('is_active', true)
                    ->first();
            }
        }

        return $tenant;
    }

    /**
     * Set database connection untuk tenant
     */
    protected function setTenantDatabase(Tenant $tenant): void
    {
        // Untuk sementara, tidak perlu set database prefix
        // Karena semua model sudah menggunakan instansi_id
    }
}
