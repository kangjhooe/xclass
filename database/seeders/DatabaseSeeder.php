<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Core seeders
            \Database\Seeders\TenantSeeder::class,
            \Database\Seeders\SystemTestSeeder::class,
            \Database\Seeders\PublicPageSeeder::class,
            
            // Enhanced exam module seeder
            \Database\Seeders\ExamEnhancedSeeder::class,
        ]);
    }
}