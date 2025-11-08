<?php

/**
 * Script untuk menjalankan setup modul exam yang telah ditingkatkan
 * 
 * Jalankan dengan: php run_exam_setup.php
 */

echo "🚀 Memulai setup modul exam yang telah ditingkatkan...\n\n";

// 1. Jalankan migration
echo "📦 Menjalankan migration...\n";
$migrationOutput = shell_exec('php artisan migrate --force 2>&1');
echo $migrationOutput . "\n";

// 2. Jalankan seeder
echo "🌱 Menjalankan seeder...\n";
$seederOutput = shell_exec('php artisan db:seed --class=ExamEnhancedSeeder --force 2>&1');
echo $seederOutput . "\n";

// 3. Clear cache
echo "🧹 Membersihkan cache...\n";
$cacheOutput = shell_exec('php artisan cache:clear 2>&1');
$configOutput = shell_exec('php artisan config:clear 2>&1');
$routeOutput = shell_exec('php artisan route:clear 2>&1');
$viewOutput = shell_exec('php artisan view:clear 2>&1');

echo "✅ Setup selesai!\n\n";

echo "📋 Yang telah ditambahkan:\n";
echo "   • Tabel questions (bank soal)\n";
echo "   • Tabel question_groups (kelompok soal/stimulus)\n";
echo "   • Tabel grade_adjustments (katrol nilai)\n";
echo "   • Tabel exam_schedules (jadwal ujian)\n";
echo "   • Tabel exam_subjects (mata pelajaran dalam ujian)\n";
echo "   • Controller AdminExamController\n";
echo "   • Controller TeacherExamController\n";
echo "   • Controller QuestionController\n";
echo "   • Controller QuestionGroupController\n";
echo "   • Controller GradeAdjustmentController\n";
echo "   • Service QuestionSharingService\n";
echo "   • Service GradeAdjustmentService\n";
echo "   • Service QuestionRandomizationService\n";
echo "   • Service QuestionImportExportService\n";
echo "   • Middleware CanAdjustGrades\n";
echo "   • Policy ExamPolicy\n";
echo "   • Views untuk semua fitur baru\n";
echo "   • Routes yang terintegrasi\n\n";

echo "🎯 Fitur yang tersedia:\n";
echo "   • Pemisahan peran Admin dan Guru\n";
echo "   • Berbagi soal antar tenant\n";
echo "   • Katrol nilai (grade adjustment)\n";
echo "   • Kelompok soal dengan stimulus\n";
echo "   • Import/Export soal\n";
echo "   • Randomisasi soal dengan integritas kelompok\n\n";

echo "🔗 Akses aplikasi:\n";
echo "   • Admin: /admin/exam\n";
echo "   • Guru: /teacher/exam\n";
echo "   • Bank Soal: /questions\n";
echo "   • Kelompok Soal: /question-groups\n\n";

echo "👤 Data login tersedia di DATA_LOGIN.md\n";
echo "📚 Dokumentasi lengkap tersedia di EXAM_MODULE_STATUS_REPORT.md\n\n";

echo "✨ Modul exam telah siap digunakan!\n";