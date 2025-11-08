<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Error Pages Test Routes
|--------------------------------------------------------------------------
|
| These routes are for testing error pages during development.
| Remove these routes in production.
|
*/

if (app()->environment('local', 'testing')) {
    Route::prefix('test-errors')->group(function () {
        Route::get('/404', function () {
            abort(404);
        });
        
        Route::get('/403', function () {
            abort(403);
        });
        
        Route::get('/401', function () {
            abort(401);
        });
        
        Route::get('/500', function () {
            abort(500);
        });
        
        Route::get('/502', function () {
            abort(502);
        });
        
        Route::get('/503', function () {
            abort(503);
        });
        
        Route::get('/419', function () {
            abort(419);
        });
        
        Route::get('/429', function () {
            abort(429);
        });
        
        Route::get('/search-404', function () {
            return redirect()->to('/test-errors/404?search=test');
        });
    });
}
