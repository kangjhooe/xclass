<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Show the login form
     */
    public function showLoginForm()
    {
        return view('auth.login');
    }

    /**
     * Handle login request
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
            
            // Redirect berdasarkan role user
            $user = Auth::user();
            
            switch ($user->role) {
                case 'super_admin':
                    return redirect()->route('admin.dashboard');
                    
                case 'school_admin':
                case 'teacher':
                case 'student':
                case 'parent':
                    // Untuk tenant, redirect ke dashboard tenant
                    // Load tenant relationship if not already loaded
                    if (!$user->relationLoaded('tenant')) {
                        $user->load('tenant');
                    }
                    
                    // Cek apakah user memiliki instansi_id dan tenant aktif
                    if ($user->instansi_id) {
                        $tenant = \App\Models\Core\Tenant::where('id', $user->instansi_id)
                            ->where('is_active', true)
                            ->first();
                        
                        if ($tenant && $tenant->npsn) {
                            // Gunakan request host untuk memastikan URL menggunakan host yang benar
                            $scheme = $request->getScheme();
                            $host = $request->getHost();
                            $port = $request->getPort();
                            $portString = ($port && $port != 80 && $port != 443) ? ":{$port}" : '';
                            $url = "{$scheme}://{$host}{$portString}/{$tenant->npsn}/dashboard";
                            return redirect($url);
                        }
                    }
                    
                    // Jika user tidak memiliki tenant atau tenant tidak aktif, redirect ke home dengan pesan
                    return redirect()->route('home')->with('error', 'Tenant tidak ditemukan atau tidak aktif. Silakan hubungi administrator.');
                    
                default:
                    return redirect()->route('home');
            }
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    /**
     * Handle logout request
     */
    public function logout(Request $request)
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        // Jika logout dari tenant, redirect ke home
        // Jika logout dari admin, redirect ke home
        return redirect()->route('home');
    }
}
