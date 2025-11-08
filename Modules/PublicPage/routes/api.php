<?php

use Illuminate\Support\Facades\Route;
use Modules\PublicPage\Http\Controllers\PublicPageController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('publicpages', PublicPageController::class)->names('publicpage');
});
