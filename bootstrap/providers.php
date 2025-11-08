<?php

return [
    App\Providers\EnvServiceProvider::class, // Load paling awal untuk binding 'env'
    App\Providers\AppServiceProvider::class,
    App\Providers\AuthServiceProvider::class,
    App\Providers\ErrorPageServiceProvider::class,
];
