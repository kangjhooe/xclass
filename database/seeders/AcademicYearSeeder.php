<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant\AcademicYear;
use App\Models\Core\Tenant;

class AcademicYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tenants
        $tenants = Tenant::all();
        
        foreach ($tenants as $tenant) {
            // Create current academic year (2024/2025)
            AcademicYear::create([
                'year_name' => '2024/2025',
                'start_date' => '2024-07-15',
                'end_date' => '2025-06-30',
                'is_active' => true,
                'instansi_id' => $tenant->id,
            ]);
            
            // Create previous academic year (2023/2024)
            AcademicYear::create([
                'year_name' => '2023/2024',
                'start_date' => '2023-07-15',
                'end_date' => '2024-06-30',
                'is_active' => false,
                'instansi_id' => $tenant->id,
            ]);
        }
    }
}
