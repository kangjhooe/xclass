<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CacheService;
use App\Services\RateLimitService;
use App\Services\SecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Core\Services\TenantService;

/**
 * Autocomplete API Controller
 * 
 * Provides autocomplete endpoints for Data Pokok entities
 */
class AutocompleteController extends Controller
{
    protected $cacheService;
    protected $rateLimitService;
    protected $securityService;
    protected $tenantService;

    public function __construct(
        CacheService $cacheService,
        RateLimitService $rateLimitService,
        SecurityService $securityService,
        TenantService $tenantService
    ) {
        $this->cacheService = $cacheService;
        $this->rateLimitService = $rateLimitService;
        $this->securityService = $securityService;
        $this->tenantService = $tenantService;
    }

    /**
     * Search institutions
     */
    public function searchInstitutions(Request $request)
    {
        // Check rate limit
        $rateLimit = $this->rateLimitService->checkSearchLimit($request);
        if (!$rateLimit['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $rateLimit['message'],
            ], 429);
        }

        // Check permission
        if (!$this->securityService->canAccessResource('institutions', 'read')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $query = $request->get('q', '');
        $limit = min($request->get('limit', 10), 50);

        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        try {
            $results = $this->cacheService->getSearchResults($query, 'institutions', $limit);
            
            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mencari data',
            ], 500);
        }
    }

    /**
     * Search teachers
     */
    public function searchTeachers(Request $request)
    {
        // Check rate limit
        $rateLimit = $this->rateLimitService->checkSearchLimit($request);
        if (!$rateLimit['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $rateLimit['message'],
            ], 429);
        }

        // Check permission
        if (!$this->securityService->canAccessResource('teachers', 'read')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $query = $request->get('q', '');
        $limit = min($request->get('limit', 10), 50);

        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        try {
            $results = $this->cacheService->getSearchResults($query, 'teachers', $limit);
            
            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mencari data',
            ], 500);
        }
    }

    /**
     * Search students
     */
    public function searchStudents(Request $request)
    {
        // Check rate limit
        $rateLimit = $this->rateLimitService->checkSearchLimit($request);
        if (!$rateLimit['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $rateLimit['message'],
            ], 429);
        }

        // Check permission
        if (!$this->securityService->canAccessResource('students', 'read')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $query = $request->get('q', '');
        $limit = min($request->get('limit', 10), 50);

        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        try {
            $results = $this->cacheService->getSearchResults($query, 'students', $limit);
            
            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mencari data',
            ], 500);
        }
    }

    /**
     * Search staff
     */
    public function searchStaff(Request $request)
    {
        // Check rate limit
        $rateLimit = $this->rateLimitService->checkSearchLimit($request);
        if (!$rateLimit['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $rateLimit['message'],
            ], 429);
        }

        // Check permission
        if (!$this->securityService->canAccessResource('staff', 'read')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $query = $request->get('q', '');
        $limit = min($request->get('limit', 10), 50);

        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        try {
            $results = $this->cacheService->getSearchResults($query, 'staff', $limit);
            
            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mencari data',
            ], 500);
        }
    }

    /**
     * Search classrooms
     */
    public function searchClassrooms(Request $request)
    {
        // Check rate limit
        $rateLimit = $this->rateLimitService->checkSearchLimit($request);
        if (!$rateLimit['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $rateLimit['message'],
            ], 429);
        }

        // Check permission
        if (!$this->securityService->canAccessResource('classrooms', 'read')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $query = $request->get('q', '');
        $limit = min($request->get('limit', 10), 50);

        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        try {
            $results = $this->cacheService->getSearchResults($query, 'classrooms', $limit);
            
            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mencari data',
            ], 500);
        }
    }

    /**
     * Get rate limit info
     */
    public function getRateLimitInfo(Request $request)
    {
        $key = 'search:' . $request->ip() . ':' . auth()->id();
        $info = $this->rateLimitService->getRateLimitInfo($key);
        
        return response()->json([
            'success' => true,
            'data' => $info,
        ]);
    }
}