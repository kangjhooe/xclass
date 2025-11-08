<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Core\Services\TenantService;

/**
 * Cache Service
 * 
 * Handles caching for Data Pokok module
 */
class CacheService
{
    protected $tenantService;
    protected $cachePrefix = 'data_pokok_';
    protected $defaultTtl = 3600; // 1 hour

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Get cache key with tenant prefix
     */
    protected function getCacheKey(string $key): string
    {
        $tenant = $this->tenantService->getCurrentTenant();
        return $this->cachePrefix . $tenant->id . '_' . $key;
    }

    /**
     * Cache dashboard statistics
     */
    public function getDashboardStats(): array
    {
        $cacheKey = $this->getCacheKey('dashboard_stats');
        
        return Cache::remember($cacheKey, $this->defaultTtl, function () {
            $tenant = $this->tenantService->getCurrentTenant();
            
            return [
                'total_institutions' => DB::table('institutions')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'total_teachers' => DB::table('teachers')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'total_students' => DB::table('students')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'total_staff' => DB::table('staff')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'total_classrooms' => DB::table('class_rooms')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'recent_activities' => DB::table('activity_logs')
                    ->where('tenant_id', $tenant->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(),
            ];
        });
    }

    /**
     * Cache entity counts
     */
    public function getEntityCounts(): array
    {
        $cacheKey = $this->getCacheKey('entity_counts');
        
        return Cache::remember($cacheKey, $this->defaultTtl, function () {
            $tenant = $this->tenantService->getCurrentTenant();
            
            return [
                'institutions' => DB::table('institutions')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'teachers' => DB::table('teachers')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'students' => DB::table('students')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'staff' => DB::table('staff')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
                
                'classrooms' => DB::table('class_rooms')
                    ->where('instansi_id', $tenant->id)
                    ->count(),
            ];
        });
    }

    /**
     * Cache search results
     */
    public function getSearchResults(string $query, string $entity, int $limit = 10): array
    {
        $cacheKey = $this->getCacheKey("search_{$entity}_" . md5($query));
        
        return Cache::remember($cacheKey, 300, function () use ($query, $entity, $limit) {
            $tenant = $this->tenantService->getCurrentTenant();
            
            $table = $this->getEntityTable($entity);
            if (!$table) {
                return [];
            }
            
            return DB::table($table)
                ->where('instansi_id', $tenant->id)
                ->where(function($q) use ($query, $entity) {
                    $searchFields = $this->getSearchFields($entity);
                    foreach ($searchFields as $field) {
                        $q->orWhere($field, 'like', "%{$query}%");
                    }
                })
                ->limit($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * Cache export data
     */
    public function getExportData(string $entity, array $filters = []): array
    {
        $cacheKey = $this->getCacheKey("export_{$entity}_" . md5(serialize($filters)));
        
        return Cache::remember($cacheKey, 1800, function () use ($entity, $filters) {
            $tenant = $this->tenantService->getCurrentTenant();
            $table = $this->getEntityTable($entity);
            
            if (!$table) {
                return [];
            }
            
            $query = DB::table($table)->where('instansi_id', $tenant->id);
            
            // Apply filters
            foreach ($filters as $field => $value) {
                if ($value !== null && $value !== '') {
                    $query->where($field, 'like', "%{$value}%");
                }
            }
            
            return $query->get()->toArray();
        });
    }

    /**
     * Clear cache for specific entity
     */
    public function clearEntityCache(string $entity): void
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $patterns = [
            $this->cachePrefix . $tenant->id . '_dashboard_stats',
            $this->cachePrefix . $tenant->id . '_entity_counts',
            $this->cachePrefix . $tenant->id . "_search_{$entity}_*",
            $this->cachePrefix . $tenant->id . "_export_{$entity}_*",
        ];
        
        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }
    }

    /**
     * Clear all cache for current tenant
     */
    public function clearAllCache(): void
    {
        $tenant = $this->tenantService->getCurrentTenant();
        $pattern = $this->cachePrefix . $tenant->id . '_*';
        
        // Note: This is a simplified approach. In production, you might want to use Redis with pattern matching
        Cache::flush();
    }

    /**
     * Get entity table name
     */
    protected function getEntityTable(string $entity): ?string
    {
        $tables = [
            'institutions' => 'institutions',
            'teachers' => 'teachers',
            'students' => 'students',
            'staff' => 'staff',
            'classrooms' => 'class_rooms',
        ];
        
        return $tables[$entity] ?? null;
    }

    /**
     * Get search fields for entity
     */
    protected function getSearchFields(string $entity): array
    {
        $fields = [
            'institutions' => ['name', 'npsn', 'address'],
            'teachers' => ['name', 'nip', 'email'],
            'students' => ['name', 'nis', 'nisn'],
            'staff' => ['name', 'nip', 'position'],
            'classrooms' => ['name', 'level'],
        ];
        
        return $fields[$entity] ?? ['name'];
    }

    /**
     * Cache API responses
     */
    public function cacheApiResponse(string $endpoint, array $params, $data, int $ttl = null): void
    {
        $cacheKey = $this->getCacheKey('api_' . md5($endpoint . serialize($params)));
        Cache::put($cacheKey, $data, $ttl ?? $this->defaultTtl);
    }

    /**
     * Get cached API response
     */
    public function getCachedApiResponse(string $endpoint, array $params)
    {
        $cacheKey = $this->getCacheKey('api_' . md5($endpoint . serialize($params)));
        return Cache::get($cacheKey);
    }

    /**
     * Cache user permissions
     */
    public function cacheUserPermissions(int $userId): array
    {
        $cacheKey = $this->getCacheKey("user_permissions_{$userId}");
        
        return Cache::remember($cacheKey, 1800, function () use ($userId) {
            $user = \App\Models\User::find($userId);
            if (!$user) {
                return [];
            }
            
            return \App\Helpers\RbacHelper::getAllPermissions($user);
        });
    }

    /**
     * Clear user permissions cache
     */
    public function clearUserPermissionsCache(int $userId): void
    {
        $cacheKey = $this->getCacheKey("user_permissions_{$userId}");
        Cache::forget($cacheKey);
    }
}
