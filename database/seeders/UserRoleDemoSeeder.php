<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserRoleDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'permissions' => json_encode([
                    'data_pokok:read',
                    'data_pokok:create',
                    'data_pokok:update',
                    'data_pokok:delete',
                    'data_pokok:export',
                    'data_pokok:import',
                    'data_pokok:mutasi',
                    'data_pokok:assignments',
                    'data_pokok:logs',
                ]),
                'is_active' => true,
            ]
        );

        // Create operator user
        User::updateOrCreate(
            ['email' => 'operator@demo.com'],
            [
                'name' => 'Operator Sekolah',
                'password' => Hash::make('password'),
                'role' => 'school_admin',
                'permissions' => json_encode([
                    'data_pokok:read',
                    'data_pokok:create',
                    'data_pokok:update',
                    'data_pokok:export',
                    'data_pokok:import',
                ]),
                'is_active' => true,
            ]
        );

        // Create kepala sekolah user
        User::updateOrCreate(
            ['email' => 'kepala@demo.com'],
            [
                'name' => 'Kepala Sekolah',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'permissions' => json_encode([
                    'data_pokok:read',
                    'data_pokok:export',
                    'data_pokok:logs',
                ]),
                'is_active' => true,
            ]
        );

        // Create additional operator users
        User::updateOrCreate(
            ['email' => 'operator2@demo.com'],
            [
                'name' => 'Operator 2',
                'password' => Hash::make('password'),
                'role' => 'school_admin',
                'permissions' => json_encode([
                    'data_pokok:read',
                    'data_pokok:create',
                    'data_pokok:update',
                ]),
                'is_active' => true,
            ]
        );

        // Create inactive user
        User::updateOrCreate(
            ['email' => 'inactive@demo.com'],
            [
                'name' => 'User Tidak Aktif',
                'password' => Hash::make('password'),
                'role' => 'school_admin',
                'permissions' => json_encode([]),
                'is_active' => false,
            ]
        );

        $this->command->info('Demo users created successfully!');
        $this->command->info('Admin: admin@demo.com / password');
        $this->command->info('Operator: operator@demo.com / password');
        $this->command->info('Kepala Sekolah: kepala@demo.com / password');
    }
}