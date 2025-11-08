<?php

namespace App\Http\Controllers\PublicPage;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Core\Services\TenantService;

class TenantAuthController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Show the login form untuk tenant
     */
    public function showLoginForm()
    {
        $tenant = $this->tenantService->getCurrentTenant();
        
        if (!$tenant) {
            abort(404, 'Tenant tidak ditemukan');
        }

        // Get tenant profile untuk layout
        $profile = \Modules\PublicPage\Models\TenantProfile::where('instansi_id', $tenant->id)
            ->where('is_active', true)
            ->first();

        if (!$profile) {
            // Jika tidak ada profile, buat profile default dari data tenant
            $profile = (object) [
                'institution_name' => $tenant->name,
                'description' => 'Sekolah ' . $tenant->name,
                'logo' => null,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
                'address' => $tenant->address,
                'website' => $tenant->website,
                'slogan' => null,
                'social_media' => [],
                'contact_info' => ['description' => 'Silakan hubungi kami untuk informasi lebih lanjut.']
            ];
        }

        return view('publicpage::public.auth.login', compact('tenant', 'profile'));
    }

    /**
     * Handle login request untuk tenant
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();
            
            // Update last login
            Auth::user()->update(['last_login_at' => now()]);
            
            // Redirect ke dashboard tenant
            $tenant = $this->tenantService->getCurrentTenant();
            
            if (!$tenant) {
                Auth::logout();
                throw ValidationException::withMessages([
                    'email' => 'Tenant tidak ditemukan.',
                ]);
            }
            
            // Cek apakah user memiliki akses ke tenant ini
            $user = Auth::user();
            if ($user->instansi_id !== $tenant->id && $user->role !== 'super_admin') {
                Auth::logout();
                throw ValidationException::withMessages([
                    'email' => 'Anda tidak memiliki akses ke tenant ini.',
                ]);
            }
            
            return redirect()->route('tenant.dashboard', ['tenant' => $tenant->npsn]);
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    /**
     * Handle logout request untuk tenant
     */
    public function logout(Request $request)
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        // Redirect ke halaman public tenant setelah logout
        $tenant = $this->tenantService->getCurrentTenant();
        if ($tenant) {
            return redirect()->route('public.home', ['tenant' => $tenant->npsn]);
        }
        
        return redirect()->route('home');
    }
}
