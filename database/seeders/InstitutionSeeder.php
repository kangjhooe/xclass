<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant\Institution;
use App\Models\Core\Tenant;

class InstitutionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tenants
        $tenants = Tenant::all();
        
        foreach ($tenants as $tenant) {
            // Create sample institution data for each tenant
            Institution::create([
                'npsn' => $tenant->npsn,
                'name' => $tenant->name,
                'type' => 'sekolah',
                'address' => 'Jl. Pendidikan No. 123, Kota Pendidikan',
                'phone' => '021-12345678',
                'email' => 'info@' . strtolower(str_replace(' ', '', $tenant->name)) . '.sch.id',
                'website' => 'https://' . strtolower(str_replace(' ', '', $tenant->name)) . '.sch.id',
                'headmaster_name' => 'Dr. ' . $tenant->name . ', M.Pd.',
                'headmaster_phone' => '081234567890',
                'headmaster_email' => 'kepsek@' . strtolower(str_replace(' ', '', $tenant->name)) . '.sch.id',
                'accreditation_status' => 'A',
                'accreditation_number' => '1234567890',
                'accreditation_date' => now()->subYears(2),
                'is_active' => true,
                'instansi_id' => $tenant->id,
            ]);
        }
    }
}
