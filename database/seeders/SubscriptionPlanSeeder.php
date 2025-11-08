<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Paket gratis untuk sekolah kecil dengan fitur dasar',
                'min_students' => 0,
                'max_students' => 99,
                'price_per_student_per_year' => 0,
                'billing_threshold' => 0, // Tidak ada threshold untuk free tier
                'is_free' => true,
                'is_active' => true,
                'sort_order' => 1,
                'features' => [
                    'Fitur dasar',
                    'Support email',
                    'Hingga 99 siswa',
                ],
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Paket untuk sekolah menengah dengan fitur lengkap',
                'min_students' => 100,
                'max_students' => 299,
                'price_per_student_per_year' => 2000,
                'billing_threshold' => 20, // Tagih jika penambahan >= 20 siswa
                'is_free' => false,
                'is_active' => true,
                'sort_order' => 2,
                'features' => [
                    'Semua fitur Basic',
                    'Priority support',
                    'Hingga 299 siswa',
                    'Advanced reporting',
                ],
            ],
            [
                'name' => 'Gold',
                'slug' => 'gold',
                'description' => 'Paket untuk sekolah besar dengan fitur premium',
                'min_students' => 300,
                'max_students' => 499,
                'price_per_student_per_year' => 1500,
                'billing_threshold' => 25, // Tagih jika penambahan >= 25 siswa
                'is_free' => false,
                'is_active' => true,
                'sort_order' => 3,
                'features' => [
                    'Semua fitur Pro',
                    'Dedicated support',
                    'Hingga 499 siswa',
                    'Custom features',
                ],
            ],
            [
                'name' => 'Platinum',
                'slug' => 'platinum',
                'description' => 'Paket untuk sekolah sangat besar dengan semua fitur',
                'min_students' => 500,
                'max_students' => null, // Unlimited
                'price_per_student_per_year' => 1000,
                'billing_threshold' => 30, // Tagih jika penambahan >= 30 siswa
                'is_free' => false,
                'is_active' => true,
                'sort_order' => 4,
                'features' => [
                    'Semua fitur Gold',
                    'Account manager',
                    'Unlimited siswa',
                    'Custom integrations',
                    'White label options',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}

