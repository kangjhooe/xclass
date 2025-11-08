<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant\Question;
use App\Models\Core\Tenant;
use App\Models\Tenant\Subject;
use App\Models\User;

class SharedQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a demo tenant for shared questions
        $demoTenant = Tenant::firstOrCreate(
            ['domain' => 'demo-shared'],
            [
                'name' => 'Demo Shared Questions',
                'description' => 'Tenant untuk soal-soal yang dibagikan',
                'is_active' => true,
            ]
        );

        // Get or create a demo user
        $demoUser = User::firstOrCreate(
            ['email' => 'demo@shared.com'],
            [
                'name' => 'Demo Shared User',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );

        // Get or create demo subjects
        $subjects = [
            'Matematika' => 'Matematika Dasar',
            'Bahasa Indonesia' => 'Bahasa dan Sastra Indonesia',
            'Bahasa Inggris' => 'English Language',
            'IPA' => 'Ilmu Pengetahuan Alam',
            'IPS' => 'Ilmu Pengetahuan Sosial',
            'PKn' => 'Pendidikan Kewarganegaraan',
        ];

        $subjectIds = [];
        foreach ($subjects as $name => $description) {
            $subject = Subject::firstOrCreate(
                [
                    'instansi_id' => $demoTenant->id,
                    'name' => $name,
                ],
                [
                    'description' => $description,
                    'is_active' => true,
                ]
            );
            $subjectIds[$name] = $subject->id;
        }

        // Create shared questions
        $sharedQuestions = [
            // Matematika
            [
                'subject_id' => $subjectIds['Matematika'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Berapakah hasil dari 15 + 27?',
                'type' => Question::TYPE_MULTIPLE_CHOICE,
                'options' => [
                    'A' => '40',
                    'B' => '42',
                    'C' => '44',
                    'D' => '46'
                ],
                'answer_key' => 'B',
                'explanation' => '15 + 27 = 42',
                'points' => 1,
                'difficulty' => Question::DIFFICULTY_EASY,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
            [
                'subject_id' => $subjectIds['Matematika'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Jika x + 5 = 12, maka nilai x adalah...',
                'type' => Question::TYPE_FILL_BLANK,
                'answer_key' => '7',
                'explanation' => 'x + 5 = 12, maka x = 12 - 5 = 7',
                'points' => 2,
                'difficulty' => Question::DIFFICULTY_MEDIUM,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
            [
                'subject_id' => $subjectIds['Matematika'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Jelaskan cara menghitung luas persegi panjang!',
                'type' => Question::TYPE_ESSAY,
                'answer_key' => null,
                'explanation' => 'Luas persegi panjang = panjang × lebar',
                'points' => 5,
                'difficulty' => Question::DIFFICULTY_MEDIUM,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],

            // Bahasa Indonesia
            [
                'subject_id' => $subjectIds['Bahasa Indonesia'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Apa yang dimaksud dengan puisi?',
                'type' => Question::TYPE_MULTIPLE_CHOICE,
                'options' => [
                    'A' => 'Karya sastra yang berbentuk prosa',
                    'B' => 'Karya sastra yang berbentuk sajak',
                    'C' => 'Karya sastra yang berbentuk drama',
                    'D' => 'Karya sastra yang berbentuk cerita pendek'
                ],
                'answer_key' => 'B',
                'explanation' => 'Puisi adalah karya sastra yang berbentuk sajak dengan ciri khas rima dan irama',
                'points' => 2,
                'difficulty' => Question::DIFFICULTY_EASY,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
            [
                'subject_id' => $subjectIds['Bahasa Indonesia'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Tuliskan contoh kalimat yang menggunakan kata sifat!',
                'type' => Question::TYPE_ESSAY,
                'answer_key' => null,
                'explanation' => 'Contoh: Rumah itu sangat besar dan indah.',
                'points' => 3,
                'difficulty' => Question::DIFFICULTY_MEDIUM,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],

            // Bahasa Inggris
            [
                'subject_id' => $subjectIds['Bahasa Inggris'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'What is the past tense of "go"?',
                'type' => Question::TYPE_MULTIPLE_CHOICE,
                'options' => [
                    'A' => 'goed',
                    'B' => 'went',
                    'C' => 'gone',
                    'D' => 'going'
                ],
                'answer_key' => 'B',
                'explanation' => 'The past tense of "go" is "went"',
                'points' => 1,
                'difficulty' => Question::DIFFICULTY_EASY,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
            [
                'subject_id' => $subjectIds['Bahasa Inggris'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Translate: "Saya suka membaca buku"',
                'type' => Question::TYPE_FILL_BLANK,
                'answer_key' => 'I like reading books',
                'explanation' => 'I like reading books',
                'points' => 2,
                'difficulty' => Question::DIFFICULTY_MEDIUM,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],

            // IPA
            [
                'subject_id' => $subjectIds['IPA'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Planet terdekat dengan Matahari adalah...',
                'type' => Question::TYPE_MULTIPLE_CHOICE,
                'options' => [
                    'A' => 'Venus',
                    'B' => 'Bumi',
                    'C' => 'Merkurius',
                    'D' => 'Mars'
                ],
                'answer_key' => 'C',
                'explanation' => 'Merkurius adalah planet terdekat dengan Matahari',
                'points' => 2,
                'difficulty' => Question::DIFFICULTY_MEDIUM,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
            [
                'subject_id' => $subjectIds['IPA'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Jelaskan proses fotosintesis pada tumbuhan!',
                'type' => Question::TYPE_ESSAY,
                'answer_key' => null,
                'explanation' => 'Fotosintesis adalah proses tumbuhan mengubah karbon dioksida dan air menjadi glukosa dengan bantuan sinar matahari',
                'points' => 5,
                'difficulty' => Question::DIFFICULTY_HARD,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],

            // IPS
            [
                'subject_id' => $subjectIds['IPS'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Ibu kota Indonesia adalah...',
                'type' => Question::TYPE_MULTIPLE_CHOICE,
                'options' => [
                    'A' => 'Jakarta',
                    'B' => 'Surabaya',
                    'C' => 'Bandung',
                    'D' => 'Medan'
                ],
                'answer_key' => 'A',
                'explanation' => 'Jakarta adalah ibu kota Indonesia',
                'points' => 1,
                'difficulty' => Question::DIFFICULTY_EASY,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
            [
                'subject_id' => $subjectIds['IPS'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Sebutkan 3 provinsi di Pulau Jawa!',
                'type' => Question::TYPE_ESSAY,
                'answer_key' => null,
                'explanation' => 'Contoh: DKI Jakarta, Jawa Barat, Jawa Tengah, Jawa Timur, DI Yogyakarta, Banten',
                'points' => 3,
                'difficulty' => Question::DIFFICULTY_MEDIUM,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],

            // PKn
            [
                'subject_id' => $subjectIds['PKn'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Pancasila sebagai dasar negara Indonesia terdiri dari berapa sila?',
                'type' => Question::TYPE_MULTIPLE_CHOICE,
                'options' => [
                    'A' => '4',
                    'B' => '5',
                    'C' => '6',
                    'D' => '7'
                ],
                'answer_key' => 'B',
                'explanation' => 'Pancasila terdiri dari 5 sila',
                'points' => 1,
                'difficulty' => Question::DIFFICULTY_EASY,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
            [
                'subject_id' => $subjectIds['PKn'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Sebutkan sila-sila dalam Pancasila!',
                'type' => Question::TYPE_ESSAY,
                'answer_key' => null,
                'explanation' => '1. Ketuhanan Yang Maha Esa, 2. Kemanusiaan yang Adil dan Beradab, 3. Persatuan Indonesia, 4. Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan, 5. Keadilan Sosial bagi Seluruh Rakyat Indonesia',
                'points' => 5,
                'difficulty' => Question::DIFFICULTY_HARD,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],

            // True/False Questions
            [
                'subject_id' => $subjectIds['Matematika'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => '2 + 2 = 4',
                'type' => Question::TYPE_TRUE_FALSE,
                'options' => [
                    'true' => 'Benar',
                    'false' => 'Salah'
                ],
                'answer_key' => 'true',
                'explanation' => '2 + 2 memang sama dengan 4',
                'points' => 1,
                'difficulty' => Question::DIFFICULTY_EASY,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
            [
                'subject_id' => $subjectIds['IPA'],
                'tenant_id' => $demoTenant->id,
                'creator_id' => $demoUser->id,
                'question_text' => 'Bumi adalah planet terbesar di tata surya',
                'type' => Question::TYPE_TRUE_FALSE,
                'options' => [
                    'true' => 'Benar',
                    'false' => 'Salah'
                ],
                'answer_key' => 'false',
                'explanation' => 'Jupiter adalah planet terbesar di tata surya',
                'points' => 1,
                'difficulty' => Question::DIFFICULTY_MEDIUM,
                'visibility' => Question::VISIBILITY_SHARED,
                'shared_at' => now(),
            ],
        ];

        foreach ($sharedQuestions as $questionData) {
            Question::create($questionData);
        }

        $this->command->info('Shared questions seeded successfully!');
    }
}
