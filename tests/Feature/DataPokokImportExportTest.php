<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Core\Tenant;
use App\Models\User;
use App\Models\Tenant\Institution;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;
use App\Models\Tenant\Staff;
use App\Models\Tenant\ClassRoom;
use App\Exports\InstitutionExport;
use App\Exports\TeacherExport;
use App\Exports\StudentExport;
use App\Exports\StaffExport;
use App\Exports\ClassRoomExport;
use App\Imports\TeacherImport;
use App\Imports\StudentImport;
use App\Imports\StaffImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Core\Services\TenantService;

/**
 * Data Pokok Import/Export Test
 * 
 * Tests for import/export functionality
 */
class DataPokokImportExportTest extends TestCase
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
        app(TenantService::class)->setCurrentTenant($this->tenant);
        
        // Fake storage
        Storage::fake('public');
    }

    /**
     * Test institution export
     */
    public function test_can_export_institutions()
    {
        // Create test institutions
        Institution::factory()->count(3)->create([
            'instansi_id' => $this->tenant->id
        ]);

        $institutions = Institution::where('instansi_id', $this->tenant->id)->get();
        $export = new InstitutionExport($institutions);

        Excel::store($export, 'test-institutions.xlsx', 'public');

        Storage::disk('public')->assertExists('test-institutions.xlsx');
    }

    /**
     * Test teacher export
     */
    public function test_can_export_teachers()
    {
        // Create test teachers
        Teacher::factory()->count(5)->create([
            'instansi_id' => $this->tenant->id
        ]);

        $teachers = Teacher::where('instansi_id', $this->tenant->id)->get();
        $export = new TeacherExport($teachers);

        Excel::store($export, 'test-teachers.xlsx', 'public');

        Storage::disk('public')->assertExists('test-teachers.xlsx');
    }

    /**
     * Test student export
     */
    public function test_can_export_students()
    {
        // Create test class
        $class = ClassRoom::factory()->create([
            'instansi_id' => $this->tenant->id
        ]);

        // Create test students
        Student::factory()->count(10)->create([
            'instansi_id' => $this->tenant->id,
            'class_id' => $class->id
        ]);

        $students = Student::with('class')->where('instansi_id', $this->tenant->id)->get();
        $export = new StudentExport($students);

        Excel::store($export, 'test-students.xlsx', 'public');

        Storage::disk('public')->assertExists('test-students.xlsx');
    }

    /**
     * Test staff export
     */
    public function test_can_export_staff()
    {
        // Create test staff
        Staff::factory()->count(3)->create([
            'instansi_id' => $this->tenant->id
        ]);

        $staff = Staff::where('instansi_id', $this->tenant->id)->get();
        $export = new StaffExport($staff);

        Excel::store($export, 'test-staff.xlsx', 'public');

        Storage::disk('public')->assertExists('test-staff.xlsx');
    }

    /**
     * Test class room export
     */
    public function test_can_export_class_rooms()
    {
        // Create test classes
        ClassRoom::factory()->count(5)->create([
            'instansi_id' => $this->tenant->id
        ]);

        $classes = ClassRoom::with(['teacher', 'students'])->where('instansi_id', $this->tenant->id)->get();
        $export = new ClassRoomExport($classes);

        Excel::store($export, 'test-classes.xlsx', 'public');

        Storage::disk('public')->assertExists('test-classes.xlsx');
    }

    /**
     * Test teacher import
     */
    public function test_can_import_teachers()
    {
        // Create test Excel file
        $teachers = collect([
            [
                'nama' => 'Test Teacher 1',
                'nuptk' => '1234567890123456',
                'nip' => '1965123123456789',
                'email' => 'teacher1@test.com',
                'telepon' => '08123456789',
                'alamat' => 'Test Address 1',
                'tanggal_lahir' => '1980-01-01',
                'tempat_lahir' => 'Jakarta',
                'jenis_kelamin' => 'L',
                'agama' => 'Islam',
                'mata_pelajaran' => 'Matematika',
                'pendidikan' => 'S1',
                'status_kepegawaian' => 'permanent',
                'tanggal_masuk' => '2020-01-01',
                'gaji' => '5000000',
                'status_aktif' => true,
            ],
            [
                'nama' => 'Test Teacher 2',
                'nuptk' => '1234567890123457',
                'nip' => '1965123123456790',
                'email' => 'teacher2@test.com',
                'telepon' => '08123456790',
                'alamat' => 'Test Address 2',
                'tanggal_lahir' => '1985-01-01',
                'tempat_lahir' => 'Bandung',
                'jenis_kelamin' => 'P',
                'agama' => 'Islam',
                'mata_pelajaran' => 'Fisika',
                'pendidikan' => 'S2',
                'status_kepegawaian' => 'contract',
                'tanggal_masuk' => '2021-01-01',
                'gaji' => '6000000',
                'status_aktif' => true,
            ]
        ]);

        $export = new TeacherExport($teachers);
        $filepath = 'imports/test-teachers.xlsx';
        Excel::store($export, $filepath, 'public');

        // Import the file
        $import = new TeacherImport(app(\App\Services\Tenant\TeacherService::class));
        Excel::import($import, $filepath, 'public');

        // Check that teachers were created
        $this->assertDatabaseHas('teachers', [
            'name' => 'Test Teacher 1',
            'nuptk' => '1234567890123456',
            'instansi_id' => $this->tenant->id,
        ]);

        $this->assertDatabaseHas('teachers', [
            'name' => 'Test Teacher 2',
            'nuptk' => '1234567890123457',
            'instansi_id' => $this->tenant->id,
        ]);
    }

    /**
     * Test student import
     */
    public function test_can_import_students()
    {
        // Create test class
        $class = ClassRoom::factory()->create([
            'name' => 'X IPA 1',
            'instansi_id' => $this->tenant->id
        ]);

        // Create test Excel file
        $students = collect([
            [
                'nama' => 'Test Student 1',
                'nis' => '12345',
                'nisn' => '1234567890',
                'email' => 'student1@test.com',
                'telepon' => '08123456789',
                'alamat' => 'Test Address 1',
                'tanggal_lahir' => '2005-01-01',
                'tempat_lahir' => 'Jakarta',
                'jenis_kelamin' => 'L',
                'agama' => 'Islam',
                'kelas' => 'X IPA 1',
                'tanggal_masuk' => '2023-07-01',
                'status' => 'active',
                'nama_orang_tua' => 'Test Parent 1',
                'telepon_orang_tua' => '08123456788',
                'email_orang_tua' => 'parent1@test.com',
                'pekerjaan_orang_tua' => 'PNS',
                'golongan_darah' => 'O',
                'kebutuhan_khusus' => false,
                'transportasi' => 'Motor',
                'status_aktif' => true,
            ]
        ]);

        $export = new StudentExport($students);
        $filepath = 'imports/test-students.xlsx';
        Excel::store($export, $filepath, 'public');

        // Import the file
        $import = new StudentImport(app(\App\Services\Tenant\StudentService::class));
        Excel::import($import, $filepath, 'public');

        // Check that student was created
        $this->assertDatabaseHas('students', [
            'name' => 'Test Student 1',
            'nis' => '12345',
            'instansi_id' => $this->tenant->id,
        ]);
    }

    /**
     * Test staff import
     */
    public function test_can_import_staff()
    {
        // Create test Excel file
        $staff = collect([
            [
                'nama' => 'Test Staff 1',
                'nip' => '1234567890123456',
                'email' => 'staff1@test.com',
                'telepon' => '08123456789',
                'alamat' => 'Test Address 1',
                'tanggal_lahir' => '1980-01-01',
                'tempat_lahir' => 'Jakarta',
                'jenis_kelamin' => 'L',
                'agama' => 'Islam',
                'posisi' => 'Administrasi',
                'departemen' => 'Keuangan',
                'pendidikan' => 'S1',
                'status_kepegawaian' => 'permanent',
                'tanggal_masuk' => '2020-01-01',
                'gaji' => '4000000',
                'status_aktif' => true,
            ]
        ]);

        $export = new StaffExport($staff);
        $filepath = 'imports/test-staff.xlsx';
        Excel::store($export, $filepath, 'public');

        // Import the file
        $import = new StaffImport(app(\App\Services\Tenant\StaffService::class));
        Excel::import($import, $filepath, 'public');

        // Check that staff was created
        $this->assertDatabaseHas('staff', [
            'name' => 'Test Staff 1',
            'nip' => '1234567890123456',
            'instansi_id' => $this->tenant->id,
        ]);
    }

    /**
     * Test import validation
     */
    public function test_import_validates_required_fields()
    {
        // Create test Excel file with missing required fields
        $invalidData = collect([
            [
                'nama' => '', // Missing required field
                'nuptk' => '1234567890123456',
                'jenis_kelamin' => 'L',
                'mata_pelajaran' => 'Matematika',
                'status_kepegawaian' => 'permanent',
            ]
        ]);

        $export = new TeacherExport($invalidData);
        $filepath = 'imports/invalid-teachers.xlsx';
        Excel::store($export, $filepath, 'public');

        // Import the file
        $import = new TeacherImport(app(\App\Services\Tenant\TeacherService::class));
        Excel::import($import, $filepath, 'public');

        // Check that no teacher was created due to validation error
        $this->assertDatabaseMissing('teachers', [
            'nuptk' => '1234567890123456',
            'instansi_id' => $this->tenant->id,
        ]);
    }

    /**
     * Test duplicate validation in import
     */
    public function test_import_validates_duplicates()
    {
        // Create existing teacher
        Teacher::factory()->create([
            'nuptk' => '1234567890123456',
            'instansi_id' => $this->tenant->id
        ]);

        // Create test Excel file with duplicate NUPTK
        $duplicateData = collect([
            [
                'nama' => 'Test Teacher',
                'nuptk' => '1234567890123456', // Duplicate
                'jenis_kelamin' => 'L',
                'mata_pelajaran' => 'Matematika',
                'status_kepegawaian' => 'permanent',
            ]
        ]);

        $export = new TeacherExport($duplicateData);
        $filepath = 'imports/duplicate-teachers.xlsx';
        Excel::store($export, $filepath, 'public');

        // Import the file
        $import = new TeacherImport(app(\App\Services\Tenant\TeacherService::class));
        Excel::import($import, $filepath, 'public');

        // Check that only one teacher exists (the original one)
        $this->assertDatabaseCount('teachers', 1);
    }

    /**
     * Test export job
     */
    public function test_export_job_can_be_dispatched()
    {
        \Queue::fake();

        $this->actingAs($this->user);

        $response = $this->postJson('/tenant/data-pokok/export', [
            'type' => 'teachers',
            'filters' => []
        ]);

        \Queue::assertPushed(\App\Jobs\ExportDataPokokJob::class);
    }

    /**
     * Test import job
     */
    public function test_import_job_can_be_dispatched()
    {
        \Queue::fake();

        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('teachers.xlsx', 100);

        $response = $this->postJson('/tenant/data-pokok/import', [
            'type' => 'teachers',
            'file' => $file
        ]);

        \Queue::assertPushed(\App\Jobs\ImportDataPokokJob::class);
    }
}