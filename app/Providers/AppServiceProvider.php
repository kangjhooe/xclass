<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Binding env sebagai string value, bukan class
        if (!$this->app->bound('env')) {
            $this->app->instance('env', $this->app->environment());
        }
        
        $this->app->singleton(\App\Core\Services\TenantService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa skema HTTPS di produksi agar URL, asset, dan route menggunakan https
        if (app()->environment('production')) {
            \URL::forceScheme('https');
        }
        
        // Register Student Observer for subscription updates
        \App\Models\Tenant\Student::observe(\App\Observers\StudentObserver::class);
        // Register policies
        \Gate::policy(\App\Models\Tenant\Alumni::class, \App\Policies\Tenant\AlumniPolicy::class);
        
        // Model binding for tenant models
        // IMPORTANT: Route::bind di sini mengambil precedence atas resolveRouteBinding di model
        // Urutan middleware HARUS: web -> auth -> tenant -> SubstituteBindings
        // TenantMiddleware harus dijalankan SEBELUM SubstituteBindings agar tenant tersedia saat binding
        // 
        // CRITICAL: Route::bind HARUS dipanggil SEBELUM route di-load
        // Di Laravel 12, Route::bind di boot() sudah cukup, tapi pastikan tidak ada konflik
        
        // Binding untuk student dan teacher parameter ditangani oleh TenantModelBindingMiddleware
        // Route::bind di sini mencoba melakukan binding jika tenant sudah tersedia,
        // jika belum, akan melewatkan value string ke middleware untuk di-bind
        
        Route::bind('student', function ($value, $route) {
            // Jika sudah instance Student, return langsung
            if ($value instanceof \App\Models\Tenant\Student) {
                return $value;
            }
            
            // Coba ambil tenant dari service (sudah di-set oleh TenantMiddleware)
            $tenantService = app(\App\Core\Services\TenantService::class);
            $tenant = $tenantService->getCurrentTenant();
            
            // Jika tenant belum tersedia, coba ambil dari route parameter
            if (!$tenant && $route) {
                $tenantParam = $route->parameter('tenant');
                if ($tenantParam) {
                    if (is_string($tenantParam)) {
                        $tenant = $tenantService->getTenantByNpsn($tenantParam);
                    } elseif ($tenantParam instanceof \App\Models\Core\Tenant) {
                        $tenant = $tenantParam;
                    }
                    
                    if ($tenant) {
                        $tenantService->setCurrentTenant($tenant);
                    }
                }
            }
            
            // CRITICAL: Jika tenant masih belum tersedia, coba ambil langsung dari URL path
            // Ini diperlukan karena SubstituteBindings mungkin berjalan sebelum TenantMiddleware
            // Pattern route: {tenant}/students/{student} - NPSN ada di segment pertama
            if (!$tenant) {
                try {
                    $request = app('request');
                    if ($request && $route) {
                        // Coba ambil dari route parameter dulu (lebih reliable)
                        $tenantParam = $route->parameter('tenant');
                        if ($tenantParam && is_string($tenantParam) && preg_match('/^\d{8}$/', $tenantParam)) {
                            $tenant = $tenantService->getTenantByNpsn($tenantParam);
                            if ($tenant) {
                                $tenantService->setCurrentTenant($tenant);
                            }
                        }
                        
                        // Jika masih belum dapat, ambil dari URL path
                        if (!$tenant) {
                            $path = trim($request->path(), '/');
                            $pathSegments = explode('/', $path);
                            
                            // NPSN biasanya adalah segment pertama dari path (setelah root)
                            // Contoh: "12345678/students/1234567890" -> segment[0] = "12345678"
                            if (!empty($pathSegments[0]) && preg_match('/^\d{8}$/', $pathSegments[0])) {
                                $tenant = $tenantService->getTenantByNpsn($pathSegments[0]);
                                if ($tenant) {
                                    $tenantService->setCurrentTenant($tenant);
                                }
                            }
                        }
                    }
                } catch (\Exception $e) {
                    // Ignore errors saat mengambil tenant dari URL
                    \Log::debug("Error mengambil tenant dari URL di Route::bind: " . $e->getMessage());
                }
            }
            
            // CRITICAL: Jika tenant tersedia, lakukan binding langsung
            // JANGAN mengembalikan string jika tenant sudah tersedia - selalu coba resolve model
            if ($tenant) {
                $student = \App\Models\Tenant\Student::where('nisn', $value)
                    ->where('instansi_id', $tenant->id)
                    ->first();
                
                if ($student) {
                    return $student;
                }
                
                throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
                    "Student dengan NISN '{$value}' tidak ditemukan untuk tenant '{$tenant->npsn}'"
                );
            }
            
            // Jika tenant belum tersedia, pass-through value string
            // Middleware akan melakukan binding setelah tenant tersedia
            return $value;
        });
        
        // Binding untuk parameter {class} (ClassRoom)
        Route::bind('class', function ($value, $route) {
            // Jika sudah instance ClassRoom, return langsung
            if ($value instanceof \App\Models\Tenant\ClassRoom) {
                return $value;
            }
            
            $tenantService = app(\App\Core\Services\TenantService::class);
            $tenant = $tenantService->getCurrentTenant();
            
            // Jika tenant belum tersedia, coba ambil dari route parameter
            if (!$tenant && $route) {
                $tenantParam = $route->parameter('tenant');
                if ($tenantParam) {
                    if (is_string($tenantParam) && preg_match('/^\d{8}$/', $tenantParam)) {
                        $tenant = $tenantService->getTenantByNpsn($tenantParam);
                        if ($tenant) {
                            $tenantService->setCurrentTenant($tenant);
                        }
                    } elseif ($tenantParam instanceof \App\Models\Core\Tenant) {
                        $tenant = $tenantParam;
                    }
                }
            }
            
            // Jika tenant masih belum tersedia, coba ambil dari URL path
            if (!$tenant) {
                try {
                    $request = app('request');
                    if ($request) {
                        $path = trim($request->path(), '/');
                        $pathSegments = explode('/', $path);
                        
                        if (!empty($pathSegments[0]) && preg_match('/^\d{8}$/', $pathSegments[0])) {
                            $tenant = $tenantService->getTenantByNpsn($pathSegments[0]);
                            if ($tenant) {
                                $tenantService->setCurrentTenant($tenant);
                            }
                        }
                    }
                } catch (\Exception $e) {
                    \Log::debug("Error mengambil tenant dari URL di Route::bind('class'): " . $e->getMessage());
                }
            }
            
            if (!$tenant) {
                throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
                    "Tenant tidak ditemukan untuk route binding class"
                );
            }
            
            // Pastikan value adalah ID kelas, bukan NPSN
            // Jika value adalah 8 digit dan sama dengan NPSN tenant, itu adalah NPSN (bukan ID kelas)
            if (is_string($value) && preg_match('/^\d{8}$/', $value) && $value === $tenant->npsn) {
                \Log::warning('Route::bind("class") received NPSN instead of class ID', [
                    'value' => $value,
                    'tenant_npsn' => $tenant->npsn,
                    'url' => app('request')->fullUrl()
                ]);
                throw new \InvalidArgumentException('Invalid class parameter: received NPSN instead of class ID');
            }
            
            // Query ClassRoom berdasarkan ID dan tenant
            // Coba convert ke integer untuk memastikan valid ID
            $classId = is_numeric($value) ? (int)$value : $value;
            
            $classRoom = \App\Models\Tenant\ClassRoom::where('id', $classId)
                ->where('instansi_id', $tenant->id)
                ->first();
            
            if (!$classRoom) {
                throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
                    "ClassRoom dengan ID '{$value}' tidak ditemukan untuk tenant '{$tenant->npsn}'"
                );
            }
            
            return $classRoom;
        });
        
        Route::bind('teacher', function ($value, $route) {
            // CRITICAL: Jika sudah instance Teacher, return langsung (jangan binding ulang)
            if ($value instanceof \App\Models\Tenant\Teacher) {
                return $value;
            }
            
            // CRITICAL: Pastikan value adalah string (NIK) - karena Teacher menggunakan NIK sebagai route key
            if (!is_string($value) && !is_numeric($value)) {
                \Log::error("Route::bind('teacher') menerima value yang bukan string/numeric", [
                    'value' => $value,
                    'type' => gettype($value),
                    'class' => is_object($value) ? get_class($value) : null
                ]);
                throw new \RuntimeException(
                    "Route::bind('teacher') menerima value yang tidak valid: " . gettype($value)
                );
            }
            
            $tenantService = app(\App\Core\Services\TenantService::class);
            $tenant = null;
            
            // STEP 1: Coba ambil tenant dari service (sudah di-set oleh TenantMiddleware)
            $tenant = $tenantService->getCurrentTenant();
            
            // STEP 2: Jika tenant belum tersedia, coba ambil dari route parameter
            if (!$tenant && $route) {
                $tenantParam = $route->parameter('tenant');
                if ($tenantParam) {
                    if (is_string($tenantParam) && preg_match('/^\d{8}$/', $tenantParam)) {
                        $tenant = $tenantService->getTenantByNpsn($tenantParam);
                        if ($tenant) {
                            $tenantService->setCurrentTenant($tenant);
                        }
                    } elseif ($tenantParam instanceof \App\Models\Core\Tenant) {
                        $tenant = $tenantParam;
                    }
                }
            }
            
            // STEP 3: CRITICAL - Jika tenant masih belum tersedia, ambil langsung dari URL path
            // Ini MUTLAK diperlukan karena SubstituteBindings berjalan SEBELUM TenantMiddleware
            // Pattern route: {tenant}/teachers/{teacher} - NPSN ada di segment pertama
            // Contoh URL: /10816663/teachers/3201010101010001
            if (!$tenant) {
                try {
                    $request = app('request');
                    if ($request) {
                        // Ambil path dari URL: "10816663/teachers/3201010101010001"
                        $path = trim($request->path(), '/');
                        $pathSegments = explode('/', $path);
                        
                        // NPSN adalah segment pertama (8 digit angka)
                        // Contoh: pathSegments[0] = "10816663"
                        if (!empty($pathSegments[0]) && preg_match('/^\d{8}$/', $pathSegments[0])) {
                            $tenant = $tenantService->getTenantByNpsn($pathSegments[0]);
                            if ($tenant) {
                                $tenantService->setCurrentTenant($tenant);
                                \Log::debug("Route::bind('teacher') - Tenant ditemukan dari URL path: {$pathSegments[0]}");
                            }
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning("Route::bind('teacher') - Error mengambil tenant dari URL: " . $e->getMessage());
                }
            }
            
            // CRITICAL: Jika tenant tersedia, lakukan binding langsung
            // JANGAN mengembalikan string jika tenant sudah tersedia - selalu coba resolve model
            if ($tenant) {
                // STEP 1: Try direct instansi_id match (primary teacher)
                $teacher = \App\Models\Tenant\Teacher::where('nik', $value)
                    ->where('instansi_id', $tenant->id)
                    ->first();
                
                // STEP 2: If not found, check teacher_tenants table (branch teachers)
                if (!$teacher) {
                    $teacherIds = \Illuminate\Support\Facades\DB::table('teacher_tenants')
                        ->where('tenant_id', $tenant->id)
                        ->where('is_active', true)
                        ->pluck('teacher_id')
                        ->toArray();
                    
                    if (!empty($teacherIds)) {
                        $teacher = \App\Models\Tenant\Teacher::where('nik', $value)
                            ->whereIn('id', $teacherIds)
                            ->first();
                    }
                }
                
                if ($teacher) {
                    // CRITICAL: Pastikan mengembalikan instance Teacher yang valid
                    if (!($teacher instanceof \App\Models\Tenant\Teacher)) {
                        throw new \RuntimeException(
                            "Route::bind('teacher') harus mengembalikan instance Teacher, tetapi mendapat: " . gettype($teacher)
                        );
                    }
                    return $teacher;
                }
                
                // Jika tenant tersedia tapi teacher tidak ditemukan, throw exception
                throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
                    "Teacher dengan NIK '{$value}' tidak ditemukan untuk tenant '{$tenant->npsn}'"
                );
            }
            
            // HANYA jika tenant benar-benar tidak tersedia, pass-through value string
            // Middleware akan melakukan binding setelah tenant tersedia
            // NOTE: Di Laravel 12 dengan priority middleware, seharusnya tenant sudah tersedia
            \Log::warning("Route::bind('teacher') tidak dapat menemukan tenant untuk NIK: {$value}");
            return $value;
        });
        
        // Explicit binding for nonTeachingStaff parameter
        // This ensures route model binding works correctly with NIK
        Route::bind('nonTeachingStaff', function ($value, $route) {
            // Create Staff model instance to use resolveRouteBinding
            $staffModel = new \App\Models\Tenant\Staff();
            
            // Get tenant from route parameter if available
            $tenantService = app(\App\Core\Services\TenantService::class);
            $tenant = $tenantService->getCurrentTenant();
            
            // If tenant not found, try to get from route parameter
            if (!$tenant && $route) {
                $tenantParam = $route->parameter('tenant');
                if ($tenantParam) {
                    $tenant = $tenantService->getTenantByNpsn($tenantParam);
                    if ($tenant) {
                        $tenantService->setCurrentTenant($tenant);
                    }
                }
            }
            
            if (!$tenant) {
                throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
                    "Tenant tidak ditemukan untuk staff dengan identifier {$value}"
                );
            }
            
            // Try to resolve using NIK first
            try {
                $resolved = $staffModel->resolveRouteBinding($value, 'nik');
                if ($resolved instanceof \App\Models\Tenant\Staff) {
                    return $resolved;
                }
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                // If not found with NIK, try with ID (for backward compatibility)
                if (is_numeric($value)) {
                    $staff = \App\Models\Tenant\Staff::where('id', $value)
                        ->where('instansi_id', $tenant->id)
                        ->first();
                    
                    if ($staff) {
                        return $staff;
                    }
                }
                
                // Re-throw the original exception if ID lookup also fails
                throw $e;
            }
            
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
                "Staff dengan identifier {$value} tidak ditemukan"
            );
        });
    }
}
