<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class EnvServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register 'env' binding sedini mungkin
        $this->app->instance('env', function_exists('env') ? env('APP_ENV', 'local') : 'local');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}

