<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Core\Tenant;
use App\Models\Tenant\Subject;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\Student;

class AcademicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $this->command->error('No tenant found. Please run TenantSeeder first.');
            return;
        }

        // Create subjects
        $subjects = [
            ['name' => 'Matematika', 'code' => 'MAT', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 4],
            ['name' => 'Fisika', 'code' => 'FIS', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 3],
            ['name' => 'Kimia', 'code' => 'KIM', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 3],
            ['name' => 'Biologi', 'code' => 'BIO', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 3],
            ['name' => 'Bahasa Indonesia', 'code' => 'BIN', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 4],
            ['name' => 'Bahasa Inggris', 'code' => 'BIG', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 3],
            ['name' => 'Sejarah', 'code' => 'SEJ', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 2],
            ['name' => 'Geografi', 'code' => 'GEO', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 2],
            ['name' => 'Ekonomi', 'code' => 'EKO', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 2],
            ['name' => 'Pendidikan Agama', 'code' => 'PAI', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 2],
        ];

        foreach ($subjects as $subjectData) {
            Subject::create(array_merge($subjectData, [
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ]));
        }

        // Create classes
        $classes = [
            ['name' => 'X IPA 1', 'level' => 'X', 'major' => 'IPA', 'capacity' => 30, 'room_number' => 'A101'],
            ['name' => 'X IPA 2', 'level' => 'X', 'major' => 'IPA', 'capacity' => 30, 'room_number' => 'A102'],
            ['name' => 'X IPS 1', 'level' => 'X', 'major' => 'IPS', 'capacity' => 30, 'room_number' => 'B101'],
            ['name' => 'XI IPA 1', 'level' => 'XI', 'major' => 'IPA', 'capacity' => 30, 'room_number' => 'A201'],
            ['name' => 'XI IPS 1', 'level' => 'XI', 'major' => 'IPS', 'capacity' => 30, 'room_number' => 'B201'],
            ['name' => 'XII IPA 1', 'level' => 'XII', 'major' => 'IPA', 'capacity' => 30, 'room_number' => 'A301'],
            ['name' => 'XII IPS 1', 'level' => 'XII', 'major' => 'IPS', 'capacity' => 30, 'room_number' => 'B301'],
        ];

        foreach ($classes as $classData) {
            ClassRoom::create(array_merge($classData, [
                'instansi_id' => $tenant->id,
                'academic_year' => '2024/2025',
                'is_active' => true,
            ]));
        }

        // Create teachers
        $teachers = [
            ['name' => 'Dr. Ahmad Wijaya', 'email' => 'ahmad.wijaya@sman1jakarta.sch.id', 'nip' => '196512011990031001', 'phone' => '081234567890'],
            ['name' => 'Siti Nurhaliza, S.Pd', 'email' => 'siti.nurhaliza@sman1jakarta.sch.id', 'nip' => '197203151995032002', 'phone' => '081234567891'],
            ['name' => 'Budi Santoso, M.Pd', 'email' => 'budi.santoso@sman1jakarta.sch.id', 'nip' => '197805201998031003', 'phone' => '081234567892'],
            ['name' => 'Dewi Sartika, S.Pd', 'email' => 'dewi.sartika@sman1jakarta.sch.id', 'nip' => '198012101999032004', 'phone' => '081234567893'],
            ['name' => 'Eko Prasetyo, S.Pd', 'email' => 'eko.prasetyo@sman1jakarta.sch.id', 'nip' => '198503151999031005', 'phone' => '081234567894'],
        ];

        foreach ($teachers as $teacherData) {
            Teacher::create(array_merge($teacherData, [
                'instansi_id' => $tenant->id,
                'is_active' => true,
                'employment_date' => now()->subYears(rand(1, 10)),
            ]));
        }

        // Create students
        $students = [
            ['name' => 'Andi Pratama', 'email' => 'andi.pratama@sman1jakarta.sch.id', 'nis' => '2024001', 'phone' => '081234567895'],
            ['name' => 'Budi Setiawan', 'email' => 'budi.setiawan@sman1jakarta.sch.id', 'nis' => '2024002', 'phone' => '081234567896'],
            ['name' => 'Citra Dewi', 'email' => 'citra.dewi@sman1jakarta.sch.id', 'nis' => '2024003', 'phone' => '081234567897'],
            ['name' => 'Dedi Kurniawan', 'email' => 'dedi.kurniawan@sman1jakarta.sch.id', 'nis' => '2024004', 'phone' => '081234567898'],
            ['name' => 'Eka Sari', 'email' => 'eka.sari@sman1jakarta.sch.id', 'nis' => '2024005', 'phone' => '081234567899'],
        ];

        $class = ClassRoom::first();
        
        foreach ($students as $studentData) {
            Student::create(array_merge($studentData, [
                'instansi_id' => $tenant->id,
                'class_id' => $class->id,
                'is_active' => true,
                'enrollment_date' => now()->subMonths(rand(1, 6)),
            ]));
        }

        $this->command->info('Academic data seeded successfully!');
    }
}
