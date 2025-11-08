<?php

namespace Modules\ELearning\Providers;

use Illuminate\Support\ServiceProvider;

class ELearningServiceProvider extends ServiceProvider
{
    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'elearning');
        
        // Publish assets
        $this->publishes([
            __DIR__ . '/../resources/assets/css' => public_path('modules/elearning/css'),
        ], 'elearning-assets');
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        // Register services
        $this->app->singleton(\Modules\ELearning\Services\CourseService::class);
        $this->app->singleton(\Modules\ELearning\Services\GradeIntegrationService::class);
    }
}

