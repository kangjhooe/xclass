<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Core\Tenant;
use App\Models\User;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get sample tenant
        $tenant = Tenant::firstOrCreate(
            ['npsn' => '12345678'],
            [
                'name' => 'SMA Negeri 1 Jakarta',
                'email' => 'admin@sman1jakarta.sch.id',
                'phone' => '021-12345678',
                'address' => 'Jl. Pendidikan No. 1, Jakarta Pusat',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
                'postal_code' => '10110',
                'website' => 'https://sman1jakarta.sch.id',
                'is_active' => true,
                'subscription_plan' => 'premium',
                'subscription_expires_at' => now()->addYear(),
                'settings' => [
                    'academic_year' => '2024/2025',
                    'semester' => 1,
                    'timezone' => 'Asia/Jakarta',
                    'date_format' => 'DD-MM-YYYY',
                ],
            ]
        );

        // Create super admin user (if not exists)
        User::firstOrCreate(
            ['email' => 'admin@class.app'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        // Create school admin user (if not exists)
        User::firstOrCreate(
            ['email' => 'admin@sman1jakarta.sch.id'],
            [
                'name' => 'Admin Sekolah',
                'password' => bcrypt('password'),
                'role' => 'school_admin',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ]
        );

        // Create sample teacher (if not exists)
        User::firstOrCreate(
            ['email' => 'guru@sman1jakarta.sch.id'],
            [
                'name' => 'Guru Matematika',
                'password' => bcrypt('password'),
                'role' => 'teacher',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ]
        );

        // Create sample student (if not exists)
        User::firstOrCreate(
            ['email' => 'siswa@sman1jakarta.sch.id'],
            [
                'name' => 'Siswa Contoh',
                'password' => bcrypt('password'),
                'role' => 'student',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ]
        );
    }
}
