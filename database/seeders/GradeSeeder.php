<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Core\Tenant;
use App\Models\Tenant\Grade;
use App\Models\Tenant\Student;
use App\Models\Tenant\Subject;
use App\Models\Tenant\Teacher;

class GradeSeeder extends Seeder
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

        $students = Student::where('instansi_id', $tenant->id)->get();
        $subjects = Subject::where('instansi_id', $tenant->id)->get();
        $teachers = Teacher::where('instansi_id', $tenant->id)->get();

        if ($students->isEmpty() || $subjects->isEmpty() || $teachers->isEmpty()) {
            $this->command->error('No students, subjects, or teachers found. Please run AcademicSeeder first.');
            return;
        }

        $assignmentTypes = ['UTS', 'UAS', 'Tugas', 'Quiz', 'Praktikum'];
        $assignmentNames = [
            'UTS' => ['UTS Matematika', 'UTS Fisika', 'UTS Kimia', 'UTS Biologi'],
            'UAS' => ['UAS Matematika', 'UAS Fisika', 'UAS Kimia', 'UAS Biologi'],
            'Tugas' => ['Tugas 1', 'Tugas 2', 'Tugas 3', 'Tugas 4'],
            'Quiz' => ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
            'Praktikum' => ['Praktikum 1', 'Praktikum 2', 'Praktikum 3']
        ];

        foreach ($students as $student) {
            foreach ($subjects as $subject) {
                $teacher = $teachers->random();
                
                // Create 3-5 grades per subject per student
                $numGrades = rand(3, 5);
                
                for ($i = 0; $i < $numGrades; $i++) {
                    $assignmentType = $assignmentTypes[array_rand($assignmentTypes)];
                    $assignmentName = $assignmentNames[$assignmentType][array_rand($assignmentNames[$assignmentType])];
                    
                    $score = rand(60, 95); // Random score between 60-95
                    $maxScore = 100;
                    $percentage = ($score / $maxScore) * 100;
                    
                    // Calculate grade letter
                    $gradeLetter = $this->calculateGradeLetter($percentage);
                    
                    Grade::create([
                        'instansi_id' => $tenant->id,
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                        'teacher_id' => $teacher->id,
                        'assignment_type' => $assignmentType,
                        'assignment_name' => $assignmentName,
                        'score' => $score,
                        'max_score' => $maxScore,
                        'percentage' => $percentage,
                        'grade_letter' => $gradeLetter,
                        'academic_year' => '2024/2025',
                        'semester' => rand(1, 2),
                        'notes' => 'Sample grade data',
                    ]);
                }
            }
        }

        $this->command->info('Grade data seeded successfully!');
    }

    /**
     * Calculate grade letter based on percentage
     */
    private function calculateGradeLetter($percentage)
    {
        if ($percentage >= 91) return 'A';
        if ($percentage >= 86) return 'B+';
        if ($percentage >= 81) return 'B';
        if ($percentage >= 76) return 'C+';
        if ($percentage >= 71) return 'C';
        if ($percentage >= 66) return 'D';
        return 'E';
    }
}
