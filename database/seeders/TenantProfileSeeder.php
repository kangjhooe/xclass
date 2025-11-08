<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TenantProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua tenant yang ada
        $tenants = DB::table('tenants')->get();
        
        foreach ($tenants as $tenant) {
            DB::table('tenant_profiles')->insert([
                'instansi_id' => $tenant->id,
                'title' => $tenant->name,
                'description' => 'Website resmi ' . $tenant->name,
                'logo' => null,
                'favicon' => null,
                'social_media' => json_encode([
                    'facebook' => null,
                    'twitter' => null,
                    'instagram' => null,
                    'youtube' => null,
                ]),
                'contact_info' => json_encode([
                    'phone' => $tenant->phone,
                    'email' => $tenant->email,
                    'address' => $tenant->address,
                    'city' => $tenant->city,
                    'province' => $tenant->province,
                    'postal_code' => $tenant->postal_code,
                ]),
                'seo_settings' => json_encode([
                    'meta_title' => $tenant->name,
                    'meta_description' => 'Website resmi ' . $tenant->name,
                    'meta_keywords' => $tenant->name . ', sekolah, pendidikan',
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
