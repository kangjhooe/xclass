<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Core\Tenant;
use App\Models\User;
use App\Models\Tenant\Student;
use App\Models\Tenant\Teacher;
use App\Models\Tenant\ClassRoom;
use App\Models\Tenant\Subject;
use App\Models\Tenant\Schedule;
use App\Models\Tenant\Attendance;
use App\Models\Tenant\Grade;
use App\Models\Tenant\Message;
use App\Models\Tenant\Announcement;

class SystemTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting system test seeding...');

        // Create test tenant
        $tenant = $this->createTestTenant();
        
        // Create test users
        $this->createTestUsers($tenant);
        
        // Create test academic data
        $this->createTestAcademicData($tenant);
        
        // Create test messages
        $this->createTestMessages($tenant);
        
        // Create test announcements
        $this->createTestAnnouncements($tenant);
        
        // Create test grades and attendance
        $this->createTestGradesAndAttendance($tenant);

        $this->command->info('System test seeding completed successfully!');
    }

    /**
     * Create test tenant
     */
    protected function createTestTenant(): Tenant
    {
        $tenant = Tenant::firstOrCreate(
            ['npsn' => '87654321'],
            [
                'name' => 'SMA Negeri 2 Jakarta',
                'email' => 'admin@sman2jakarta.sch.id',
                'phone' => '021-87654321',
                'address' => 'Jl. Pendidikan No. 2, Jakarta Pusat',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
                'postal_code' => '10120',
                'website' => 'https://sman2jakarta.sch.id',
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

        $this->command->info("Created test tenant: {$tenant->name}");
        return $tenant;
    }

    /**
     * Create test users
     */
    protected function createTestUsers(Tenant $tenant): void
    {
        $users = [
            [
                'name' => 'Admin Test',
                'email' => 'admin.test@sman2jakarta.sch.id',
                'password' => bcrypt('password'),
                'role' => 'school_admin',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ],
            [
                'name' => 'Guru Test 1',
                'email' => 'guru1.test@sman2jakarta.sch.id',
                'password' => bcrypt('password'),
                'role' => 'teacher',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ],
            [
                'name' => 'Guru Test 2',
                'email' => 'guru2.test@sman2jakarta.sch.id',
                'password' => bcrypt('password'),
                'role' => 'teacher',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ],
            [
                'name' => 'Siswa Test 1',
                'email' => 'siswa1.test@sman2jakarta.sch.id',
                'password' => bcrypt('password'),
                'role' => 'student',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ],
            [
                'name' => 'Siswa Test 2',
                'email' => 'siswa2.test@sman2jakarta.sch.id',
                'password' => bcrypt('password'),
                'role' => 'student',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ],
            [
                'name' => 'Orang Tua Test',
                'email' => 'ortu.test@sman2jakarta.sch.id',
                'password' => bcrypt('password'),
                'role' => 'parent',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('Created test users');
    }

    /**
     * Create test academic data
     */
    protected function createTestAcademicData(Tenant $tenant): void
    {
        // Create subjects
        $subjects = [
            ['name' => 'Matematika Test', 'code' => 'MAT-T', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 4],
            ['name' => 'Fisika Test', 'code' => 'FIS-T', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 3],
            ['name' => 'Kimia Test', 'code' => 'KIM-T', 'level' => 'SMA', 'category' => 'Umum', 'credits' => 3],
        ];

        foreach ($subjects as $subjectData) {
            Subject::firstOrCreate(
                ['code' => $subjectData['code']],
                array_merge($subjectData, [
                    'instansi_id' => $tenant->id,
                    'is_active' => true,
                ])
            );
        }

        // Create classes
        $classes = [
            ['name' => 'X IPA Test', 'level' => 'X', 'major' => 'IPA', 'capacity' => 30, 'room_number' => 'T101'],
            ['name' => 'XI IPA Test', 'level' => 'XI', 'major' => 'IPA', 'capacity' => 30, 'room_number' => 'T201'],
        ];

        foreach ($classes as $classData) {
            ClassRoom::firstOrCreate(
                ['name' => $classData['name']],
                array_merge($classData, [
                    'instansi_id' => $tenant->id,
                    'academic_year' => '2024/2025',
                    'is_active' => true,
                ])
            );
        }

        // Create teachers
        $teachers = [
            ['name' => 'Guru Test 1', 'email' => 'guru1.test@sman2jakarta.sch.id', 'nip' => 'T001', 'phone' => '081234567890'],
            ['name' => 'Guru Test 2', 'email' => 'guru2.test@sman2jakarta.sch.id', 'nip' => 'T002', 'phone' => '081234567891'],
        ];

        foreach ($teachers as $teacherData) {
            Teacher::firstOrCreate(
                ['nip' => $teacherData['nip']],
                array_merge($teacherData, [
                    'instansi_id' => $tenant->id,
                    'is_active' => true,
                    'employment_date' => now()->subYears(2),
                ])
            );
        }

        // Create students
        $students = [
            ['name' => 'Siswa Test 1', 'email' => 'siswa1.test@sman2jakarta.sch.id', 'nis' => 'S001', 'phone' => '081234567892'],
            ['name' => 'Siswa Test 2', 'email' => 'siswa2.test@sman2jakarta.sch.id', 'nis' => 'S002', 'phone' => '081234567893'],
        ];

        $class = ClassRoom::first();
        
        foreach ($students as $studentData) {
            Student::firstOrCreate(
                ['nis' => $studentData['nis']],
                array_merge($studentData, [
                    'instansi_id' => $tenant->id,
                    'class_id' => $class->id,
                    'is_active' => true,
                    'enrollment_date' => now()->subMonths(3),
                ])
            );
        }

        $this->command->info('Created test academic data');
    }

    /**
     * Create test messages
     */
    protected function createTestMessages(Tenant $tenant): void
    {
        $users = User::where('instansi_id', $tenant->id)->get();
        
        if ($users->count() < 2) {
            return;
        }

        $messages = [
            [
                'sender_id' => $users[0]->id,
                'receiver_id' => $users[1]->id,
                'subject' => 'Test Message 1',
                'content' => 'This is a test message for system testing.',
                'type' => 'direct',
                'priority' => 'medium',
            ],
            [
                'sender_id' => $users[1]->id,
                'receiver_id' => $users[0]->id,
                'subject' => 'Test Message 2',
                'content' => 'This is another test message for system testing.',
                'type' => 'direct',
                'priority' => 'high',
            ],
        ];

        foreach ($messages as $messageData) {
            Message::create(array_merge($messageData, [
                'instansi_id' => $tenant->id,
                'is_read' => false,
            ]));
        }

        $this->command->info('Created test messages');
    }

    /**
     * Create test announcements
     */
    protected function createTestAnnouncements(Tenant $tenant): void
    {
        $users = User::where('instansi_id', $tenant->id)->get();
        
        if ($users->isEmpty()) {
            return;
        }

        $announcements = [
            [
                'author_id' => $users[0]->id,
                'title' => 'Test Announcement 1',
                'content' => 'This is a test announcement for system testing.',
                'priority' => 'medium',
                'status' => 'published',
                'target_audience' => ['all'],
                'publish_at' => now(),
            ],
            [
                'author_id' => $users[0]->id,
                'title' => 'Test Announcement 2',
                'content' => 'This is another test announcement for system testing.',
                'priority' => 'high',
                'status' => 'published',
                'target_audience' => ['teachers', 'students'],
                'publish_at' => now(),
            ],
        ];

        foreach ($announcements as $announcementData) {
            Announcement::create(array_merge($announcementData, [
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ]));
        }

        $this->command->info('Created test announcements');
    }

    /**
     * Create test grades and attendance
     */
    protected function createTestGradesAndAttendance(Tenant $tenant): void
    {
        $students = Student::where('instansi_id', $tenant->id)->get();
        $subjects = Subject::where('instansi_id', $tenant->id)->get();
        $teachers = Teacher::where('instansi_id', $tenant->id)->get();

        if ($students->isEmpty() || $subjects->isEmpty() || $teachers->isEmpty()) {
            return;
        }

        // Create test grades
        foreach ($students as $student) {
            foreach ($subjects as $subject) {
                $teacher = $teachers->random();
                
                Grade::create([
                    'instansi_id' => $tenant->id,
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'teacher_id' => $teacher->id,
                    'assignment_type' => 'UTS',
                    'assignment_name' => 'UTS ' . $subject->name,
                    'score' => rand(70, 95),
                    'max_score' => 100,
                    'percentage' => rand(70, 95),
                    'grade_letter' => 'A',
                    'academic_year' => '2024/2025',
                    'semester' => 1,
                    'notes' => 'Test grade data',
                ]);
            }
        }

        // Create test attendance
        foreach ($students as $student) {
            $teacher = $teachers->random();
            
            Attendance::create([
                'instansi_id' => $tenant->id,
                'student_id' => $student->id,
                'teacher_id' => $teacher->id,
                'date' => now()->subDays(rand(1, 7)),
                'status' => ['present', 'absent', 'late'][rand(0, 2)],
                'check_in_time' => now()->subDays(rand(1, 7))->setTime(7, rand(0, 30)),
                'notes' => 'Test attendance data',
            ]);
        }

        $this->command->info('Created test grades and attendance');
    }
}
