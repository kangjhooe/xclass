<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant\GradeWeight;
use App\Models\Core\Tenant;

class GradeWeightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tenants
        $tenants = Tenant::all();
        
        foreach ($tenants as $tenant) {
            // Create default grade weights for each tenant
            $defaultWeights = GradeWeight::getDefaultWeights();
            
            foreach ($defaultWeights as $weight) {
                GradeWeight::create([
                    'assignment_type' => $weight['assignment_type'],
                    'assignment_label' => $weight['assignment_label'],
                    'weight_percentage' => $weight['weight_percentage'],
                    'is_active' => true,
                    'instansi_id' => $tenant->id,
                ]);
            }
        }
    }
}
