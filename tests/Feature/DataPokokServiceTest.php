<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Core\Tenant;
use App\Models\User;
use App\Services\Tenant\InstitutionService;
use App\Services\Tenant\TeacherService;
use App\Services\Tenant\StudentService;
use App\Services\Tenant\StaffService;
use App\Services\Tenant\ClassRoomService;
use App\Services\MutasiSiswaService;
use App\Services\TenantUserAssignmentService;
use App\Services\ActivityLogService;

/**
 * Data Pokok Service Test
 * 
 * Tests for Data Pokok module services
 */
class DataPokokServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected Tenant $tenant;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test tenant
        $this->tenant = Tenant::factory()->create();
        
        // Create test user
        $this->user = User::factory()->create();
        
        // Set tenant context
        app(\App\Core\Services\TenantService::class)->setCurrentTenant($this->tenant);
    }

    /**
     * Test institution service
     */
    public function test_institution_service_can_create_institution()
    {
        $institutionService = app(InstitutionService::class);
        
        $data = [
            'npsn' => '20212345',
            'name' => 'Test Institution',
            'type' => 'madrasah',
            'address' => 'Test Address',
            'phone' => '021-12345678',
            'email' => 'test@institution.com',
            'accreditation_status' => 'A',
            'is_active' => true,
        ];

        $institution = $institutionService->create($data);

        $this->assertDatabaseHas('institutions', [
            'npsn' => '20212345',
            'name' => 'Test Institution',
            'instansi_id' => $this->tenant->id,
        ]);

        $this->assertEquals('Test Institution', $institution->name);
    }

    /**
     * Test teacher service
     */
    public function test_teacher_service_can_create_teacher()
    {
        $teacherService = app(TeacherService::class);
        
        $data = [
            'name' => 'Test Teacher',
            'nuptk' => '1234567890123456',
            'email' => 'teacher@test.com',
            'phone' => '08123456789',
            'gender' => 'L',
            'subject' => 'Matematika',
            'employment_status' => 'permanent',
            'is_active' => true,
        ];

        $teacher = $teacherService->create($data);

        $this->assertDatabaseHas('teachers', [
            'name' => 'Test Teacher',
            'nuptk' => '1234567890123456',
            'instansi_id' => $this->tenant->id,
        ]);

        $this->assertEquals('Test Teacher', $teacher->name);
    }

    /**
     * Test student service
     */
    public function test_student_service_can_create_student()
    {
        // First create a class
        $classRoomService = app(ClassRoomService::class);
        $class = $classRoomService->create([
            'name' => 'X IPA 1',
            'code' => 'XIPA1',
            'level' => 'X',
            'type' => 'IPA',
            'capacity' => 30,
            'is_active' => true,
        ]);

        $studentService = app(StudentService::class);
        
        $data = [
            'name' => 'Test Student',
            'nis' => '12345',
            'email' => 'student@test.com',
            'phone' => '08123456789',
            'gender' => 'L',
            'class_id' => $class->id,
            'status' => 'active',
            'is_active' => true,
        ];

        $student = $studentService->create($data);

        $this->assertDatabaseHas('students', [
            'name' => 'Test Student',
            'nis' => '12345',
            'instansi_id' => $this->tenant->id,
        ]);

        $this->assertEquals('Test Student', $student->name);
    }

    /**
     * Test staff service
     */
    public function test_staff_service_can_create_staff()
    {
        $staffService = app(StaffService::class);
        
        $data = [
            'name' => 'Test Staff',
            'nip' => '1234567890123456',
            'email' => 'staff@test.com',
            'phone' => '08123456789',
            'gender' => 'P',
            'position' => 'Administrasi',
            'employment_status' => 'permanent',
            'is_active' => true,
        ];

        $staff = $staffService->create($data);

        $this->assertDatabaseHas('staff', [
            'name' => 'Test Staff',
            'nip' => '1234567890123456',
            'instansi_id' => $this->tenant->id,
        ]);

        $this->assertEquals('Test Staff', $staff->name);
    }

    /**
     * Test mutasi siswa service
     */
    public function test_mutasi_siswa_service_can_request_transfer()
    {
        // Create another tenant
        $anotherTenant = Tenant::factory()->create([
            'educational_level' => $this->tenant->educational_level
        ]);

        // Create a student
        $studentService = app(StudentService::class);
        $class = \App\Models\Tenant\ClassRoom::factory()->create([
            'instansi_id' => $this->tenant->id
        ]);
        
        $student = $studentService->create([
            'name' => 'Test Student',
            'nis' => '12345',
            'gender' => 'L',
            'class_id' => $class->id,
            'status' => 'active',
            'is_active' => true,
        ]);

        $mutasiService = app(MutasiSiswaService::class);
        
        $mutasi = $mutasiService->requestTransfer(
            $student->id,
            $anotherTenant->id,
            'Pindah sekolah'
        );

        $this->assertDatabaseHas('mutasi_siswa', [
            'student_id' => $student->id,
            'from_tenant_id' => $this->tenant->id,
            'to_tenant_id' => $anotherTenant->id,
            'status' => 'pending',
        ]);

        $this->assertEquals('pending', $mutasi->status);
    }

    /**
     * Test tenant user assignment service
     */
    public function test_tenant_user_assignment_service_can_assign_user()
    {
        $assignmentService = app(TenantUserAssignmentService::class);
        
        $assignment = $assignmentService->assignUser(
            $this->user->id,
            $this->tenant->id,
            'teacher',
            false,
            [],
            'Test assignment'
        );

        $this->assertDatabaseHas('tenant_user_assignments', [
            'user_id' => $this->user->id,
            'tenant_id' => $this->tenant->id,
            'role' => 'teacher',
            'is_active' => true,
        ]);

        $this->assertEquals('teacher', $assignment->role);
    }

    /**
     * Test activity log service
     */
    public function test_activity_log_service_can_get_logs()
    {
        $activityLogService = app(ActivityLogService::class);
        
        // Create some activity logs
        \App\Models\ActivityLog::create([
            'user_id' => $this->user->id,
            'tenant_id' => $this->tenant->id,
            'model_type' => 'App\\Models\\Tenant\\Institution',
            'model_id' => 1,
            'action' => 'create',
            'changes' => [],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Agent',
        ]);

        $logs = $activityLogService->getLogs();

        $this->assertCount(1, $logs);
        $this->assertEquals('create', $logs->first()->action);
    }

    /**
     * Test validation rules
     */
    public function test_institution_service_validates_required_fields()
    {
        $institutionService = app(InstitutionService::class);
        
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        
        $institutionService->create([]);
    }

    /**
     * Test duplicate validation
     */
    public function test_teacher_service_validates_unique_nuptk()
    {
        $teacherService = app(TeacherService::class);
        
        // Create first teacher
        $teacherService->create([
            'name' => 'First Teacher',
            'nuptk' => '1234567890123456',
            'gender' => 'L',
            'subject' => 'Matematika',
            'employment_status' => 'permanent',
        ]);

        // Try to create second teacher with same NUPTK
        $this->expectException(\Exception::class);
        
        $teacherService->create([
            'name' => 'Second Teacher',
            'nuptk' => '1234567890123456',
            'gender' => 'L',
            'subject' => 'Fisika',
            'employment_status' => 'permanent',
        ]);
    }

    /**
     * Test statistics
     */
    public function test_services_can_get_statistics()
    {
        $institutionService = app(InstitutionService::class);
        $teacherService = app(TeacherService::class);
        
        // Create some data
        $institutionService->create([
            'npsn' => '20212345',
            'name' => 'Test Institution',
            'type' => 'madrasah',
            'address' => 'Test Address',
            'accreditation_status' => 'A',
        ]);

        $teacherService->create([
            'name' => 'Test Teacher',
            'gender' => 'L',
            'subject' => 'Matematika',
            'employment_status' => 'permanent',
        ]);

        $institutionStats = $institutionService->getStatistics();
        $teacherStats = $teacherService->getStatistics();

        $this->assertArrayHasKey('total', $institutionStats);
        $this->assertArrayHasKey('total', $teacherStats);
        $this->assertEquals(1, $institutionStats['total']);
        $this->assertEquals(1, $teacherStats['total']);
    }
}