<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant\Staff;
use App\Models\Core\Tenant;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tenants
        $tenants = Tenant::all();
        
        $staffPositions = [
            'Tata Usaha' => ['Sekretaris', 'Bendahara', 'Administrasi'],
            'Keamanan' => ['Satpam', 'Security'],
            'Kebersihan' => ['Petugas Kebersihan', 'Cleaning Service'],
            'Perpustakaan' => ['Pustakawan', 'Petugas Perpustakaan'],
            'Laboratorium' => ['Teknisi Lab', 'Petugas Lab'],
            'Lainnya' => ['Driver', 'Petugas Kantin', 'Petugas Kesehatan']
        ];
        
        foreach ($tenants as $tenant) {
            foreach ($staffPositions as $department => $positions) {
                foreach ($positions as $position) {
                    Staff::create([
                        'npsn' => $tenant->npsn,
                        'name' => 'Staff ' . $position . ' ' . $tenant->name,
                        'email' => strtolower(str_replace(' ', '', $position)) . '@' . strtolower(str_replace(' ', '', $tenant->name)) . '.sch.id',
                        'phone' => '08123456789' . rand(0, 9),
                        'address' => 'Jl. Pendidikan No. 123, Kota Pendidikan',
                        'birth_date' => now()->subYears(rand(25, 55)),
                        'birth_place' => 'Jakarta',
                        'gender' => rand(0, 1) ? 'L' : 'P',
                        'religion' => ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha'][rand(0, 4)],
                        'employee_number' => 'ST' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                        'nip' => '123456789' . rand(100, 999),
                        'position' => $position,
                        'department' => $department,
                        'education_level' => ['SMA', 'D3', 'S1', 'S2'][rand(0, 3)],
                        'employment_status' => ['permanent', 'contract', 'honorary'][rand(0, 2)],
                        'hire_date' => now()->subMonths(rand(1, 60)),
                        'salary' => rand(2000000, 8000000),
                        'is_active' => true,
                        'instansi_id' => $tenant->id,
                    ]);
                }
            }
        }
    }
}
