<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ErrorPagesController extends Controller
{
    /**
     * Display error pages status.
     */
    public function status()
    {
        return view('admin.error-pages-status');
    }
    
    /**
     * Display error pages preview.
     */
    public function preview()
    {
        return view('admin.error-pages-preview');
    }
    
    /**
     * Display error pages statistics.
     */
    public function stats()
    {
        return view('admin.error-pages-stats');
    }
    
    /**
     * Display error pages configuration.
     */
    public function configPage()
    {
        return view('admin.error-pages-config');
    }
    
    /**
     * Test specific error page.
     */
    public function test($code)
    {
        if (!app()->environment('local', 'testing')) {
            abort(404);
        }
        
        $allowedCodes = [401, 403, 404, 419, 429, 500, 502, 503];
        
        if (!in_array($code, $allowedCodes)) {
            abort(404);
        }
        
        abort($code);
    }
    
    /**
     * Get error pages configuration.
     */
    public function config()
    {
        $config = [
            'pages' => config('error-pages.pages', []),
            'maintenance' => config('error-pages.maintenance', []),
            'settings' => config('error-pages.settings', []),
        ];
        
        return response()->json($config);
    }
}
