<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Policies\DataPokokPolicy;

/**
 * Check Data Pokok Permission Middleware
 * 
 * Validates user permissions for Data Pokok module
 */
class CheckDataPokokPermission
{
    protected $policy;

    public function __construct(DataPokokPolicy $policy)
    {
        $this->policy = $policy;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user is active
        if (!$user->is_active) {
            abort(403, 'Akun Anda tidak aktif');
        }

        // Check permission
        if (!$this->policy->canPerformAction($user, $permission)) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses fitur ini');
        }

        return $next($request);
    }
}