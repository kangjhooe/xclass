<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Core\Tenant;
use App\Models\Core\TenantFeature;
use App\Models\Core\TenantModule;
use App\Models\User;
use App\Helpers\TenantAccessHelper;
use App\Core\Services\TenantService;

class TenantAccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test tenant
        $this->tenant = Tenant::create([
            'npsn' => '12345678',
            'name' => 'SMA Test',
            'type_tenant' => 'Sekolah Umum',
            'jenjang' => 'SMA',
            'email' => 'test@school.com',
            'is_active' => true,
        ]);

        // Create test user
        $this->user = User::factory()->create([
            'instansi_id' => $this->tenant->id,
            'role' => 'admin',
        ]);
    }

    /** @test */
    public function tenant_can_have_features()
    {
        $feature = TenantFeature::create([
            'tenant_id' => $this->tenant->id,
            'feature_key' => 'online_payment',
            'feature_name' => 'Pembayaran Online',
            'is_enabled' => true,
            'settings' => ['currency' => 'IDR'],
        ]);

        $this->assertTrue($this->tenant->hasFeature('online_payment'));
        $this->assertFalse($this->tenant->hasFeature('bulk_export'));
    }

    /** @test */
    public function tenant_can_have_modules()
    {
        $module = TenantModule::create([
            'tenant_id' => $this->tenant->id,
            'module_key' => 'ppdb',
            'module_name' => 'PPDB/SPMB',
            'is_enabled' => true,
            'permissions' => ['create', 'read', 'update'],
        ]);

        $this->assertTrue($this->tenant->hasModule('ppdb'));
        $this->assertFalse($this->tenant->hasModule('spp'));
    }

    /** @test */
    public function tenant_can_have_module_permissions()
    {
        $module = TenantModule::create([
            'tenant_id' => $this->tenant->id,
            'module_key' => 'ppdb',
            'module_name' => 'PPDB/SPMB',
            'is_enabled' => true,
            'permissions' => ['create', 'read', 'update'],
        ]);

        $this->assertTrue($this->tenant->hasModulePermission('ppdb', 'create'));
        $this->assertTrue($this->tenant->hasModulePermission('ppdb', 'read'));
        $this->assertFalse($this->tenant->hasModulePermission('ppdb', 'delete'));
    }

    /** @test */
    public function expired_features_are_not_active()
    {
        $feature = TenantFeature::create([
            'tenant_id' => $this->tenant->id,
            'feature_key' => 'online_payment',
            'feature_name' => 'Pembayaran Online',
            'is_enabled' => true,
            'expires_at' => now()->subDay(), // Expired yesterday
        ]);

        $this->assertFalse($this->tenant->hasFeature('online_payment'));
    }

    /** @test */
    public function disabled_features_are_not_active()
    {
        $feature = TenantFeature::create([
            'tenant_id' => $this->tenant->id,
            'feature_key' => 'online_payment',
            'feature_name' => 'Pembayaran Online',
            'is_enabled' => false,
        ]);

        $this->assertFalse($this->tenant->hasFeature('online_payment'));
    }

    /** @test */
    public function tenant_access_helper_works()
    {
        // Mock current tenant
        $tenantService = $this->mock(TenantService::class);
        $tenantService->shouldReceive('getCurrentTenant')->andReturn($this->tenant);
        $this->app->instance(TenantService::class, $tenantService);

        // Create feature
        TenantFeature::create([
            'tenant_id' => $this->tenant->id,
            'feature_key' => 'online_payment',
            'feature_name' => 'Pembayaran Online',
            'is_enabled' => true,
        ]);

        $this->assertTrue(TenantAccessHelper::hasFeature('online_payment'));
        $this->assertFalse(TenantAccessHelper::hasFeature('bulk_export'));
    }

    /** @test */
    public function admin_can_manage_tenant_access()
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $response = $this->actingAs($admin)
            ->get('/admin/tenant-access');

        $response->assertStatus(200);
        $response->assertSee('Manajemen Akses Tenant');
    }

    /** @test */
    public function admin_can_view_tenant_access_details()
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $response = $this->actingAs($admin)
            ->get("/admin/tenant-access/{$this->tenant->id}");

        $response->assertStatus(200);
        $response->assertSee($this->tenant->name);
    }

    /** @test */
    public function admin_can_update_tenant_feature()
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $response = $this->actingAs($admin)
            ->post("/admin/tenant-access/{$this->tenant->id}/feature", [
                'feature_key' => 'online_payment',
                'feature_name' => 'Pembayaran Online',
                'is_enabled' => true,
                'settings' => ['currency' => 'IDR'],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tenant_features', [
            'tenant_id' => $this->tenant->id,
            'feature_key' => 'online_payment',
            'is_enabled' => true,
        ]);
    }

    /** @test */
    public function admin_can_update_tenant_module()
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $response = $this->actingAs($admin)
            ->post("/admin/tenant-access/{$this->tenant->id}/module", [
                'module_key' => 'ppdb',
                'module_name' => 'PPDB/SPMB',
                'is_enabled' => true,
                'permissions' => ['create', 'read', 'update'],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tenant_modules', [
            'tenant_id' => $this->tenant->id,
            'module_key' => 'ppdb',
            'is_enabled' => true,
        ]);
    }

    /** @test */
    public function middleware_blocks_access_to_disabled_module()
    {
        // Create module but disable it
        TenantModule::create([
            'tenant_id' => $this->tenant->id,
            'module_key' => 'ppdb',
            'module_name' => 'PPDB/SPMB',
            'is_enabled' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->get("/{$this->tenant->npsn}/ppdb");

        $response->assertStatus(403);
    }

    /** @test */
    public function middleware_allows_access_to_enabled_module()
    {
        // Create and enable module
        TenantModule::create([
            'tenant_id' => $this->tenant->id,
            'module_key' => 'ppdb',
            'module_name' => 'PPDB/SPMB',
            'is_enabled' => true,
        ]);

        // Mock the PPDB controller response
        $this->mock(\App\Http\Controllers\Tenant\PpdbController::class)
            ->shouldReceive('index')
            ->andReturn(response()->view('tenant.ppdb.index'));

        $response = $this->actingAs($this->user)
            ->get("/{$this->tenant->npsn}/ppdb");

        $response->assertStatus(200);
    }

    /** @test */
    public function middleware_blocks_access_to_disabled_feature()
    {
        // Create feature but disable it
        TenantFeature::create([
            'tenant_id' => $this->tenant->id,
            'feature_key' => 'online_payment',
            'feature_name' => 'Pembayaran Online',
            'is_enabled' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->get("/{$this->tenant->npsn}/spp/payment");

        $response->assertStatus(403);
    }

    /** @test */
    public function bulk_update_works()
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $tenant2 = Tenant::create([
            'npsn' => '87654321',
            'name' => 'SMA Test 2',
            'type_tenant' => 'Sekolah Umum',
            'jenjang' => 'SMA',
            'email' => 'test2@school.com',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->post('/admin/tenant-access/bulk-update', [
                'tenant_ids' => [$this->tenant->id, $tenant2->id],
                'action' => 'enable_features',
                'keys' => ['online_payment', 'bulk_export'],
            ]);

        $response->assertRedirect();

        // Check that features were enabled for both tenants
        $this->assertDatabaseHas('tenant_features', [
            'tenant_id' => $this->tenant->id,
            'feature_key' => 'online_payment',
            'is_enabled' => true,
        ]);

        $this->assertDatabaseHas('tenant_features', [
            'tenant_id' => $tenant2->id,
            'feature_key' => 'online_payment',
            'is_enabled' => true,
        ]);
    }

    /** @test */
    public function tenant_access_summary_works()
    {
        // Create some features and modules
        TenantFeature::create([
            'tenant_id' => $this->tenant->id,
            'feature_key' => 'online_payment',
            'feature_name' => 'Pembayaran Online',
            'is_enabled' => true,
        ]);

        TenantModule::create([
            'tenant_id' => $this->tenant->id,
            'module_key' => 'ppdb',
            'module_name' => 'PPDB/SPMB',
            'is_enabled' => true,
        ]);

        // Mock current tenant
        $tenantService = $this->mock(TenantService::class);
        $tenantService->shouldReceive('getCurrentTenant')->andReturn($this->tenant);
        $this->app->instance(TenantService::class, $tenantService);

        $summary = TenantAccessHelper::getAccessSummary();

        $this->assertArrayHasKey('features', $summary);
        $this->assertArrayHasKey('modules', $summary);
        $this->assertArrayHasKey('subscription', $summary);
        $this->assertContains('online_payment', $summary['features']);
        $this->assertContains('ppdb', $summary['modules']);
    }
}