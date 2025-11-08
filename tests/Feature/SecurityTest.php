<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Tenant;
use App\Services\SecurityService;
use App\Services\RateLimitService;
use App\Services\CacheService;

class SecurityTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $tenant;
    protected $securityService;
    protected $rateLimitService;
    protected $cacheService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create([
            'role' => 'school_admin',
            'is_active' => true,
        ]);
        
        $this->securityService = app(SecurityService::class);
        $this->rateLimitService = app(RateLimitService::class);
        $this->cacheService = app(CacheService::class);
    }

    /** @test */
    public function it_validates_tenant_access()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        $institution = \App\Models\Tenant\Institution::factory()->create([
            'instansi_id' => $this->tenant->id,
        ]);
        
        $this->assertTrue($this->securityService->validateTenantAccess($institution));
        
        // Test cross-tenant access
        $otherTenant = Tenant::factory()->create();
        $otherInstitution = \App\Models\Tenant\Institution::factory()->create([
            'instansi_id' => $otherTenant->id,
        ]);
        
        $this->assertFalse($this->securityService->validateTenantAccess($otherInstitution));
    }

    /** @test */
    public function it_prevents_cross_tenant_data_leaks()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        $institution = \App\Models\Tenant\Institution::factory()->create([
            'instansi_id' => $this->tenant->id,
        ]);
        
        // Should not throw exception for same tenant
        $this->securityService->preventDataLeak($institution);
        $this->assertTrue(true);
        
        // Should throw exception for different tenant
        $otherTenant = Tenant::factory()->create();
        $otherInstitution = \App\Models\Tenant\Institution::factory()->create([
            'instansi_id' => $otherTenant->id,
        ]);
        
        $this->expectException(\Exception::class);
        $this->securityService->preventDataLeak($otherInstitution);
    }

    /** @test */
    public function it_validates_file_upload()
    {
        $file = $this->createFakeFile('test.xlsx', 1000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        $errors = $this->securityService->validateFileUpload($file, ['xlsx', 'xls'], 5000);
        $this->assertEmpty($errors);
        
        // Test file too large
        $largeFile = $this->createFakeFile('large.xlsx', 6000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $errors = $this->securityService->validateFileUpload($largeFile, ['xlsx'], 5000);
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('terlalu besar', $errors[0]);
        
        // Test invalid file type
        $invalidFile = $this->createFakeFile('test.txt', 1000, 'text/plain');
        $errors = $this->securityService->validateFileUpload($invalidFile, ['xlsx'], 5000);
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('tidak diizinkan', $errors[0]);
    }

    /** @test */
    public function it_sanitizes_input_data()
    {
        $input = [
            'name' => '<script>alert("xss")</script>John Doe',
            'email' => 'john@example.com',
            'description' => 'Normal description',
        ];
        
        $sanitized = $this->securityService->sanitizeInput($input);
        
        $this->assertEquals('John Doe', $sanitized['name']);
        $this->assertEquals('john@example.com', $sanitized['email']);
        $this->assertEquals('Normal description', $sanitized['description']);
    }

    /** @test */
    public function it_checks_rate_limits()
    {
        $request = $this->createMock(\Illuminate\Http\Request::class);
        $request->method('ip')->willReturn('127.0.0.1');
        
        // Test import rate limit
        $result = $this->rateLimitService->checkImportLimit($request);
        $this->assertTrue($result['allowed']);
        
        // Test export rate limit
        $result = $this->rateLimitService->checkExportLimit($request);
        $this->assertTrue($result['allowed']);
        
        // Test API rate limit
        $result = $this->rateLimitService->checkApiLimit($request);
        $this->assertTrue($result['allowed']);
    }

    /** @test */
    public function it_handles_rate_limit_exceeded()
    {
        $request = $this->createMock(\Illuminate\Http\Request::class);
        $request->method('ip')->willReturn('127.0.0.1');
        
        $key = 'import:127.0.0.1:' . $this->user->id;
        
        // Hit rate limit multiple times
        for ($i = 0; $i < 6; $i++) {
            $this->rateLimitService->hit($key, 1);
        }
        
        $result = $this->rateLimitService->checkImportLimit($request);
        $this->assertFalse($result['allowed']);
        $this->assertStringContainsString('Terlalu banyak', $result['message']);
    }

    /** @test */
    public function it_caches_dashboard_stats()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Create some test data
        \App\Models\Tenant\Institution::factory()->create(['instansi_id' => $this->tenant->id]);
        \App\Models\Tenant\Teacher::factory()->create(['instansi_id' => $this->tenant->id]);
        \App\Models\Tenant\Student::factory()->create(['instansi_id' => $this->tenant->id]);
        
        $stats = $this->cacheService->getDashboardStats();
        
        $this->assertArrayHasKey('total_institutions', $stats);
        $this->assertArrayHasKey('total_teachers', $stats);
        $this->assertArrayHasKey('total_students', $stats);
        $this->assertArrayHasKey('total_staff', $stats);
        $this->assertArrayHasKey('total_classrooms', $stats);
        $this->assertArrayHasKey('recent_activities', $stats);
    }

    /** @test */
    public function it_caches_search_results()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Create test data
        \App\Models\Tenant\Teacher::factory()->create([
            'instansi_id' => $this->tenant->id,
            'name' => 'John Doe',
        ]);
        
        $results = $this->cacheService->getSearchResults('John', 'teachers', 10);
        
        $this->assertIsArray($results);
        $this->assertNotEmpty($results);
    }

    /** @test */
    public function it_clears_cache_on_entity_update()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        // Cache some data
        $this->cacheService->getDashboardStats();
        
        // Clear cache
        $this->cacheService->clearEntityCache('teachers');
        
        // This should not throw an exception
        $this->assertTrue(true);
    }

    /** @test */
    public function it_validates_export_request()
    {
        $this->actingAs($this->user);
        
        // Mock tenant context
        $this->app->instance('tenant', $this->tenant);
        
        $filters = ['name' => 'test'];
        $result = $this->securityService->validateExportRequest('teachers', $filters);
        
        $this->assertTrue($result);
        
        // Test with invalid filter
        $invalidFilters = ['invalid_field' => 'test'];
        $result = $this->securityService->validateExportRequest('teachers', $invalidFilters);
        
        $this->assertFalse($result);
    }

    /** @test */
    public function it_generates_secure_tokens()
    {
        $token1 = $this->securityService->generateSecureToken();
        $token2 = $this->securityService->generateSecureToken();
        
        $this->assertNotEquals($token1, $token2);
        $this->assertEquals(64, strlen($token1)); // 32 bytes = 64 hex chars
        $this->assertEquals(64, strlen($token2));
    }

    /** @test */
    public function it_encrypts_and_decrypts_sensitive_data()
    {
        $originalData = 'sensitive information';
        
        $encrypted = $this->securityService->encryptSensitiveData($originalData);
        $decrypted = $this->securityService->decryptSensitiveData($encrypted);
        
        $this->assertNotEquals($originalData, $encrypted);
        $this->assertEquals($originalData, $decrypted);
    }

    /** @test */
    public function it_validates_csrf_token()
    {
        $validToken = session()->token();
        $invalidToken = 'invalid_token';
        
        $this->assertTrue($this->securityService->validateCsrfToken($validToken));
        $this->assertFalse($this->securityService->validateCsrfToken($invalidToken));
    }

    /** @test */
    public function it_checks_same_origin()
    {
        // Mock request with same origin
        $request = $this->createMock(\Illuminate\Http\Request::class);
        $request->method('header')->with('Origin')->willReturn('http://localhost');
        $request->method('getHost')->willReturn('localhost');
        
        $this->app->instance('request', $request);
        
        $this->assertTrue($this->securityService->isSameOrigin());
        
        // Mock request with different origin
        $request = $this->createMock(\Illuminate\Http\Request::class);
        $request->method('header')->with('Origin')->willReturn('http://malicious.com');
        $request->method('getHost')->willReturn('localhost');
        
        $this->app->instance('request', $request);
        
        $this->assertFalse($this->securityService->isSameOrigin());
    }

    protected function createFakeFile(string $filename, int $size, string $mimeType)
    {
        $file = $this->createMock(\Illuminate\Http\UploadedFile::class);
        $file->method('getClientOriginalName')->willReturn($filename);
        $file->method('getSize')->willReturn($size);
        $file->method('getMimeType')->willReturn($mimeType);
        $file->method('getClientOriginalExtension')->willReturn(pathinfo($filename, PATHINFO_EXTENSION));
        
        return $file;
    }
}