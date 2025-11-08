<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;
use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use Illuminate\Support\Facades\DB;

class StudentDummySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $npsn = '10816663';
        
        // Cek atau buat tenant
        $tenant = \App\Models\Core\Tenant::where('npsn', $npsn)->first();
        if (!$tenant) {
            $this->command->error("Tenant dengan NPSN {$npsn} tidak ditemukan. Silakan buat tenant terlebih dahulu.");
            return;
        }
        
        $tenantId = $tenant->id;

        // Buat kelas jika belum ada
        $requiredClasses = [
            'VII IPA 1', 'VII IPA 2', 'VII IPA 3', 'VII IPS 1', 'VII IPS 2',
            'VIII IPA 1', 'VIII IPA 2', 'VIII IPS 1', 'VIII IPS 2',
            'IX IPA 1', 'IX IPA 2', 'IX IPS 1', 'IX IPS 2'
        ];
        
        foreach ($requiredClasses as $className) {
            $parts = explode(' ', $className);
            $level = $parts[0];
            $major = $parts[1] ?? null;
            
            ClassRoom::firstOrCreate(
                [
                    'instansi_id' => $tenantId,
                    'name' => $className,
                ],
                [
                    'npsn' => $npsn,
                    'level' => $level,
                    'major' => $major,
                    'capacity' => 35,
                    'room_number' => str_replace(' ', '-', $className),
                    'academic_year' => '2024/2025',
                    'is_active' => true,
                ]
            );
        }
        
        // Ambil semua kelas
        $classes = ClassRoom::where('instansi_id', $tenantId)->get();

        // Map nama kelas ke ID kelas
        $classMap = [];
        foreach ($classes as $class) {
            $classMap[$class->name] = $class->id;
        }

        // Data dummy siswa (30 siswa)
        $studentsData = [
            [
                'name' => 'Ahmad Rizki Pratama',
                'email' => 'ahmad.rizki@student.school.id',
                'phone' => '081234567001',
                'nis' => 'S001', // Menggunakan 'nis' bukan 'student_number'
                'nisn' => '0012345678',
                'nik' => '3201011501070001',
                'birth_date' => '2007-01-15',
                'birth_place' => 'Jakarta',
                'gender' => 'male', // Database menggunakan male/female
                'religion' => 'Islam',
                'address' => 'Jl. Merdeka No. 45',
                'rt' => '005',
                'rw' => '012',
                'village' => 'Cikini',
                'sub_district' => 'Menteng',
                'district' => 'Jakarta Pusat',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '10330',
                'residence_type' => 'Rumah Pribadi',
                'transportation' => 'Sepeda Motor',
                'blood_type' => 'O',
                'height' => '165',
                'weight' => '58',
                'health_condition' => 'Baik',
                'allergies' => 'Udang',
                'previous_school' => 'SMP Negeri 1 Jakarta',
                'previous_school_address' => 'Jl. Sudirman No. 10',
                'previous_school_city' => 'Jakarta',
                'previous_school_province' => 'DKI Jakarta',
                'previous_school_phone' => '0212345678',
                'previous_school_principal' => 'Dr. Siti Aminah, M.Pd',
                'previous_school_graduation_year' => '2024',
                'previous_school_certificate_number' => 'IJZ-2024-001',
                'father_name' => 'H. Bambang Sutrisno',
                'father_nik' => '3201017308190001',
                'father_birth_date' => '1973-08-19',
                'father_birth_place' => 'Jakarta',
                'father_education' => 'S1 Teknik',
                'father_occupation' => 'PNS',
                'father_company' => 'Kementerian Pendidikan',
                'father_phone' => '081234567901',
                'father_email' => 'bambang.sutrisno@email.com',
                'father_income' => 8500000.00,
                'mother_name' => 'Dra. Siti Nurhaliza',
                'mother_nik' => '3201017503110002',
                'mother_birth_date' => '1975-03-11',
                'mother_birth_place' => 'Jakarta',
                'mother_education' => 'S1 Pendidikan',
                'mother_occupation' => 'Guru',
                'mother_company' => 'SMP Negeri 5 Jakarta',
                'mother_phone' => '081234567902',
                'mother_email' => 'siti.nurhaliza@email.com',
                'mother_income' => 7500000.00,
                'parent_name' => 'H. Bambang Sutrisno',
                'parent_phone' => '081234567901',
                'parent_email' => 'bambang.sutrisno@email.com',
                'parent_occupation' => 'PNS',
                'class_name' => 'VII IPA 1',
                'enrollment_date' => '2024-07-15',
                'enrollment_semester' => 'Ganjil',
                'enrollment_year' => '2024',
                'student_status' => 'active',
                'notes' => 'Siswa berprestasi',
                'emergency_contact_name' => 'H. Bambang Sutrisno',
                'emergency_contact_phone' => '081234567901',
                'emergency_contact_relationship' => 'Ayah',
            ],
            [
                'name' => 'Siti Nur Aisyah',
                'email' => 'siti.nur@student.school.id',
                'phone' => '081234567002',
                'nis' => 'S002',
                'nisn' => '0012345679',
                'nik' => '3201011502080002',
                'birth_date' => '2008-02-15',
                'birth_place' => 'Jakarta',
                'gender' => 'female',
                'religion' => 'Islam',
                'address' => 'Jl. Gatot Subroto No. 78',
                'rt' => '003',
                'rw' => '008',
                'village' => 'Kuningan',
                'sub_district' => 'Setiabudi',
                'district' => 'Jakarta Selatan',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '12950',
                'residence_type' => 'Rumah Pribadi',
                'transportation' => 'Mobil Pribadi',
                'blood_type' => 'A',
                'height' => '158',
                'weight' => '52',
                'health_condition' => 'Baik',
                'previous_school' => 'SMP Negeri 2 Jakarta',
                'previous_school_address' => 'Jl. Thamrin No. 20',
                'previous_school_city' => 'Jakarta',
                'previous_school_province' => 'DKI Jakarta',
                'previous_school_phone' => '0212345679',
                'previous_school_principal' => 'Dr. Ahmad Fauzi, M.Pd',
                'previous_school_graduation_year' => '2024',
                'previous_school_certificate_number' => 'IJZ-2024-002',
                'father_name' => 'Ir. Muhammad Rizal',
                'father_nik' => '3201017005120003',
                'father_birth_date' => '1970-05-12',
                'father_birth_place' => 'Jakarta',
                'father_education' => 'S2 Teknik Sipil',
                'father_occupation' => 'Konsultan',
                'father_company' => 'PT Konstruksi Maju',
                'father_phone' => '081234567903',
                'father_email' => 'muhammad.rizal@email.com',
                'father_income' => 12000000.00,
                'mother_name' => 'Dr. Aisyah Putri, Sp.PD',
                'mother_nik' => '3201017208060004',
                'mother_birth_date' => '1972-08-06',
                'mother_birth_place' => 'Jakarta',
                'mother_education' => 'S2 Kedokteran',
                'mother_occupation' => 'Dokter',
                'mother_company' => 'RS Cipto Mangunkusumo',
                'mother_phone' => '081234567904',
                'mother_email' => 'aisyah.putri@email.com',
                'mother_income' => 15000000.00,
                'parent_name' => 'Ir. Muhammad Rizal',
                'parent_phone' => '081234567903',
                'parent_email' => 'muhammad.rizal@email.com',
                'parent_occupation' => 'Konsultan',
                'class_name' => 'VII IPA 2',
                'enrollment_date' => '2024-07-15',
                'enrollment_semester' => 'Ganjil',
                'enrollment_year' => '2024',
                'student_status' => 'active',
                'emergency_contact_name' => 'Ir. Muhammad Rizal',
                'emergency_contact_phone' => '081234567903',
                'emergency_contact_relationship' => 'Ayah',
            ],
            // Siswa ke-3 dan seterusnya akan ditambahkan dengan format yang sama
            // Untuk efisiensi, saya akan membuat fungsi helper untuk data yang lebih banyak
        ];

        $this->command->info('Memasukkan data dummy siswa...');
        
        $created = 0;
        foreach ($studentsData as $studentData) {
            $className = $studentData['class_name'];
            unset($studentData['class_name']);

            // Skip jika kelas tidak ditemukan
            if (!isset($classMap[$className])) {
                $this->command->warn("Kelas '{$className}' tidak ditemukan. Skip siswa: {$studentData['name']}");
                continue;
            }

            // Ubah student_number menjadi nis jika ada
            if (isset($studentData['student_number'])) {
                $studentData['nis'] = $studentData['student_number'];
                unset($studentData['student_number']);
            }

            // Cek apakah siswa sudah ada (gunakan where closure untuk menghindari masalah OR)
            $existing = Student::where('instansi_id', $tenantId)
                ->where(function($query) use ($studentData) {
                    $query->where('email', $studentData['email']);
                    if (isset($studentData['nis'])) {
                        $query->orWhere('nis', $studentData['nis']);
                    }
                })
                ->first();

            if ($existing) {
                $this->command->info("Siswa {$studentData['name']} sudah ada. Skip.");
                continue;
            }

            $studentData['instansi_id'] = $tenantId;
            $studentData['npsn'] = $npsn;
            $studentData['class_id'] = $classMap[$className];
            $studentData['is_active'] = true;

            try {
                Student::create($studentData);
                $created++;
                $this->command->info("✓ {$studentData['name']} - {$className}");
            } catch (\Exception $e) {
                $this->command->error("✗ Gagal membuat {$studentData['name']}: " . $e->getMessage());
            }
        }

        $this->command->info("\nSelesai! Berhasil membuat {$created} data siswa dummy.");
        
        // Jika masih kurang, buat data tambahan secara otomatis
        if ($created < 10) {
            $this->command->info('Membuat data tambahan...');
            $this->createAdditionalStudents($tenantId, $npsn, $classMap, 30 - $created);
        }
    }

    /**
     * Buat data siswa tambahan secara otomatis
     */
    private function createAdditionalStudents($tenantId, $npsn, $classMap, $count)
    {
        $firstNames = ['Ahmad', 'Budi', 'Candra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko', 'Kartika', 'Luki', 'Maya', 'Nurul', 'Omar', 'Putri', 'Qori', 'Rizki', 'Sinta', 'Taufik', 'Umi', 'Vina', 'Wahyu', 'Xena', 'Yoga', 'Zaskia'];
        $lastNames = ['Pratama', 'Santoso', 'Kusuma', 'Sari', 'Wijaya', 'Ramadhan', 'Permata', 'Setiawan', 'Lestari', 'Susilo', 'Dewi', 'Putra', 'Indah', 'Hikmah', 'Faruq', 'Wulandari', 'Sandria', 'Maulana', 'Dewi', 'Hidayat', 'Kulsum', 'Panduwinata', 'Pratama', 'Karina', 'Pratama', 'Gotik'];
        
        $genders = ['male', 'female'];
        $religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha'];
        $cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Makassar', 'Palembang', 'Malang', 'Denpasar'];
        $provinces = ['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'DI Yogyakarta', 'Jawa Tengah', 'Sumatera Utara', 'Sulawesi Selatan', 'Sumatera Selatan', 'Bali'];
        
        $classNames = array_keys($classMap);
        $created = 0;
        
        for ($i = 1; $i <= $count; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $name = $firstName . ' ' . $lastName;
            $gender = $genders[array_rand($genders)];
            $email = strtolower(str_replace(' ', '.', $name)) . $i . '@student.' . $npsn . '.id';
            
            // Cek duplikasi
            if (Student::where('instansi_id', $tenantId)->where('email', $email)->exists()) {
                continue;
            }
            
            $studentData = [
                'instansi_id' => $tenantId,
                'npsn' => $npsn,
                'name' => $name,
                'email' => $email,
                'phone' => '08' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                'nis' => 'S' . str_pad($i + 2, 3, '0', STR_PAD_LEFT),
                'nisn' => str_pad(rand(1000000000, 9999999999), 10, '0', STR_PAD_LEFT),
                'gender' => $gender,
                'religion' => $religions[array_rand($religions)],
                'birth_date' => now()->subYears(rand(13, 17))->subDays(rand(1, 365)),
                'birth_place' => $cities[array_rand($cities)],
                'address' => 'Jl. ' . ['Merdeka', 'Sudirman', 'Gatot Subroto', 'Thamrin'][array_rand(['Merdeka', 'Sudirman', 'Gatot Subroto', 'Thamrin'])] . ' No. ' . rand(1, 200),
                'city' => $cities[array_rand($cities)],
                'province' => $provinces[array_rand($provinces)],
                'postal_code' => str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT),
                'class_id' => $classMap[$classNames[array_rand($classNames)]],
                'parent_name' => 'Orang Tua ' . $name,
                'parent_phone' => '08' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                'enrollment_date' => now()->subYears(rand(0, 2)),
                'enrollment_semester' => ['Ganjil', 'Genap'][array_rand(['Ganjil', 'Genap'])],
                'enrollment_year' => date('Y') - rand(0, 2),
                'student_status' => 'active',
                'is_active' => true,
            ];
            
            try {
                Student::create($studentData);
                $created++;
            } catch (\Exception $e) {
                continue;
            }
        }
        
        $this->command->info("Berhasil membuat {$created} data siswa tambahan.");
    }
}

