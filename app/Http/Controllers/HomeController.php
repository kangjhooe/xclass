<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    /**
     * Show the application home page
     */
    public function index()
    {
        return view('home');
    }

    /**
     * Redirect to appropriate dashboard based on user role
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Redirect berdasarkan role
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
                        $request = request();
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
}
