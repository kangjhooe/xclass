<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant\Institution;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;
use App\Models\Tenant\Staff;
use App\Models\Tenant\ClassRoom;
use App\Models\Core\Tenant;
use App\Core\Services\TenantService;

/**
 * Data Pokok Demo Seeder
 * 
 * Creates demo data for Data Pokok module
 */
class DataPokokDemoSeeder extends Seeder
{
    /**
     * Run the database seeds
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $this->seedInstitutions($tenant);
            $this->seedTeachers($tenant);
            $this->seedStaff($tenant);
            $this->seedClasses($tenant);
            $this->seedStudents($tenant);
        }
    }

    /**
     * Seed institutions
     */
    protected function seedInstitutions(Tenant $tenant): void
    {
        Institution::create([
            'npsn' => '20212345',
            'name' => $tenant->name,
            'type' => 'madrasah',
            'address' => 'Jl. Pendidikan No. 123, ' . $tenant->city,
            'phone' => '021-12345678',
            'email' => 'info@' . strtolower(str_replace(' ', '', $tenant->name)) . '.sch.id',
            'website' => 'https://' . strtolower(str_replace(' ', '', $tenant->name)) . '.sch.id',
            'headmaster_name' => 'Dr. ' . fake('id_ID')->name(),
            'headmaster_phone' => '08123456789',
            'headmaster_email' => 'kepsek@' . strtolower(str_replace(' ', '', $tenant->name)) . '.sch.id',
            'accreditation_status' => 'A',
            'accreditation_number' => 'SK.123/2023',
            'accreditation_date' => now()->subYear(),
            'is_active' => true,
            'instansi_id' => $tenant->id,
        ]);
    }

    /**
     * Seed teachers
     */
    protected function seedTeachers(Tenant $tenant): void
    {
        $subjects = [
            'Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Indonesia',
            'Bahasa Inggris', 'Bahasa Arab', 'Sejarah', 'Geografi', 'Ekonomi',
            'Sosiologi', 'Pendidikan Agama Islam', 'Pendidikan Jasmani',
            'Seni Budaya', 'Teknologi Informasi'
        ];

        for ($i = 0; $i < 20; $i++) {
            Teacher::create([
                'npsn' => fake()->numerify('########'),
                'name' => fake('id_ID')->name(),
                'nuptk' => fake()->numerify('##########'),
                'nip' => fake()->numerify('################'),
                'email' => fake()->unique()->safeEmail(),
                'phone' => fake()->phoneNumber(),
                'address' => fake('id_ID')->address(),
                'birth_date' => fake()->date('Y-m-d', '1990-01-01'),
                'birth_place' => fake('id_ID')->city(),
                'gender' => fake()->randomElement(['L', 'P']),
                'religion' => 'Islam',
                'subject' => fake()->randomElement($subjects),
                'education_level' => fake()->randomElement(['S1', 'S2', 'S3']),
                'employment_status' => fake()->randomElement(['permanent', 'contract', 'honorary']),
                'hire_date' => fake()->date('Y-m-d', '2020-01-01'),
                'salary' => fake()->numberBetween(3000000, 8000000),
                'is_active' => true,
                'instansi_id' => $tenant->id,
            ]);
        }
    }

    /**
     * Seed staff
     */
    protected function seedStaff(Tenant $tenant): void
    {
        $positions = [
            'Administrasi', 'Keuangan', 'Perpustakaan', 'Laboran', 'Satpam',
            'Kebersihan', 'Kantin', 'IT Support', 'HRD', 'Bendahara'
        ];

        $departments = [
            'Administrasi', 'Keuangan', 'Akademik', 'Kesiswaan', 'Sarana Prasarana',
            'Hubungan Masyarakat', 'Teknologi Informasi'
        ];

        for ($i = 0; $i < 10; $i++) {
            Staff::create([
                'npsn' => fake()->numerify('########'),
                'name' => fake('id_ID')->name(),
                'nip' => fake()->numerify('################'),
                'email' => fake()->unique()->safeEmail(),
                'phone' => fake()->phoneNumber(),
                'address' => fake('id_ID')->address(),
                'birth_date' => fake()->date('Y-m-d', '1985-01-01'),
                'birth_place' => fake('id_ID')->city(),
                'gender' => fake()->randomElement(['L', 'P']),
                'religion' => 'Islam',
                'position' => fake()->randomElement($positions),
                'department' => fake()->randomElement($departments),
                'education_level' => fake()->randomElement(['SMA', 'D3', 'S1']),
                'employment_status' => fake()->randomElement(['permanent', 'contract', 'honorary']),
                'hire_date' => fake()->date('Y-m-d', '2020-01-01'),
                'salary' => fake()->numberBetween(2000000, 5000000),
                'is_active' => true,
                'instansi_id' => $tenant->id,
            ]);
        }
    }

    /**
     * Seed classes
     */
    protected function seedClasses(Tenant $tenant): void
    {
        $levels = ['X', 'XI', 'XII'];
        $types = ['IPA', 'IPS', 'Bahasa'];
        $buildings = ['Gedung A', 'Gedung B', 'Gedung C'];
        $equipment = [
            'AC, Proyektor, Whiteboard',
            'AC, Proyektor, Whiteboard, Komputer',
            'AC, Proyektor, Whiteboard, Sound System',
            'AC, Proyektor, Whiteboard, Komputer, Printer'
        ];

        $teachers = Teacher::where('instansi_id', $tenant->id)->get();

        foreach ($levels as $level) {
            foreach ($types as $type) {
                for ($i = 1; $i <= 3; $i++) {
                    ClassRoom::create([
                        'npsn' => fake()->numerify('########'),
                        'name' => "{$level} {$type} {$i}",
                        'code' => strtoupper($level . $type . $i),
                        'level' => $level,
                        'type' => $type,
                        'capacity' => fake()->numberBetween(25, 35),
                        'description' => "Kelas {$level} {$type} {$i}",
                        'building' => fake()->randomElement($buildings),
                        'floor' => fake()->numberBetween(1, 3),
                        'room_number' => fake()->numerify('###'),
                        'teacher_id' => $teachers->random()->id,
                        'academic_year' => now()->year,
                        'equipment' => fake()->randomElement($equipment),
                        'status' => fake()->randomElement(['available', 'occupied']),
                        'is_available' => true,
                        'needs_maintenance' => fake()->boolean(20),
                        'is_active' => true,
                        'instansi_id' => $tenant->id,
                    ]);
                }
            }
        }
    }

    /**
     * Seed students
     */
    protected function seedStudents(Tenant $tenant): void
    {
        $classes = ClassRoom::where('instansi_id', $tenant->id)->get();
        $religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
        $bloodTypes = ['A', 'B', 'AB', 'O'];
        $transportation = ['Motor', 'Mobil', 'Angkutan Umum', 'Jalan Kaki', 'Sepeda'];
        $parentOccupations = [
            'PNS', 'TNI/Polri', 'Guru', 'Dokter', 'Perawat', 'Wiraswasta',
            'Buruh', 'Petani', 'Nelayan', 'Pegawai Swasta', 'Lainnya'
        ];

        foreach ($classes as $class) {
            $studentCount = fake()->numberBetween(20, 35);
            
            for ($i = 0; $i < $studentCount; $i++) {
                Student::create([
                    'npsn' => fake()->numerify('########'),
                    'name' => fake('id_ID')->name(),
                    'nis' => fake()->numerify('#####'),
                    'nisn' => fake()->numerify('##########'),
                    'email' => fake()->unique()->safeEmail(),
                    'phone' => fake()->phoneNumber(),
                    'address' => fake('id_ID')->address(),
                    'birth_date' => fake()->date('Y-m-d', '2005-01-01'),
                    'birth_place' => fake('id_ID')->city(),
                    'gender' => fake()->randomElement(['L', 'P']),
                    'religion' => fake()->randomElement($religions),
                    'class_id' => $class->id,
                    'enrollment_date' => fake()->date('Y-m-d', '2023-07-01'),
                    'status' => fake()->randomElement(['active', 'graduated', 'transferred']),
                    'parent_name' => fake('id_ID')->name(),
                    'parent_phone' => fake()->phoneNumber(),
                    'parent_email' => fake()->unique()->safeEmail(),
                    'parent_occupation' => fake()->randomElement($parentOccupations),
                    'blood_type' => fake()->randomElement($bloodTypes),
                    'has_special_needs' => fake()->boolean(5),
                    'special_needs_description' => fake()->boolean(5) ? fake('id_ID')->sentence() : null,
                    'transportation' => fake()->randomElement($transportation),
                    'is_active' => true,
                    'instansi_id' => $tenant->id,
                ]);
            }
        }
    }
}