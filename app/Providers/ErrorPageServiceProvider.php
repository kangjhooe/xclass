<?php

namespace App\Providers;

use App\Helpers\ErrorPageHelper;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

class ErrorPageServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register error page configuration
        $this->mergeConfigFrom(
            __DIR__.'/../../config/error-pages.php',
            'error-pages'
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $registerComposer = function () {
            View::composer('errors.*', function ($view) {
                $view->with([
                    'contactInfo' => ErrorPageHelper::getContactInfo(),
                    'appName' => config('app.name', 'CLASS'),
                    'appUrl' => config('app.url'),
                ]);
            });
        };

        if (app()->bound('view')) {
            $registerComposer();
        } else {
            app()->booted($registerComposer);
        }
    }
}
