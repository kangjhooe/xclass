-- Migration: Add Academic Level Tracking to Students Table (Simplified Version)
-- Description: Menambahkan field untuk tracking level akademik siswa (SD/SMP/SMA)
--              dan memastikan data siswa dapat dilacak dari kelas 1 SD sampai lulus SMA
-- Date: 2025-01-XX
-- Author: System
-- 
-- INSTRUKSI:
-- 1. Buka MySQL client atau phpMyAdmin
-- 2. Pilih database xclass
-- 3. Copy-paste dan jalankan script ini
-- 4. Jika ada error "column already exists", itu normal, lanjutkan saja

-- ============================================
-- 1. Tambahkan Field Baru untuk Academic Tracking
-- ============================================

-- Tambahkan academic_level (jika belum ada)
ALTER TABLE students 
ADD COLUMN academic_level VARCHAR(20) NULL COMMENT 'Level pendidikan: SD, SMP, SMA, SMK';

-- Tambahkan current_grade (jika belum ada)
ALTER TABLE students 
ADD COLUMN current_grade VARCHAR(10) NULL COMMENT 'Kelas saat ini: 1-6 (SD), 7-9 (SMP), 10-12 (SMA)';

-- Tambahkan academic_year (jika belum ada)
ALTER TABLE students 
ADD COLUMN academic_year VARCHAR(10) NULL COMMENT 'Tahun ajaran saat ini, format: 2024/2025';

-- ============================================
-- 2. Buat Index untuk Performa Query
-- ============================================

-- Index untuk NISN (identifier utama)
CREATE INDEX idx_students_nisn ON students(nisn);

-- Index untuk academic level
CREATE INDEX idx_students_academic_level ON students(academic_level);

-- Index untuk academic year
CREATE INDEX idx_students_academic_year ON students(academic_year);

-- Index composite
CREATE INDEX idx_students_level_grade_year ON students(academic_level, current_grade, academic_year);

-- ============================================
-- 3. Index untuk Foreign Keys (Optimasi Join)
-- ============================================
-- Hanya buat index jika tabelnya ada

-- Health Records
CREATE INDEX idx_health_records_student_id ON health_records(student_id);

-- Disciplinary Actions
CREATE INDEX idx_disciplinary_actions_student_id ON disciplinary_actions(student_id);

-- Student Grades
CREATE INDEX idx_student_grades_student_id ON student_grades(student_id);

-- Attendances
CREATE INDEX idx_attendances_student_id ON attendances(student_id);

-- Counseling Sessions
CREATE INDEX idx_counseling_sessions_student_id ON counseling_sessions(student_id);

-- Extracurricular Participants
CREATE INDEX idx_extracurricular_participants_student_id ON extracurricular_participants(student_id);

-- Course Enrollments
CREATE INDEX idx_course_enrollments_student_id ON course_enrollments(student_id);

-- Course Progress
CREATE INDEX idx_course_progress_student_id ON course_progress(student_id);

-- Exam Attempts
CREATE INDEX idx_exam_attempts_student_id ON exam_attempts(student_id);

-- Alumni
CREATE INDEX idx_alumni_student_id ON alumni(student_id);

-- Graduations
CREATE INDEX idx_graduations_student_id ON graduations(student_id);

-- ============================================
-- 4. View untuk Riwayat Lengkap Siswa
-- ============================================

CREATE OR REPLACE VIEW v_student_lifetime_summary AS
SELECT 
    s.id,
    s.nisn,
    s.name,
    s.academic_level,
    s.current_grade,
    s.academic_year,
    s.student_status,
    s.is_active,
    COUNT(DISTINCT sg.id) as total_grades,
    COUNT(DISTINCT hr.id) as total_health_records,
    COUNT(DISTINCT da.id) as total_disciplinary_actions,
    COUNT(DISTINCT cs.id) as total_counseling_sessions,
    COUNT(DISTINCT att.id) as total_attendances,
    COUNT(DISTINCT ep.id) as total_extracurriculars,
    COUNT(DISTINCT ce.id) as total_course_enrollments,
    COUNT(DISTINCT ea.id) as total_exam_attempts
FROM students s
LEFT JOIN student_grades sg ON s.id = sg.student_id
LEFT JOIN health_records hr ON s.id = hr.student_id
LEFT JOIN disciplinary_actions da ON s.id = da.student_id
LEFT JOIN counseling_sessions cs ON s.id = cs.student_id
LEFT JOIN attendances att ON s.id = att.student_id
LEFT JOIN extracurricular_participants ep ON s.id = ep.student_id
LEFT JOIN course_enrollments ce ON s.id = ce.student_id
LEFT JOIN exam_attempts ea ON s.id = ea.student_id
GROUP BY s.id, s.nisn, s.name, s.academic_level, s.current_grade, s.academic_year, s.student_status, s.is_active;

-- ============================================
-- VERIFIKASI
-- ============================================

-- Cek kolom yang ditambahkan
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'students'
AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year');

-- Cek index yang dibuat
SHOW INDEX FROM students WHERE Key_name LIKE 'idx_students%';

-- Test view
SELECT * FROM v_student_lifetime_summary LIMIT 5;

