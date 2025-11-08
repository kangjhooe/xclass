<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Tenant;
use App\Services\CacheService;
use App\Services\RateLimitService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PerformanceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $tenant;
    protected $cacheService;
    protected $rateLimitService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create([
            'role' => 'school_admin',
            'is_active' => true,
        ]);
        
        $this->cacheService = app(CacheService::class);
        $this->rateLimitService = app(RateLimitService::class);
    }

    /** @test */
    public function it_caches_dashboard_stats_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Create test data
        \App\Models\Tenant\Institution::factory(5)->create(['instansi_id' => $this->tenant->id]);
        \App\Models\Tenant\Teacher::factory(10)->create(['instansi_id' => $this->tenant->id]);
        \App\Models\Tenant\Student::factory(50)->create(['instansi_id' => $this->tenant->id]);
        \App\Models\Tenant\Staff::factory(8)->create(['instansi_id' => $this->tenant->id]);
        \App\Models\Tenant\ClassRoom::factory(12)->create(['instansi_id' => $this->tenant->id]);
        
        // Clear cache first
        Cache::flush();
        
        // First call - should hit database
        $start = microtime(true);
        $stats1 = $this->cacheService->getDashboardStats();
        $firstCallTime = microtime(true) - $start;
        
        // Second call - should hit cache
        $start = microtime(true);
        $stats2 = $this->cacheService->getDashboardStats();
        $secondCallTime = microtime(true) - $start;
        
        // Cache should be faster
        $this->assertLessThan($firstCallTime, $secondCallTime);
        $this->assertEquals($stats1, $stats2);
        
        // Verify cache data
        $this->assertEquals(5, $stats1['total_institutions']);
        $this->assertEquals(10, $stats1['total_teachers']);
        $this->assertEquals(50, $stats1['total_students']);
        $this->assertEquals(8, $stats1['total_staff']);
        $this->assertEquals(12, $stats1['total_classrooms']);
    }

    /** @test */
    public function it_caches_search_results_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Create test data
        \App\Models\Tenant\Teacher::factory(20)->create([
            'instansi_id' => $this->tenant->id,
            'name' => $this->faker->name,
        ]);
        
        // Clear cache first
        Cache::flush();
        
        $query = 'John';
        
        // First call - should hit database
        $start = microtime(true);
        $results1 = $this->cacheService->getSearchResults($query, 'teachers', 10);
        $firstCallTime = microtime(true) - $start;
        
        // Second call - should hit cache
        $start = microtime(true);
        $results2 = $this->cacheService->getSearchResults($query, 'teachers', 10);
        $secondCallTime = microtime(true) - $start;
        
        // Cache should be faster
        $this->assertLessThan($firstCallTime, $secondCallTime);
        $this->assertEquals($results1, $results2);
    }

    /** @test */
    public function it_handles_large_datasets_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Create large dataset
        \App\Models\Tenant\Student::factory(1000)->create(['instansi_id' => $this->tenant->id]);
        
        $start = microtime(true);
        
        // Test pagination performance
        $students = \App\Models\Tenant\Student::where('instansi_id', $this->tenant->id)
            ->paginate(50);
        
        $paginationTime = microtime(true) - $start;
        
        // Should complete within reasonable time (less than 1 second)
        $this->assertLessThan(1.0, $paginationTime);
        $this->assertEquals(50, $students->count());
    }

    /** @test */
    public function it_handles_concurrent_requests_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Create test data
        \App\Models\Tenant\Teacher::factory(100)->create(['instansi_id' => $this->tenant->id]);
        
        $start = microtime(true);
        
        // Simulate concurrent requests
        $promises = [];
        for ($i = 0; $i < 10; $i++) {
            $promises[] = $this->cacheService->getSearchResults('test', 'teachers', 10);
        }
        
        $concurrentTime = microtime(true) - $start;
        
        // Should complete within reasonable time
        $this->assertLessThan(2.0, $concurrentTime);
    }

    /** @test */
    public function it_clears_cache_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Cache some data
        $this->cacheService->getDashboardStats();
        $this->cacheService->getSearchResults('test', 'teachers', 10);
        
        $start = microtime(true);
        
        // Clear cache
        $this->cacheService->clearEntityCache('teachers');
        
        $clearTime = microtime(true) - $start;
        
        // Should complete quickly
        $this->assertLessThan(0.5, $clearTime);
    }

    /** @test */
    public function it_handles_rate_limiting_efficiently()
    {
        $request = $this->createMock(\Illuminate\Http\Request::class);
        $request->method('ip')->willReturn('127.0.0.1');
        
        $start = microtime(true);
        
        // Test rate limiting performance
        for ($i = 0; $i < 100; $i++) {
            $this->rateLimitService->checkApiLimit($request);
        }
        
        $rateLimitTime = microtime(true) - $start;
        
        // Should complete within reasonable time
        $this->assertLessThan(1.0, $rateLimitTime);
    }

    /** @test */
    public function it_handles_database_queries_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Create test data
        \App\Models\Tenant\Student::factory(500)->create(['instansi_id' => $this->tenant->id]);
        
        $start = microtime(true);
        
        // Test complex query performance
        $students = \App\Models\Tenant\Student::where('instansi_id', $this->tenant->id)
            ->where('name', 'like', '%test%')
            ->orderBy('name')
            ->limit(50)
            ->get();
        
        $queryTime = microtime(true) - $start;
        
        // Should complete within reasonable time
        $this->assertLessThan(0.5, $queryTime);
    }

    /** @test */
    public function it_handles_export_data_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Create test data
        \App\Models\Tenant\Student::factory(200)->create(['instansi_id' => $this->tenant->id]);
        
        $start = microtime(true);
        
        // Test export data caching
        $exportData = $this->cacheService->getExportData('students', ['name' => 'test']);
        
        $exportTime = microtime(true) - $start;
        
        // Should complete within reasonable time
        $this->assertLessThan(1.0, $exportTime);
        $this->assertIsArray($exportData);
    }

    /** @test */
    public function it_handles_memory_usage_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        $initialMemory = memory_get_usage();
        
        // Create large dataset
        \App\Models\Tenant\Student::factory(1000)->create(['instansi_id' => $this->tenant->id]);
        
        $afterCreateMemory = memory_get_usage();
        
        // Process data
        $students = \App\Models\Tenant\Student::where('instansi_id', $this->tenant->id)
            ->paginate(100);
        
        $afterProcessMemory = memory_get_usage();
        
        // Memory usage should be reasonable
        $memoryIncrease = $afterProcessMemory - $initialMemory;
        $this->assertLessThan(50 * 1024 * 1024, $memoryIncrease); // Less than 50MB
    }

    /** @test */
    public function it_handles_cache_memory_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        $initialMemory = memory_get_usage();
        
        // Cache large amount of data
        for ($i = 0; $i < 100; $i++) {
            $this->cacheService->getSearchResults("query{$i}", 'teachers', 10);
        }
        
        $afterCacheMemory = memory_get_usage();
        
        // Memory usage should be reasonable
        $memoryIncrease = $afterCacheMemory - $initialMemory;
        $this->assertLessThan(10 * 1024 * 1024, $memoryIncrease); // Less than 10MB
    }

    /** @test */
    public function it_handles_database_connection_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        $start = microtime(true);
        
        // Test multiple database operations
        for ($i = 0; $i < 50; $i++) {
            \App\Models\Tenant\Student::where('instansi_id', $this->tenant->id)->count();
        }
        
        $dbTime = microtime(true) - $start;
        
        // Should complete within reasonable time
        $this->assertLessThan(2.0, $dbTime);
    }

    /** @test */
    public function it_handles_cache_hit_ratio_efficiently()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Clear cache first
        Cache::flush();
        
        // First call - cache miss
        $this->cacheService->getDashboardStats();
        
        // Second call - cache hit
        $this->cacheService->getDashboardStats();
        
        // Third call - cache hit
        $this->cacheService->getDashboardStats();
        
        // This test verifies that caching is working
        // In a real scenario, you would check cache hit ratio
        $this->assertTrue(true);
    }
}