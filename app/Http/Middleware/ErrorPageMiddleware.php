<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ErrorPageMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            return $next($request);
        } catch (HttpException $e) {
            $statusCode = $e->getStatusCode();
            
            // Handle specific error pages
            switch ($statusCode) {
                case 404:
                    // Check if it's a search-related 404
                    if ($request->has('search') || $request->has('q')) {
                        return response()->view('errors.404-search', [], 404);
                    }
                    return response()->view('errors.404', [], 404);
                    
                case 503:
                    // Check if it's maintenance mode
                    if (app()->isDownForMaintenance()) {
                        return response()->view('errors.503-maintenance', [], 503);
                    }
                    return response()->view('errors.503', [], 503);
                    
                default:
                    // Use the default error handling
                    throw $e;
            }
        }
    }
}
