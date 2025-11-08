<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Core\Tenant;
use App\Models\User;
use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use App\Models\MutasiSiswa;
use App\Services\MutasiSiswaService;
use App\Core\Services\TenantService;

/**
 * Mutasi Siswa Test
 * 
 * Tests for student transfer functionality
 */
class MutasiSiswaTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected Tenant $fromTenant;
    protected Tenant $toTenant;
    protected User $user;
    protected Student $student;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test tenants with same educational level
        $this->fromTenant = Tenant::factory()->create([
            'educational_level' => 'SMP'
        ]);
        
        $this->toTenant = Tenant::factory()->create([
            'educational_level' => 'SMP'
        ]);
        
        // Create test user
        $this->user = User::factory()->create();
        
        // Create test student
        $class = ClassRoom::factory()->create([
            'instansi_id' => $this->fromTenant->id
        ]);
        
        $this->student = Student::factory()->create([
            'instansi_id' => $this->fromTenant->id,
            'class_id' => $class->id,
            'status' => 'active'
        ]);
        
        // Set tenant context
        app(TenantService::class)->setCurrentTenant($this->fromTenant);
    }

    /**
     * Test can request student transfer
     */
    public function test_can_request_student_transfer()
    {
        $mutasiService = app(MutasiSiswaService::class);
        
        $mutasi = $mutasiService->requestTransfer(
            $this->student->id,
            $this->toTenant->id,
            'Pindah sekolah karena pindah domisili'
        );

        $this->assertDatabaseHas('mutasi_siswa', [
            'student_id' => $this->student->id,
            'from_tenant_id' => $this->fromTenant->id,
            'to_tenant_id' => $this->toTenant->id,
            'status' => 'pending',
            'reason' => 'Pindah sekolah karena pindah domisili',
        ]);

        $this->assertEquals('pending', $mutasi->status);
        $this->assertEquals($this->student->id, $mutasi->student_id);
    }

    /**
     * Test cannot transfer to different educational level
     */
    public function test_cannot_transfer_to_different_educational_level()
    {
        $differentLevelTenant = Tenant::factory()->create([
            'educational_level' => 'SMA'
        ]);

        $mutasiService = app(MutasiSiswaService::class);
        
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Mutasi hanya dapat dilakukan antar lembaga dengan jenjang pendidikan yang sama');
        
        $mutasiService->requestTransfer(
            $this->student->id,
            $differentLevelTenant->id,
            'Test reason'
        );
    }

    /**
     * Test cannot create duplicate transfer request
     */
    public function test_cannot_create_duplicate_transfer_request()
    {
        $mutasiService = app(MutasiSiswaService::class);
        
        // Create first transfer request
        $mutasiService->requestTransfer(
            $this->student->id,
            $this->toTenant->id,
            'First request'
        );

        // Try to create second transfer request
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Siswa sudah memiliki permintaan mutasi yang sedang berlangsung');
        
        $mutasiService->requestTransfer(
            $this->student->id,
            $this->toTenant->id,
            'Second request'
        );
    }

    /**
     * Test can approve transfer request
     */
    public function test_can_approve_transfer_request()
    {
        // Create transfer request
        $mutasi = MutasiSiswa::create([
            'student_id' => $this->student->id,
            'from_tenant_id' => $this->fromTenant->id,
            'to_tenant_id' => $this->toTenant->id,
            'status' => 'pending',
            'reason' => 'Test reason',
        ]);

        // Switch to destination tenant context
        app(TenantService::class)->setCurrentTenant($this->toTenant);
        
        $mutasiService = app(MutasiSiswaService::class);
        
        $approvedMutasi = $mutasiService->approveTransfer($mutasi->id, 'Approved by admin');

        $this->assertEquals('approved', $approvedMutasi->status);
        $this->assertNotNull($approvedMutasi->processed_at);
        $this->assertNotNull($approvedMutasi->processed_by);
    }

    /**
     * Test can reject transfer request
     */
    public function test_can_reject_transfer_request()
    {
        // Create transfer request
        $mutasi = MutasiSiswa::create([
            'student_id' => $this->student->id,
            'from_tenant_id' => $this->fromTenant->id,
            'to_tenant_id' => $this->toTenant->id,
            'status' => 'pending',
            'reason' => 'Test reason',
        ]);

        // Switch to destination tenant context
        app(TenantService::class)->setCurrentTenant($this->toTenant);
        
        $mutasiService = app(MutasiSiswaService::class);
        
        $rejectedMutasi = $mutasiService->rejectTransfer(
            $mutasi->id, 
            'Tidak memenuhi persyaratan'
        );

        $this->assertEquals('rejected', $rejectedMutasi->status);
        $this->assertEquals('Tidak memenuhi persyaratan', $rejectedMutasi->rejection_reason);
        $this->assertNotNull($rejectedMutasi->processed_at);
    }

    /**
     * Test can complete transfer
     */
    public function test_can_complete_transfer()
    {
        // Create approved transfer request
        $mutasi = MutasiSiswa::create([
            'student_id' => $this->student->id,
            'from_tenant_id' => $this->fromTenant->id,
            'to_tenant_id' => $this->toTenant->id,
            'status' => 'approved',
            'reason' => 'Test reason',
        ]);

        $mutasiService = app(MutasiSiswaService::class);
        
        $completedMutasi = $mutasiService->completeTransfer($mutasi->id);

        $this->assertEquals('completed', $completedMutasi->status);
        
        // Check that student's tenant has changed
        $this->student->refresh();
        $this->assertEquals($this->toTenant->id, $this->student->instansi_id);
    }

    /**
     * Test can cancel transfer request
     */
    public function test_can_cancel_transfer_request()
    {
        // Create transfer request
        $mutasi = MutasiSiswa::create([
            'student_id' => $this->student->id,
            'from_tenant_id' => $this->fromTenant->id,
            'to_tenant_id' => $this->toTenant->id,
            'status' => 'pending',
            'reason' => 'Test reason',
        ]);

        $mutasiService = app(MutasiSiswaService::class);
        
        $cancelledMutasi = $mutasiService->cancelTransfer(
            $mutasi->id, 
            'Dibatalkan oleh orang tua'
        );

        $this->assertEquals('rejected', $cancelledMutasi->status);
        $this->assertStringContains('Dibatalkan oleh orang tua', $cancelledMutasi->rejection_reason);
    }

    /**
     * Test cannot approve from wrong tenant
     */
    public function test_cannot_approve_from_wrong_tenant()
    {
        // Create transfer request
        $mutasi = MutasiSiswa::create([
            'student_id' => $this->student->id,
            'from_tenant_id' => $this->fromTenant->id,
            'to_tenant_id' => $this->toTenant->id,
            'status' => 'pending',
            'reason' => 'Test reason',
        ]);

        // Stay in source tenant context (should fail)
        $mutasiService = app(MutasiSiswaService::class);
        
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Anda tidak memiliki izin untuk menyetujui mutasi ini');
        
        $mutasiService->approveTransfer($mutasi->id);
    }

    /**
     * Test get transfer statistics
     */
    public function test_can_get_transfer_statistics()
    {
        // Create some transfer requests
        MutasiSiswa::create([
            'student_id' => $this->student->id,
            'from_tenant_id' => $this->fromTenant->id,
            'to_tenant_id' => $this->toTenant->id,
            'status' => 'pending',
            'reason' => 'Test reason 1',
        ]);

        MutasiSiswa::create([
            'student_id' => $this->student->id,
            'from_tenant_id' => $this->toTenant->id,
            'to_tenant_id' => $this->fromTenant->id,
            'status' => 'approved',
            'reason' => 'Test reason 2',
        ]);

        $mutasiService = app(MutasiSiswaService::class);
        $statistics = $mutasiService->getStatistics();

        $this->assertArrayHasKey('total', $statistics);
        $this->assertArrayHasKey('pending', $statistics);
        $this->assertArrayHasKey('approved', $statistics);
        $this->assertEquals(2, $statistics['total']);
        $this->assertEquals(1, $statistics['pending']);
        $this->assertEquals(1, $statistics['approved']);
    }

    /**
     * Test get available destinations
     */
    public function test_can_get_available_destinations()
    {
        $mutasiService = app(MutasiSiswaService::class);
        $destinations = $mutasiService->getAvailableDestinations();

        $this->assertCount(1, $destinations);
        $this->assertEquals($this->toTenant->id, $destinations->first()->id);
    }
}