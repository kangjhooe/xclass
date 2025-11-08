<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant\QuestionGroup;
use App\Models\Tenant\Question;
use App\Models\Tenant\Subject;
use App\Models\Core\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class QuestionGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a tenant to create question groups
        $tenant = Tenant::first();
        if (!$tenant) {
            $this->command->info('Skipping QuestionGroupSeeder: No tenant found.');
            return;
        }

        // Get a user from the tenant
        $user = User::where('instansi_id', $tenant->id)->first();
        if (!$user) {
            $this->command->info('Skipping QuestionGroupSeeder: No user found for tenant.');
            return;
        }

        // Get a subject
        $subject = Subject::where('instansi_id', $tenant->id)->first();
        if (!$subject) {
            $this->command->info('Skipping QuestionGroupSeeder: No subject found for tenant.');
            return;
        }

        tenancy()->for($tenant, function () use ($user, $subject) {
            // Create text stimulus group
            $textGroup = QuestionGroup::create([
                'tenant_id' => $tenant->id,
                'subject_id' => $subject->id,
                'created_by' => $user->id,
                'title' => 'Cerita Pendek: "Petualangan di Hutan"',
                'description' => 'Bacalah cerita pendek berikut dengan saksama, kemudian jawablah pertanyaan-pertanyaan yang berkaitan dengan cerita tersebut.',
                'stimulus_type' => QuestionGroup::STIMULUS_TYPE_TEXT,
                'stimulus_content' => 'Pada suatu hari yang cerah, Rina dan adiknya, Budi, memutuskan untuk berpetualang di hutan dekat rumah mereka. Mereka membawa bekal makanan dan air minum, serta kamera untuk mengabadikan momen-momen menarik.

Hutan itu sangat lebat dengan pohon-pohon tinggi yang menjulang ke langit. Suara burung-burung berkicau dan angin sepoi-sepoi membuat suasana terasa damai. Rina dan Budi berjalan mengikuti jalan setapak yang sudah ada, sambil mengamati berbagai jenis tumbuhan dan hewan yang mereka temui.

Di tengah perjalanan, mereka menemukan sebuah sungai kecil yang airnya jernih. Di sana, mereka melihat ikan-ikan kecil berenang dengan riang. Rina mengambil foto-foto indah di sekitar sungai, sementara Budi mencoba menangkap ikan dengan tangan kosong, meskipun tidak berhasil.

Setelah beristirahat sejenak di tepi sungai, mereka melanjutkan perjalanan. Tiba-tiba, langit mulai mendung dan terdengar suara guntur di kejauhan. Rina dan Budi menyadari bahwa hujan akan segera turun, sehingga mereka memutuskan untuk pulang.

Dalam perjalanan pulang, hujan mulai turun dengan deras. Mereka berlari mencari tempat berteduh di bawah pohon besar. Meskipun basah kuyup, mereka tetap tersenyum karena petualangan hari itu memberikan pengalaman yang tak terlupakan.',
            ]);

            // Create questions for text group
            $textQuestions = [
                [
                    'question_text' => 'Siapa yang berpetualang di hutan?',
                    'type' => Question::TYPE_MULTIPLE_CHOICE,
                    'options' => [
                        'A' => 'Rina dan Budi',
                        'B' => 'Rina dan temannya',
                        'C' => 'Budi dan temannya',
                        'D' => 'Rina sendiri'
                    ],
                    'answer_key' => 'A',
                    'points' => 2,
                    'difficulty' => Question::DIFFICULTY_EASY,
                    'explanation' => 'Dalam cerita disebutkan bahwa Rina dan adiknya, Budi, yang berpetualang di hutan.'
                ],
                [
                    'question_text' => 'Apa yang dibawa Rina dan Budi untuk berpetualang?',
                    'type' => Question::TYPE_MULTIPLE_CHOICE,
                    'options' => [
                        'A' => 'Hanya bekal makanan',
                        'B' => 'Bekal makanan, air minum, dan kamera',
                        'C' => 'Hanya kamera',
                        'D' => 'Bekal makanan dan air minum saja'
                    ],
                    'answer_key' => 'B',
                    'points' => 2,
                    'difficulty' => Question::DIFFICULTY_EASY,
                    'explanation' => 'Cerita menyebutkan mereka membawa bekal makanan, air minum, dan kamera.'
                ],
                [
                    'question_text' => 'Mengapa Rina dan Budi memutuskan untuk pulang?',
                    'type' => Question::TYPE_MULTIPLE_CHOICE,
                    'options' => [
                        'A' => 'Karena sudah lelah',
                        'B' => 'Karena bekal habis',
                        'C' => 'Karena langit mendung dan akan hujan',
                        'D' => 'Karena sudah gelap'
                    ],
                    'answer_key' => 'C',
                    'points' => 3,
                    'difficulty' => Question::DIFFICULTY_MEDIUM,
                    'explanation' => 'Mereka melihat langit mendung dan mendengar guntur, sehingga menyadari hujan akan turun.'
                ],
                [
                    'question_text' => 'Bagaimana perasaan Rina dan Budi setelah petualangan tersebut?',
                    'type' => Question::TYPE_ESSAY,
                    'points' => 5,
                    'difficulty' => Question::DIFFICULTY_MEDIUM,
                    'explanation' => 'Meskipun basah kuyup karena hujan, mereka tetap tersenyum karena mendapat pengalaman yang tak terlupakan.'
                ]
            ];

            foreach ($textQuestions as $index => $questionData) {
                $question = Question::create([
                    'tenant_id' => $tenant->id,
                    'subject_id' => $subject->id,
                    'creator_id' => $user->id,
                    'question_group_id' => $textGroup->id,
                    'group_order' => $index + 1,
                    'question_text' => $questionData['question_text'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? null,
                    'answer_key' => $questionData['answer_key'] ?? null,
                    'points' => $questionData['points'],
                    'difficulty' => $questionData['difficulty'],
                    'explanation' => $questionData['explanation'],
                    'visibility' => Question::VISIBILITY_PRIVATE,
                ]);
            }

            // Create image stimulus group
            $imageGroup = QuestionGroup::create([
                'tenant_id' => $tenant->id,
                'subject_id' => $subject->id,
                'created_by' => $user->id,
                'title' => 'Diagram Siklus Air',
                'description' => 'Perhatikan diagram siklus air berikut dengan teliti, kemudian jawablah pertanyaan-pertanyaan yang berkaitan dengan proses yang terjadi.',
                'stimulus_type' => QuestionGroup::STIMULUS_TYPE_IMAGE,
                'stimulus_content' => 'https://example.com/water-cycle-diagram.jpg',
            ]);

            // Create table stimulus group
            $tableGroup = QuestionGroup::create([
                'tenant_id' => $tenant->id,
                'subject_id' => $subject->id,
                'created_by' => $user->id,
                'title' => 'Data Populasi Hewan di Kebun Binatang',
                'description' => 'Analisis data populasi hewan di kebun binatang berikut, kemudian jawablah pertanyaan-pertanyaan yang berkaitan dengan data tersebut.',
                'stimulus_type' => QuestionGroup::STIMULUS_TYPE_TABLE,
                'stimulus_content' => json_encode([
                    'headers' => ['Nama Hewan', 'Jumlah (2020)', 'Jumlah (2021)', 'Jumlah (2022)', 'Kenaikan (%)'],
                    'rows' => [
                        ['Harimau', '15', '18', '22', '46.7'],
                        ['Gajah', '8', '9', '11', '37.5'],
                        ['Orang Utan', '12', '14', '16', '33.3'],
                        ['Burung Merak', '25', '28', '30', '20.0'],
                        ['Kanguru', '6', '7', '8', '33.3']
                    ]
                ]),
            ]);

            // Create questions for table group
            $tableQuestions = [
                [
                    'question_text' => 'Hewan manakah yang mengalami kenaikan populasi tertinggi?',
                    'type' => Question::TYPE_MULTIPLE_CHOICE,
                    'options' => [
                        'A' => 'Harimau',
                        'B' => 'Gajah',
                        'C' => 'Orang Utan',
                        'D' => 'Burung Merak'
                    ],
                    'answer_key' => 'A',
                    'points' => 3,
                    'difficulty' => Question::DIFFICULTY_MEDIUM,
                    'explanation' => 'Harimau mengalami kenaikan 46.7%, yang merupakan kenaikan tertinggi dibanding hewan lainnya.'
                ],
                [
                    'question_text' => 'Berapa total populasi hewan pada tahun 2022?',
                    'type' => Question::TYPE_MULTIPLE_CHOICE,
                    'options' => [
                        'A' => '85',
                        'B' => '87',
                        'C' => '89',
                        'D' => '91'
                    ],
                    'answer_key' => 'B',
                    'points' => 3,
                    'difficulty' => Question::DIFFICULTY_MEDIUM,
                    'explanation' => 'Total populasi 2022 = 22 + 11 + 16 + 30 + 8 = 87'
                ],
                [
                    'question_text' => 'Hewan manakah yang memiliki populasi terbesar pada tahun 2022?',
                    'type' => Question::TYPE_MULTIPLE_CHOICE,
                    'options' => [
                        'A' => 'Harimau',
                        'B' => 'Gajah',
                        'C' => 'Orang Utan',
                        'D' => 'Burung Merak'
                    ],
                    'answer_key' => 'D',
                    'points' => 2,
                    'difficulty' => Question::DIFFICULTY_EASY,
                    'explanation' => 'Burung Merak memiliki populasi 30 pada tahun 2022, yang merupakan jumlah tertinggi.'
                ]
            ];

            foreach ($tableQuestions as $index => $questionData) {
                $question = Question::create([
                    'tenant_id' => $tenant->id,
                    'subject_id' => $subject->id,
                    'creator_id' => $user->id,
                    'question_group_id' => $tableGroup->id,
                    'group_order' => $index + 1,
                    'question_text' => $questionData['question_text'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'],
                    'answer_key' => $questionData['answer_key'],
                    'points' => $questionData['points'],
                    'difficulty' => $questionData['difficulty'],
                    'explanation' => $questionData['explanation'],
                    'visibility' => Question::VISIBILITY_PRIVATE,
                ]);
            }

            $this->command->info('Question groups created successfully!');
            $this->command->info('- Text group: ' . $textGroup->title . ' (' . $textGroup->questions->count() . ' questions)');
            $this->command->info('- Image group: ' . $imageGroup->title);
            $this->command->info('- Table group: ' . $tableGroup->title . ' (' . $tableGroup->questions->count() . ' questions)');
        });
    }
}
