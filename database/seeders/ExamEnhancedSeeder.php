<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant\Question;
use App\Models\Tenant\QuestionGroup;
use App\Models\Tenant\Subject;
use App\Models\User;

class ExamEnhancedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get tenant ID (assuming we're seeding for a specific tenant)
        $tenantId = 1; // Adjust based on your tenant setup
        
        // Get subjects
        $subjects = Subject::where('instansi_id', $tenantId)->get();
        if ($subjects->isEmpty()) {
            $this->command->warn('No subjects found. Please run TenantSeeder first.');
            return;
        }

        // Get teachers
        $teachers = User::where('instansi_id', $tenantId)
            ->where('role', 'teacher')
            ->get();
        
        if ($teachers->isEmpty()) {
            $this->command->warn('No teachers found. Please run TenantSeeder first.');
            return;
        }

        $teacher = $teachers->first();
        $subject = $subjects->first();

        // Create sample question groups
        $this->createQuestionGroups($tenantId, $subject->id, $teacher->id);
        
        // Create sample standalone questions
        $this->createStandaloneQuestions($tenantId, $subject->id, $teacher->id);
        
        // Create shared questions
        $this->createSharedQuestions($tenantId, $subject->id, $teacher->id);

        $this->command->info('Exam enhanced data seeded successfully!');
    }

    private function createQuestionGroups($tenantId, $subjectId, $teacherId)
    {
        // Group 1: Text Stimulus
        $group1 = QuestionGroup::create([
            'instansi_id' => $tenantId,
            'subject_id' => $subjectId,
            'created_by' => $teacherId,
            'title' => 'Bacaan: Sejarah Kemerdekaan Indonesia',
            'description' => 'Kelompok soal berdasarkan bacaan tentang sejarah kemerdekaan Indonesia',
            'stimulus_type' => 'text',
            'stimulus_content' => 'Pada tanggal 17 Agustus 1945, Indonesia memproklamasikan kemerdekaannya. Proklamasi ini dibacakan oleh Soekarno dan Mohammad Hatta di Jalan Pegangsaan Timur No. 56, Jakarta. Peristiwa ini menandai berakhirnya penjajahan Belanda dan Jepang di Indonesia. Kemerdekaan Indonesia tidak diraih dengan mudah, melainkan melalui perjuangan panjang yang melibatkan berbagai tokoh dan organisasi pergerakan nasional.',
        ]);

        // Questions for Group 1
        $this->createQuestionForGroup($tenantId, $subjectId, $teacherId, $group1->id, 1, 
            'Siapakah yang membacakan teks proklamasi kemerdekaan Indonesia?',
            'multiple_choice',
            ['A' => 'Soekarno dan Mohammad Hatta', 'B' => 'Soekarno saja', 'C' => 'Mohammad Hatta saja', 'D' => 'Sutan Sjahrir'],
            'A'
        );

        $this->createQuestionForGroup($tenantId, $subjectId, $teacherId, $group1->id, 2,
            'Di manakah proklamasi kemerdekaan Indonesia dibacakan?',
            'multiple_choice',
            ['A' => 'Istana Merdeka', 'B' => 'Jalan Pegangsaan Timur No. 56', 'C' => 'Lapangan Monas', 'D' => 'Gedung Pancasila'],
            'B'
        );

        $this->createQuestionForGroup($tenantId, $subjectId, $teacherId, $group1->id, 3,
            'Kapan Indonesia memproklamasikan kemerdekaannya?',
            'multiple_choice',
            ['A' => '16 Agustus 1945', 'B' => '17 Agustus 1945', 'C' => '18 Agustus 1945', 'D' => '19 Agustus 1945'],
            'B'
        );

        // Group 2: Table Stimulus
        $group2 = QuestionGroup::create([
            'instansi_id' => $tenantId,
            'subject_id' => $subjectId,
            'created_by' => $teacherId,
            'title' => 'Tabel: Data Penduduk Indonesia',
            'description' => 'Kelompok soal berdasarkan data penduduk Indonesia',
            'stimulus_type' => 'table',
            'stimulus_content' => [
                ['Provinsi', 'Jumlah Penduduk (juta)', 'Kepadatan (/km²)'],
                ['DKI Jakarta', '10.6', '15,978'],
                ['Jawa Barat', '48.3', '1,365'],
                ['Jawa Tengah', '36.5', '1,117'],
                ['Jawa Timur', '40.7', '853'],
                ['Sumatera Utara', '14.8', '201']
            ],
        ]);

        // Questions for Group 2
        $this->createQuestionForGroup($tenantId, $subjectId, $teacherId, $group2->id, 1,
            'Provinsi manakah yang memiliki kepadatan penduduk tertinggi?',
            'multiple_choice',
            ['A' => 'DKI Jakarta', 'B' => 'Jawa Barat', 'C' => 'Jawa Tengah', 'D' => 'Jawa Timur'],
            'A'
        );

        $this->createQuestionForGroup($tenantId, $subjectId, $teacherId, $group2->id, 2,
            'Berapa jumlah penduduk Jawa Barat?',
            'multiple_choice',
            ['A' => '36.5 juta', 'B' => '40.7 juta', 'C' => '48.3 juta', 'D' => '14.8 juta'],
            'C'
        );

        // Group 3: Image Stimulus (using placeholder)
        $group3 = QuestionGroup::create([
            'instansi_id' => $tenantId,
            'subject_id' => $subjectId,
            'created_by' => $teacherId,
            'title' => 'Gambar: Peta Indonesia',
            'description' => 'Kelompok soal berdasarkan peta Indonesia',
            'stimulus_type' => 'image',
            'stimulus_content' => 'https://via.placeholder.com/600x400/0066CC/FFFFFF?text=Peta+Indonesia',
        ]);

        // Questions for Group 3
        $this->createQuestionForGroup($tenantId, $subjectId, $teacherId, $group3->id, 1,
            'Pulau manakah yang terletak di paling barat Indonesia?',
            'multiple_choice',
            ['A' => 'Jawa', 'B' => 'Sumatera', 'C' => 'Kalimantan', 'D' => 'Sulawesi'],
            'B'
        );

        $this->createQuestionForGroup($tenantId, $subjectId, $teacherId, $group3->id, 2,
            'Berapa jumlah pulau besar di Indonesia?',
            'multiple_choice',
            ['A' => '3', 'B' => '4', 'C' => '5', 'D' => '6'],
            'C'
        );
    }

    private function createStandaloneQuestions($tenantId, $subjectId, $teacherId)
    {
        $questions = [
            [
                'question_text' => 'Apa ibukota Indonesia?',
                'question_type' => 'multiple_choice',
                'options' => ['A' => 'Jakarta', 'B' => 'Surabaya', 'C' => 'Bandung', 'D' => 'Medan'],
                'correct_answer' => 'A',
                'difficulty' => 'easy',
                'points' => 1
            ],
            [
                'question_text' => 'Siapakah presiden pertama Indonesia?',
                'question_type' => 'multiple_choice',
                'options' => ['A' => 'Soeharto', 'B' => 'Soekarno', 'C' => 'Habibie', 'D' => 'Megawati'],
                'correct_answer' => 'B',
                'difficulty' => 'easy',
                'points' => 1
            ],
            [
                'question_text' => 'Jelaskan proses terjadinya hujan!',
                'question_type' => 'essay',
                'correct_answer' => 'Hujan terjadi karena proses kondensasi uap air di atmosfer yang kemudian jatuh ke bumi dalam bentuk tetesan air.',
                'difficulty' => 'medium',
                'points' => 5
            ],
            [
                'question_text' => 'Indonesia adalah negara kepulauan. (Benar/Salah)',
                'question_type' => 'true_false',
                'options' => ['True', 'False'],
                'correct_answer' => 'True',
                'difficulty' => 'easy',
                'points' => 1
            ],
            [
                'question_text' => 'Lengkapi kalimat berikut: "Pancasila adalah ... negara Indonesia"',
                'question_type' => 'fill_blank',
                'correct_answer' => ['dasar'],
                'difficulty' => 'easy',
                'points' => 2
            ]
        ];

        foreach ($questions as $questionData) {
            Question::create(array_merge($questionData, [
                'instansi_id' => $tenantId,
                'subject_id' => $subjectId,
                'creator_id' => $teacherId,
                'visibility' => 'private',
                'question_group_id' => null,
                'group_order' => 0,
            ]));
        }
    }

    private function createSharedQuestions($tenantId, $subjectId, $teacherId)
    {
        $sharedQuestions = [
            [
                'question_text' => 'Apa nama gunung tertinggi di Indonesia?',
                'question_type' => 'multiple_choice',
                'options' => ['A' => 'Gunung Merapi', 'B' => 'Gunung Kerinci', 'C' => 'Gunung Semeru', 'D' => 'Gunung Rinjani'],
                'correct_answer' => 'B',
                'difficulty' => 'medium',
                'points' => 2
            ],
            [
                'question_text' => 'Jelaskan perbedaan antara demokrasi langsung dan demokrasi perwakilan!',
                'question_type' => 'essay',
                'correct_answer' => 'Demokrasi langsung adalah sistem di mana rakyat secara langsung memutuskan kebijakan, sedangkan demokrasi perwakilan adalah sistem di mana rakyat memilih wakil untuk membuat keputusan.',
                'difficulty' => 'hard',
                'points' => 10
            ]
        ];

        foreach ($sharedQuestions as $questionData) {
            Question::create(array_merge($questionData, [
                'instansi_id' => $tenantId,
                'subject_id' => $subjectId,
                'creator_id' => $teacherId,
                'visibility' => 'shared',
                'origin_tenant_id' => $tenantId,
                'shared_at' => now(),
                'question_group_id' => null,
                'group_order' => 0,
            ]));
        }
    }

    private function createQuestionForGroup($tenantId, $subjectId, $teacherId, $groupId, $order, $text, $type, $options = null, $correctAnswer = null)
    {
        return Question::create([
            'instansi_id' => $tenantId,
            'subject_id' => $subjectId,
            'creator_id' => $teacherId,
            'question_group_id' => $groupId,
            'group_order' => $order,
            'question_text' => $text,
            'question_type' => $type,
            'options' => $options,
            'correct_answer' => $correctAnswer,
            'difficulty' => 'medium',
            'points' => 2,
            'visibility' => 'private',
        ]);
    }
}
