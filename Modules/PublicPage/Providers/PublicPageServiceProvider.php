<?php

namespace Modules\PublicPage\Providers;

use Illuminate\Support\ServiceProvider;

class PublicPageServiceProvider extends ServiceProvider
{
    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'publicpage');
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        // Register middleware
        $this->app['router']->aliasMiddleware('publicpage', \Modules\PublicPage\Http\Middleware\PublicPageMiddleware::class);
    }
}