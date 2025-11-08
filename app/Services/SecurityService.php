<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Core\Services\TenantService;
use Illuminate\Support\Facades\Log;

/**
 * Security Service
 * 
 * Handles security measures for Data Pokok module
 */
class SecurityService
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Ensure query is scoped to current tenant
     */
    public function scopeToTenant(Builder $query, string $tenantColumn = 'instansi_id'): Builder
    {
        $tenant = $this->tenantService->getCurrentTenant();
        if (!$tenant) {
            throw new \Exception('No tenant context available');
        }
        
        return $query->where($tenantColumn, $tenant->id);
    }

    /**
     * Validate tenant access for model
     */
    public function validateTenantAccess(Model $model, string $tenantColumn = 'instansi_id'): bool
    {
        $tenant = $this->tenantService->getCurrentTenant();
        if (!$tenant) {
            return false;
        }
        
        return $model->{$tenantColumn} == $tenant->id;
    }

    /**
     * Check if user can access resource
     */
    public function canAccessResource(string $resource, string $action, $user = null): bool
    {
        $user = $user ?? auth()->user();
        if (!$user) {
            return false;
        }

        // Check if user is active
        if (!$user->is_active) {
            return false;
        }

        // Check tenant access
        $tenant = $this->tenantService->getCurrentTenant();
        if (!$tenant) {
            return false;
        }

        // Check permissions using RbacHelper
        $permission = "data_pokok:{$action}";
        return \App\Helpers\RbacHelper::hasPermission($user, $permission);
    }

    /**
     * Sanitize input data
     */
    public function sanitizeInput(array $data): array
    {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                // Remove potentially dangerous characters
                $value = strip_tags($value);
                $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            }
            
            $sanitized[$key] = $value;
        }
        
        return $sanitized;
    }

    /**
     * Validate file upload
     */
    public function validateFileUpload($file, array $allowedTypes = [], int $maxSize = 5242880): array
    {
        $errors = [];
        
        if (!$file) {
            $errors[] = 'File tidak ditemukan';
            return $errors;
        }
        
        // Check file size
        if ($file->getSize() > $maxSize) {
            $errors[] = 'Ukuran file terlalu besar. Maksimal ' . ($maxSize / 1024 / 1024) . 'MB';
        }
        
        // Check file type
        if (!empty($allowedTypes)) {
            $extension = $file->getClientOriginalExtension();
            if (!in_array(strtolower($extension), $allowedTypes)) {
                $errors[] = 'Tipe file tidak diizinkan. Hanya ' . implode(', ', $allowedTypes) . ' yang diizinkan';
            }
        }
        
        // Check MIME type
        $mimeType = $file->getMimeType();
        $allowedMimes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'application/pdf',
        ];
        
        if (!in_array($mimeType, $allowedMimes)) {
            $errors[] = 'Tipe MIME file tidak diizinkan';
        }
        
        return $errors;
    }

    /**
     * Log security events
     */
    public function logSecurityEvent(string $event, array $context = []): void
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $user = auth()->user();
        
        $logData = [
            'event' => $event,
            'user_id' => $user ? $user->id : null,
            'tenant_id' => $tenant ? $tenant->id : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'context' => $context,
            'timestamp' => now()->toISOString(),
        ];
        
        Log::channel('security')->info('Security Event', $logData);
    }

    /**
     * Check for suspicious activity
     */
    public function checkSuspiciousActivity(string $action, array $context = []): bool
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }
        
        // Check for rapid requests
        $key = "rate_limit_{$user->id}_{$action}";
        $count = cache()->get($key, 0);
        
        if ($count > 10) { // More than 10 requests in 1 minute
            $this->logSecurityEvent('suspicious_activity', [
                'action' => $action,
                'count' => $count,
                'context' => $context,
            ]);
            
            return true;
        }
        
        // Increment counter
        cache()->put($key, $count + 1, 60);
        
        return false;
    }

    /**
     * Prevent cross-tenant data leaks
     */
    public function preventDataLeak(Model $model, string $tenantColumn = 'instansi_id'): void
    {
        $tenant = $this->tenantService->getCurrentTenant();
        if (!$tenant) {
            throw new \Exception('No tenant context available');
        }
        
        if ($model->{$tenantColumn} != $tenant->id) {
            $this->logSecurityEvent('data_leak_attempt', [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'expected_tenant' => $tenant->id,
                'actual_tenant' => $model->{$tenantColumn},
            ]);
            
            throw new \Exception('Access denied: Cross-tenant data access detected');
        }
    }

    /**
     * Validate export request
     */
    public function validateExportRequest(string $entity, array $filters = []): bool
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }
        
        // Check permission
        if (!\App\Helpers\RbacHelper::canExport($user)) {
            return false;
        }
        
        // Check for suspicious activity
        if ($this->checkSuspiciousActivity('export', ['entity' => $entity, 'filters' => $filters])) {
            return false;
        }
        
        // Validate filters
        $allowedFilters = $this->getAllowedFilters($entity);
        foreach ($filters as $key => $value) {
            if (!in_array($key, $allowedFilters)) {
                $this->logSecurityEvent('invalid_filter', [
                    'entity' => $entity,
                    'filter' => $key,
                    'value' => $value,
                ]);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get allowed filters for entity
     */
    protected function getAllowedFilters(string $entity): array
    {
        $allowedFilters = [
            'institutions' => ['name', 'npsn', 'level'],
            'teachers' => ['name', 'nip', 'subject'],
            'students' => ['name', 'nis', 'class'],
            'staff' => ['name', 'nip', 'position'],
            'classrooms' => ['name', 'level'],
        ];
        
        return $allowedFilters[$entity] ?? [];
    }

    /**
     * Encrypt sensitive data
     */
    public function encryptSensitiveData(string $data): string
    {
        return encrypt($data);
    }

    /**
     * Decrypt sensitive data
     */
    public function decryptSensitiveData(string $encryptedData): string
    {
        return decrypt($encryptedData);
    }

    /**
     * Generate secure token
     */
    public function generateSecureToken(int $length = 32): string
    {
        return bin2hex(random_bytes($length));
    }

    /**
     * Validate CSRF token
     */
    public function validateCsrfToken(string $token): bool
    {
        return hash_equals(session()->token(), $token);
    }

    /**
     * Check if request is from same origin
     */
    public function isSameOrigin(): bool
    {
        $origin = request()->header('Origin');
        $host = request()->getHost();
        
        if (!$origin) {
            return true; // No origin header, assume same origin
        }
        
        $originHost = parse_url($origin, PHP_URL_HOST);
        return $originHost === $host;
    }
}
