<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AutocompleteController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Autocomplete API Routes
Route::prefix('autocomplete')->name('api.autocomplete.')->middleware(['auth', 'tenant'])->group(function () {
    Route::get('/institutions', [AutocompleteController::class, 'searchInstitutions'])->name('institutions');
    Route::get('/teachers', [AutocompleteController::class, 'searchTeachers'])->name('teachers');
    Route::get('/students', [AutocompleteController::class, 'searchStudents'])->name('students');
    Route::get('/staff', [AutocompleteController::class, 'searchStaff'])->name('staff');
    Route::get('/classrooms', [AutocompleteController::class, 'searchClassrooms'])->name('classrooms');
    Route::get('/rate-limit', [AutocompleteController::class, 'getRateLimitInfo'])->name('rate-limit');
});

// API Documentation Routes
Route::prefix('docs')->name('api.docs.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\DocumentationController::class, 'index'])->name('index');
    Route::get('/openapi', [\App\Http\Controllers\Api\DocumentationController::class, 'openapi'])->name('openapi');
});
