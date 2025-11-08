<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Tenant\Teacher;
use App\Models\Core\Tenant;
use Carbon\Carbon;

class DummyTeachersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::where('npsn', '10816663')->first();
        
        if (!$tenant) {
            $this->command->error('Tenant dengan NPSN 10816663 tidak ditemukan!');
            return;
        }

        $teachers = [
            [
                'name' => 'Eko Parwoto',
                'email' => 'eko.parwoto@example.com',
                'gender' => 'L',
                'nik' => '3201010101010001',
                'phone' => '081234567890',
                'birth_place' => 'Jakarta',
                'birth_date' => '1980-05-15',
                'religion' => 'Islam',
                'address' => 'Jl. Merdeka No. 123, Jakarta Pusat',
                'province' => 'DKI Jakarta',
                'city' => 'Jakarta Pusat',
                'district' => 'Gambir',
                'village' => 'Gambir',
                'postal_code' => '10110',
                'education_level' => 'S1',
                'study_program_group' => 'Pendidikan',
                'jenjang' => 'S1',
                'main_subject' => 'Matematika',
                'nuptk' => '1234567890123456',
                'nip' => '1980051519800515001',
                'employee_number' => 'EMP001',
                'employment_status' => 'PNS',
                'golongan' => 'IV/a',
                'main_duty' => 'Pendidik',
                'main_duty_at_school' => 'Guru Mata Pelajaran',
                'main_subject' => 'Matematika',
                'teaching_hours_per_week' => 24,
                'certification_participation_status' => 'Lulus',
                'certification_pass_status' => 'Lulus',
                'certification_year' => 2015,
                'certification_subject' => 'Matematika',
            ],
            [
                'name' => 'Johan Efendi',
                'email' => 'johan.efendi@example.com',
                'gender' => 'L',
                'nik' => '3201010101010002',
                'phone' => '081234567891',
                'birth_place' => 'Bandung',
                'birth_date' => '1982-08-20',
                'religion' => 'Islam',
                'address' => 'Jl. Dago No. 45, Bandung',
                'province' => 'Jawa Barat',
                'city' => 'Bandung',
                'district' => 'Coblong',
                'village' => 'Dago',
                'postal_code' => '40135',
                'education_level' => 'S1',
                'study_program_group' => 'Pendidikan',
                'jenjang' => 'S1',
                'main_subject' => 'Bahasa Indonesia',
                'nuptk' => '1234567890123457',
                'nip' => '1982082019820820002',
                'employee_number' => 'EMP002',
                'employment_status' => 'PNS',
                'golongan' => 'III/d',
                'main_duty' => 'Pendidik',
                'main_duty_at_school' => 'Guru Mata Pelajaran',
                'main_subject' => 'Bahasa Indonesia',
                'teaching_hours_per_week' => 22,
                'certification_participation_status' => 'Lulus',
                'certification_pass_status' => 'Lulus',
                'certification_year' => 2016,
                'certification_subject' => 'Bahasa Indonesia',
            ],
            [
                'name' => 'Zulaifah',
                'email' => 'zulaifah@example.com',
                'gender' => 'P',
                'nik' => '3201010101010003',
                'phone' => '081234567892',
                'birth_place' => 'Yogyakarta',
                'birth_date' => '1985-03-10',
                'religion' => 'Islam',
                'address' => 'Jl. Malioboro No. 78, Yogyakarta',
                'province' => 'DIY Yogyakarta',
                'city' => 'Yogyakarta',
                'district' => 'Gedongtengen',
                'village' => 'Sosromenduran',
                'postal_code' => '55271',
                'education_level' => 'S2',
                'study_program_group' => 'Pendidikan',
                'jenjang' => 'S2',
                'main_subject' => 'Bahasa Inggris',
                'nuptk' => '1234567890123458',
                'nip' => '1985031019850310003',
                'employee_number' => 'EMP003',
                'employment_status' => 'PNS',
                'golongan' => 'IV/b',
                'main_duty' => 'Pendidik',
                'main_duty_at_school' => 'Guru Mata Pelajaran',
                'main_subject' => 'Bahasa Inggris',
                'teaching_hours_per_week' => 20,
                'certification_participation_status' => 'Lulus',
                'certification_pass_status' => 'Lulus',
                'certification_year' => 2014,
                'certification_subject' => 'Bahasa Inggris',
            ],
            [
                'name' => 'Suyanti',
                'email' => 'suyanti@example.com',
                'gender' => 'P',
                'nik' => '3201010101010004',
                'phone' => '081234567893',
                'birth_place' => 'Surabaya',
                'birth_date' => '1987-11-25',
                'religion' => 'Kristen',
                'address' => 'Jl. Raya Darmo No. 99, Surabaya',
                'province' => 'Jawa Timur',
                'city' => 'Surabaya',
                'district' => 'Wonokromo',
                'village' => 'Wonokromo',
                'postal_code' => '60241',
                'education_level' => 'S1',
                'study_program_group' => 'Pendidikan',
                'jenjang' => 'S1',
                'main_subject' => 'IPA',
                'nuptk' => '1234567890123459',
                'nip' => '1987112519871125004',
                'employee_number' => 'EMP004',
                'employment_status' => 'Non-PNS',
                'employment_status_non_pns' => 'Guru Honor',
                'golongan' => null,
                'main_duty' => 'Pendidik',
                'main_duty_at_school' => 'Guru Mata Pelajaran',
                'main_subject' => 'IPA',
                'teaching_hours_per_week' => 18,
                'certification_participation_status' => 'Belum',
                'certification_pass_status' => null,
                'certification_year' => null,
                'certification_subject' => null,
            ],
            [
                'name' => 'Dora maria',
                'email' => 'dora.maria@example.com',
                'gender' => 'P',
                'nik' => '3201010101010005',
                'phone' => '081234567894',
                'birth_place' => 'Medan',
                'birth_date' => '1989-07-12',
                'religion' => 'Katolik',
                'address' => 'Jl. Gatot Subroto No. 12, Medan',
                'province' => 'Sumatera Utara',
                'city' => 'Medan',
                'district' => 'Medan Baru',
                'village' => 'Medan Baru',
                'postal_code' => '20153',
                'education_level' => 'S1',
                'study_program_group' => 'Pendidikan',
                'jenjang' => 'S1',
                'main_subject' => 'IPS',
                'nuptk' => '1234567890123460',
                'nip' => '1989071219890712005',
                'employee_number' => 'EMP005',
                'employment_status' => 'PNS',
                'golongan' => 'III/c',
                'main_duty' => 'Pendidik',
                'main_duty_at_school' => 'Guru Mata Pelajaran',
                'main_subject' => 'IPS',
                'teaching_hours_per_week' => 20,
                'certification_participation_status' => 'Mengikuti',
                'certification_pass_status' => null,
                'certification_year' => null,
                'certification_subject' => 'IPS',
            ],
        ];

        $characters = 'abcdefghijklmnopqrstuvwxyz';
        
        DB::beginTransaction();
        try {
            foreach ($teachers as $index => $teacherData) {
                // Generate password random 8 karakter huruf kecil
                $password = '';
                for ($i = 0; $i < 8; $i++) {
                    $password .= $characters[rand(0, strlen($characters) - 1)];
                }

                // Check if user already exists
                $existingUser = User::where('email', $teacherData['email'])->first();
                if ($existingUser) {
                    $this->command->warn("User dengan email {$teacherData['email']} sudah ada, dilewati.");
                    continue;
                }

                // Check if teacher with NIK already exists
                $existingTeacher = Teacher::where('nik', $teacherData['nik'])->first();
                if ($existingTeacher) {
                    $this->command->warn("Guru dengan NIK {$teacherData['nik']} sudah ada, dilewati.");
                    continue;
                }

                // Create User
                $user = User::create([
                    'name' => $teacherData['name'],
                    'email' => $teacherData['email'],
                    'password' => Hash::make($password),
                    'role' => 'teacher',
                    'instansi_id' => $tenant->id,
                    'is_active' => true,
                ]);

                // Create Teacher record
                $teacher = Teacher::create([
                    'user_id' => $user->id,
                    'name' => $teacherData['name'],
                    'email' => $teacherData['email'],
                    'phone' => $teacherData['phone'],
                    'gender' => $teacherData['gender'],
                    'nik' => $teacherData['nik'],
                    'birth_place' => $teacherData['birth_place'],
                    'birth_date' => Carbon::parse($teacherData['birth_date']),
                    'religion' => $teacherData['religion'],
                    'address' => $teacherData['address'],
                    'province' => $teacherData['province'],
                    'city' => $teacherData['city'],
                    'district' => $teacherData['district'],
                    'village' => $teacherData['village'],
                    'postal_code' => $teacherData['postal_code'],
                    'education_level' => $teacherData['education_level'],
                    'study_program_group' => $teacherData['study_program_group'],
                    'jenjang' => $teacherData['jenjang'],
                    'nuptk' => $teacherData['nuptk'],
                    'nip' => $teacherData['nip'],
                    'employee_number' => $teacherData['employee_number'],
                    'employment_status' => $teacherData['employment_status'],
                    'employment_status_non_pns' => $teacherData['employment_status_non_pns'] ?? null,
                    'golongan' => $teacherData['golongan'],
                    'main_duty' => $teacherData['main_duty'],
                    'main_duty_at_school' => $teacherData['main_duty_at_school'],
                    'main_subject' => $teacherData['main_subject'],
                    'teaching_hours_per_week' => $teacherData['teaching_hours_per_week'],
                    'certification_participation_status' => $teacherData['certification_participation_status'],
                    'certification_pass_status' => $teacherData['certification_pass_status'] ?? null,
                    'certification_year' => $teacherData['certification_year'],
                    'certification_subject' => $teacherData['certification_subject'],
                    'instansi_id' => $tenant->id,
                    'npsn' => $tenant->npsn,
                    'is_active' => true,
                ]);

                // Link teacher ke tenant sebagai primary
                DB::table('teacher_tenants')->insert([
                    'teacher_id' => $teacher->id,
                    'tenant_id' => $tenant->id,
                    'type' => 'primary',
                    'is_active' => true,
                    'assigned_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->command->info("✓ Guru {$teacherData['name']} berhasil dibuat:");
                $this->command->line("  Email: {$teacherData['email']}");
                $this->command->line("  Password: {$password}");
            }

            DB::commit();
            $this->command->info("\nSemua guru dummy berhasil dibuat untuk tenant {$tenant->name} (NPSN: {$tenant->npsn})");
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Error: " . $e->getMessage());
            $this->command->error($e->getTraceAsString());
        }
    }
}
