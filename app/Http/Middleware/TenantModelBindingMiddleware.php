<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Core\Services\TenantService;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class TenantModelBindingMiddleware
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Handle an incoming request.
     * 
     * Middleware ini dijalankan SETELAH tenant middleware untuk melakukan
     * binding parameter {teacher} dan {student} menjadi object model.
     * 
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $route = $request->route();
        
        if (!$route) {
            return $next($request);
        }

        // Ambil tenant aktif - pastikan sudah ter-set oleh TenantMiddleware
        $tenant = $this->tenantService->getCurrentTenant();
        
        if (!$tenant) {
            // Jika tenant tidak ditemukan, lanjutkan saja (bisa jadi route admin)
            // TenantMiddleware sudah menangani validasi tenant
            return $next($request);
        }

        // Binding untuk parameter {teacher}
        if ($route->hasParameter('teacher')) {
            $teacherValue = $route->parameter('teacher');
            
            // Jika sudah instance Teacher, skip binding untuk parameter ini
            if (!($teacherValue instanceof Teacher)) {
                // Pastikan value adalah string (NIK)
                if (!is_string($teacherValue) && !is_numeric($teacherValue)) {
                    throw new \RuntimeException(
                        "Parameter 'teacher' harus berupa string (NIK), tetapi mendapat: " . gettype($teacherValue)
                    );
                }
                
                // Query Teacher berdasarkan NIK dan tenant
                $teacher = $this->resolveTeacher($teacherValue, $tenant);
                
                if (!$teacher) {
                    throw new ModelNotFoundException(
                        "Teacher dengan NIK '{$teacherValue}' tidak ditemukan untuk tenant '{$tenant->npsn}'"
                    );
                }
                
                // CRITICAL: Set parameter ke route dengan cara yang memastikan Laravel menggunakan instance model
                // Gunakan reflection untuk mengakses dan mengubah parameter secara langsung
                $route->setParameter('teacher', $teacher);
                
                // Set juga ke request attributes untuk memastikan akses langsung
                $request->attributes->set('teacher', $teacher);
                
                // Gunakan reflection untuk mengubah originalParameters jika diperlukan
                try {
                    $reflection = new \ReflectionClass($route);
                    if ($reflection->hasProperty('originalParameters')) {
                        $property = $reflection->getProperty('originalParameters');
                        $property->setAccessible(true);
                        $originalParams = $property->getValue($route) ?? [];
                        $originalParams['teacher'] = $teacher;
                        $property->setValue($route, $originalParams);
                    }
                } catch (\Exception $e) {
                    // Ignore reflection errors
                }
            }
        }

        // Binding untuk parameter {student}
        if ($route->hasParameter('student')) {
            $studentValue = $route->parameter('student');
            
            // Jika sudah instance Student, skip binding untuk parameter ini
            if (!($studentValue instanceof Student)) {
                // Pastikan value adalah string (NISN)
                if (!is_string($studentValue) && !is_numeric($studentValue)) {
                    throw new \RuntimeException(
                        "Parameter 'student' harus berupa string (NISN), tetapi mendapat: " . gettype($studentValue)
                    );
                }
                
                // Query Student berdasarkan NISN dan tenant
                $student = $this->resolveStudent($studentValue, $tenant);
                
                if (!$student) {
                    throw new ModelNotFoundException(
                        "Student dengan NISN '{$studentValue}' tidak ditemukan untuk tenant '{$tenant->npsn}'"
                    );
                }
                
                // CRITICAL: Set parameter ke route dengan cara yang memastikan Laravel menggunakan instance model
                // Gunakan reflection untuk mengakses dan mengubah parameter secara langsung
                $route->setParameter('student', $student);
                
                // Set juga ke request attributes untuk memastikan akses langsung
                $request->attributes->set('student', $student);
                
                // Gunakan reflection untuk mengubah originalParameters jika diperlukan
                try {
                    $reflection = new \ReflectionClass($route);
                    if ($reflection->hasProperty('originalParameters')) {
                        $property = $reflection->getProperty('originalParameters');
                        $property->setAccessible(true);
                        $originalParams = $property->getValue($route) ?? [];
                        $originalParams['student'] = $student;
                        $property->setValue($route, $originalParams);
                    }
                } catch (\Exception $e) {
                    // Ignore reflection errors
                }
            }
        }

        return $next($request);
    }

    /**
     * Resolve Teacher berdasarkan NIK dan tenant
     */
    protected function resolveTeacher(string $nik, $tenant): ?Teacher
    {
        // STEP 1: Try direct instansi_id match (primary teacher)
        $teacher = Teacher::where('nik', $nik)
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
                $teacher = Teacher::where('nik', $nik)
                    ->whereIn('id', $teacherIds)
                    ->first();
            }
        }
        
        return $teacher;
    }

    /**
     * Resolve Student berdasarkan NISN dan tenant
     */
    protected function resolveStudent(string $nisn, $tenant): ?Student
    {
        return Student::where('nisn', $nisn)
            ->where('instansi_id', $tenant->id)
            ->first();
    }
}

