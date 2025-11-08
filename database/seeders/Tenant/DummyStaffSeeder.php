<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;
use App\Models\Tenant\Staff;
use App\Models\Core\Tenant;

class DummyStaffSeeder extends Seeder
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

        $staffData = [
            [
                'name' => 'Merni Aulia',
                'email' => 'merni.aulia@example.com',
                'phone' => '081234567801',
                'gender' => 'P',
                'nik' => '3201010101010002',
                'employee_number' => 'STF001',
                'nip' => '1985010101985010002',
                'position' => 'Administrasi',
                'department' => 'Tata Usaha',
                'employment_status' => 'permanent',
                'salary' => 3500000,
                'is_active' => true,
                'birth_date' => '1985-01-01',
                'birth_place' => 'Jakarta',
                'religion' => 'Islam',
                'education_level' => 'S1',
                'hire_date' => '2020-01-15',
                'address' => 'Jl. Pendidikan No. 123, Jakarta',
            ],
            [
                'name' => 'Anggun Prima Suwari',
                'email' => 'anggun.prima@example.com',
                'phone' => '081234567802',
                'gender' => 'P',
                'nik' => '3201010101010003',
                'employee_number' => 'STF002',
                'nip' => '1986020201986020003',
                'position' => 'Keuangan',
                'department' => 'Tata Usaha',
                'employment_status' => 'permanent',
                'salary' => 4000000,
                'is_active' => true,
                'birth_date' => '1986-02-02',
                'birth_place' => 'Bandung',
                'religion' => 'Islam',
                'education_level' => 'S1',
                'hire_date' => '2020-03-10',
                'address' => 'Jl. Merdeka No. 45, Bandung',
            ],
            [
                'name' => 'Achmad Rizal Fauzi',
                'email' => 'achmad.rizal@example.com',
                'phone' => '081234567803',
                'gender' => 'L',
                'nik' => '3201010101010004',
                'employee_number' => 'STF003',
                'nip' => '1987030301987030004',
                'position' => 'IT Support',
                'department' => 'Teknologi Informasi',
                'employment_status' => 'permanent',
                'salary' => 4500000,
                'is_active' => true,
                'birth_date' => '1987-03-03',
                'birth_place' => 'Surabaya',
                'religion' => 'Islam',
                'education_level' => 'S1',
                'hire_date' => '2020-05-20',
                'address' => 'Jl. Raya No. 78, Surabaya',
            ],
        ];

        foreach ($staffData as $staff) {
            // Check if staff already exists by NIK
            $existing = Staff::where('nik', $staff['nik'])->first();
            
            if (!$existing) {
                Staff::create(array_merge($staff, [
                    'npsn' => $tenant->npsn,
                    'instansi_id' => $tenant->id,
                ]));
                
                $this->command->info("Staff {$staff['name']} berhasil ditambahkan!");
            } else {
                $this->command->warn("Staff {$staff['name']} dengan NIK {$staff['nik']} sudah ada.");
            }
        }
    }
}

