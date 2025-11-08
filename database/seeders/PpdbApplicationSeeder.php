<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PPDBApplication;
use App\Models\Core\Tenant;
use App\Core\Services\PPDB\RegistrationService;
use Carbon\Carbon;

class PpdbApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->warn('Tidak ada tenant ditemukan. Silakan jalankan TenantSeeder terlebih dahulu.');
            return;
        }

        foreach ($tenants as $tenant) {
            $this->seedApplications($tenant);
        }

        $this->command->info('Data dummy PPDB berhasil dibuat!');
    }

    protected function seedApplications(Tenant $tenant): void
    {
        // Clear existing data for this tenant to avoid conflicts
        PPDBApplication::where('instansi_id', $tenant->id)->delete();
        
        $academicYear = date('Y') . '/' . (date('Y') + 1);
        $batches = ['Gelombang 1', 'Gelombang 2', 'Gelombang 3'];
        $majors = ['IPA', 'IPS', 'Bahasa', 'Agama'];
        $registrationPaths = [
            PPDBApplication::REGISTRATION_PATH_ZONASI,
            PPDBApplication::REGISTRATION_PATH_AFFIRMATIVE,
            PPDBApplication::REGISTRATION_PATH_ACHIEVEMENT,
            PPDBApplication::REGISTRATION_PATH_ACADEMIC,
            PPDBApplication::REGISTRATION_PATH_TRANSFER,
        ];

        $statuses = [
            PPDBApplication::STATUS_PENDING,
            PPDBApplication::STATUS_REGISTERED,
            PPDBApplication::STATUS_SELECTION,
            PPDBApplication::STATUS_ANNOUNCED,
            PPDBApplication::STATUS_ACCEPTED,
            PPDBApplication::STATUS_REJECTED,
            PPDBApplication::STATUS_CANCELLED,
        ];

        $cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Palembang', 'Makassar'];
        $occupations = ['Pegawai Negeri', 'Guru', 'Wiraswasta', 'Petani', 'Nelayan', 'Karyawan Swasta', 'PNS', 'Dokter'];
        $schools = [
            'SMP Negeri 1', 'SMP Negeri 2', 'SMP Muhammadiyah 1', 'SMP Al Falah',
            'MTs Negeri 1', 'MTs Swasta', 'SMP Islam Terpadu', 'MTs Al Hikmah'
        ];

        // Data dummy dengan berbagai status
        $applications = [
            // PENDING - 3 aplikasi
            [
                'status' => PPDBApplication::STATUS_PENDING,
                'count' => 3,
                'hasScores' => false,
            ],
            // REGISTERED - 5 aplikasi
            [
                'status' => PPDBApplication::STATUS_REGISTERED,
                'count' => 5,
                'hasScores' => false,
            ],
            // SELECTION - 8 aplikasi dengan nilai
            [
                'status' => PPDBApplication::STATUS_SELECTION,
                'count' => 8,
                'hasScores' => true,
            ],
            // ANNOUNCED - 6 aplikasi dengan nilai
            [
                'status' => PPDBApplication::STATUS_ANNOUNCED,
                'count' => 6,
                'hasScores' => true,
            ],
            // ACCEPTED - 10 aplikasi dengan nilai tinggi
            [
                'status' => PPDBApplication::STATUS_ACCEPTED,
                'count' => 10,
                'hasScores' => true,
                'scoreRange' => [75, 95],
            ],
            // REJECTED - 7 aplikasi dengan nilai rendah atau alasan
            [
                'status' => PPDBApplication::STATUS_REJECTED,
                'count' => 7,
                'hasScores' => true,
                'scoreRange' => [40, 65],
            ],
            // CANCELLED - 2 aplikasi
            [
                'status' => PPDBApplication::STATUS_CANCELLED,
                'count' => 2,
                'hasScores' => false,
            ],
        ];

        $year = substr($academicYear, 0, 4);
        
        // Initialize batch counters - use global count to ensure uniqueness across tenants
        $batchCounts = [];
        foreach ($batches as $batch) {
            // Get global count for this batch across all tenants to ensure uniqueness
            preg_match('/\d+/', $batch, $batchMatches);
            $batchNum = $batchMatches[0] ?? '1';
            $batchCode = 'GEL' . str_pad($batchNum, 2, '0', STR_PAD_LEFT);
            
            // Find max sequence number for this batch code globally
            $existingMax = PPDBApplication::where('registration_number', 'like', "PPDB{$year}{$batchCode}%")
                ->orderByRaw('CAST(SUBSTR(registration_number, -4) AS INTEGER) DESC')
                ->first();
            
            if ($existingMax && preg_match('/PPDB\d{4}GEL\d{2}(\d{4})$/', $existingMax->registration_number, $matches)) {
                $batchCounts[$batch] = (int)$matches[1];
            } else {
                $batchCounts[$batch] = 0;
            }
        }
        
        foreach ($applications as $appConfig) {
            for ($i = 0; $i < $appConfig['count']; $i++) {
                $batch = fake()->randomElement($batches);
                $major = fake()->randomElement($majors);
                $registrationPath = fake()->randomElement($registrationPaths);
                
                // Generate unique registration number globally
                preg_match('/\d+/', $batch, $batchMatches);
                $batchNum = $batchMatches[0] ?? '1';
                $batchCode = 'GEL' . str_pad($batchNum, 2, '0', STR_PAD_LEFT); // GEL01, GEL02, GEL03
                
                // Generate registration number - ensure uniqueness
                $registrationNumber = null;
                $attempts = 0;
                while ($registrationNumber === null || PPDBApplication::where('registration_number', $registrationNumber)->exists()) {
                    if ($attempts++ > 50) {
                        // Fallback: use microtime to ensure uniqueness
                        $microtime = substr(str_replace('.', '', microtime(true)), -6);
                        $registrationNumber = "PPDB{$year}{$batchCode}{$microtime}";
                        break;
                    }
                    
                    $batchCounts[$batch] = ($batchCounts[$batch] ?? 0) + 1;
                    $sequence = str_pad($batchCounts[$batch], 4, '0', STR_PAD_LEFT);
                    $registrationNumber = "PPDB{$year}{$batchCode}{$sequence}";
                }
                
                $gender = fake()->randomElement(['L', 'P']);
                $fullName = fake('id_ID')->name($gender === 'L' ? 'male' : 'female');
                
                $data = [
                    'instansi_id' => $tenant->id,
                    'registration_number' => $registrationNumber,
                    'full_name' => $fullName,
                    'email' => fake()->unique()->safeEmail(),
                    'phone' => '08' . fake()->numerify('##########'),
                    'birth_date' => fake()->date('Y-m-d', '2010-01-01'),
                    'birth_place' => fake()->randomElement($cities),
                    'gender' => $gender,
                    'address' => 'Jl. ' . fake('id_ID')->streetName() . ' No. ' . fake()->numberBetween(1, 200) . ', ' . fake()->randomElement($cities),
                    'previous_school' => fake()->randomElement($schools) . ' ' . fake()->randomElement($cities),
                    'previous_school_address' => 'Jl. Pendidikan No. ' . fake()->numberBetween(1, 100) . ', ' . fake()->randomElement($cities),
                    'major_choice' => $major,
                    'parent_name' => fake('id_ID')->name(),
                    'parent_phone' => '08' . fake()->numerify('##########'),
                    'parent_occupation' => fake()->randomElement($occupations),
                    'parent_income' => fake()->numberBetween(2000000, 15000000),
                    'academic_year' => $academicYear,
                    'batch' => $batch,
                    'registration_path' => $registrationPath,
                    'status' => $appConfig['status'],
                    'registration_date' => fake()->dateTimeBetween('-2 months', 'now'),
                    'payment_status' => $appConfig['status'] !== PPDBApplication::STATUS_PENDING ? fake()->boolean(80) : false,
                    'payment_date' => $appConfig['status'] !== PPDBApplication::STATUS_PENDING ? fake()->dateTimeBetween('-1 month', 'now') : null,
                    'payment_amount' => $appConfig['status'] !== PPDBApplication::STATUS_PENDING ? fake()->numberBetween(100000, 500000) : null,
                    'notes' => fake()->optional()->sentence(),
                    'photo_status' => fake()->optional(0.7)->randomElement(['valid', 'revisi']),
                    'ijazah_status' => fake()->optional(0.7)->randomElement(['valid', 'revisi']),
                    'kk_status' => fake()->optional(0.7)->randomElement(['valid', 'revisi']),
                ];

                // Add scores if needed
                if ($appConfig['hasScores']) {
                    $scoreRange = $appConfig['scoreRange'] ?? [50, 90];
                    $selectionScore = fake()->numberBetween($scoreRange[0], $scoreRange[1]);
                    $interviewScore = fake()->numberBetween($scoreRange[0], $scoreRange[1]);
                    $documentScore = fake()->numberBetween($scoreRange[0], $scoreRange[1]);
                    $totalScore = round(($selectionScore + $interviewScore + $documentScore) / 3, 2);

                    $data['selection_score'] = $selectionScore;
                    $data['interview_score'] = $interviewScore;
                    $data['document_score'] = $documentScore;
                    $data['total_score'] = $totalScore;
                    $data['selection_date'] = fake()->dateTimeBetween('-1 month', 'now');
                }

                // Add status-specific dates
                switch ($appConfig['status']) {
                    case PPDBApplication::STATUS_SELECTION:
                        $data['selection_date'] = fake()->dateTimeBetween('-3 weeks', 'now');
                        break;
                    case PPDBApplication::STATUS_ANNOUNCED:
                        $data['selection_date'] = fake()->dateTimeBetween('-1 month', '-1 week');
                        $data['announcement_date'] = fake()->dateTimeBetween('-1 week', 'now');
                        break;
                    case PPDBApplication::STATUS_ACCEPTED:
                        $data['selection_date'] = fake()->dateTimeBetween('-1 month', '-2 weeks');
                        $data['announcement_date'] = fake()->dateTimeBetween('-2 weeks', '-1 week');
                        $data['accepted_date'] = fake()->dateTimeBetween('-1 week', 'now');
                        break;
                    case PPDBApplication::STATUS_REJECTED:
                        $data['selection_date'] = fake()->dateTimeBetween('-1 month', '-2 weeks');
                        $data['announcement_date'] = fake()->dateTimeBetween('-2 weeks', '-1 week');
                        $rejectionReasons = [
                            'Nilai tidak memenuhi syarat',
                            'Kuota sudah penuh',
                            'Dokumen tidak lengkap',
                            'Tidak memenuhi kriteria seleksi',
                            'Melanggar ketentuan pendaftaran',
                        ];
                        $data['rejected_reason'] = fake()->randomElement($rejectionReasons);
                        break;
                }

                // Add documents status if documents exist
                if (fake()->boolean(60)) {
                    $docCount = fake()->numberBetween(1, 3);
                    $docStatuses = [];
                    for ($j = 0; $j < $docCount; $j++) {
                        $docStatuses[$j] = fake()->randomElement(['pending', 'valid', 'revisi']);
                    }
                    $data['documents_status'] = $docStatuses;
                }

                // Create with try-catch for additional safety
                try {
                    PPDBApplication::create($data);
                } catch (\Illuminate\Database\QueryException $e) {
                    if (str_contains($e->getMessage(), 'UNIQUE constraint failed') && str_contains($e->getMessage(), 'registration_number')) {
                        // If still conflict, use microtime
                        $microtime = substr(str_replace('.', '', microtime(true)), -6);
                        $data['registration_number'] = "PPDB{$year}{$batchCode}{$microtime}";
                        PPDBApplication::create($data);
                    } else {
                        throw $e;
                    }
                }
            }
        }

        $this->command->info("Berhasil membuat " . array_sum(array_column($applications, 'count')) . " data dummy PPDB untuk tenant: {$tenant->name}");
    }
}

