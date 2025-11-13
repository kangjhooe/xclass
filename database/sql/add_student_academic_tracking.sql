-- Migration: Add Academic Level Tracking to Students Table
-- Description: Menambahkan field untuk tracking level akademik siswa (SD/SMP/SMA)
--              dan memastikan data siswa dapat dilacak dari kelas 1 SD sampai lulus SMA
-- Date: 2025-01-XX
-- Author: System

-- ============================================
-- 1. Tambahkan Field Baru untuk Academic Tracking
-- ============================================
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- Script akan mengecek kolom terlebih dahulu sebelum menambahkan

-- Check and add academic_level
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'academic_level'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE students ADD COLUMN academic_level VARCHAR(20) NULL COMMENT ''Level pendidikan: SD, SMP, SMA, SMK''',
  'SELECT ''Column academic_level already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add current_grade
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'current_grade'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE students ADD COLUMN current_grade VARCHAR(10) NULL COMMENT ''Kelas saat ini: 1-6 (SD), 7-9 (SMP), 10-12 (SMA)''',
  'SELECT ''Column current_grade already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add academic_year
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'academic_year'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE students ADD COLUMN academic_year VARCHAR(10) NULL COMMENT ''Tahun ajaran saat ini, format: 2024/2025''',
  'SELECT ''Column academic_year already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. Buat Index untuk Performa Query
-- ============================================

-- Index untuk NISN (identifier utama)
-- Check if index exists before creating
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'students' 
  AND INDEX_NAME = 'idx_students_nisn'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_students_nisn ON students(nisn)',
  'SELECT ''Index idx_students_nisn already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index untuk academic level (untuk filtering)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'students' 
  AND INDEX_NAME = 'idx_students_academic_level'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_students_academic_level ON students(academic_level)',
  'SELECT ''Index idx_students_academic_level already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index untuk academic year (untuk filtering)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'students' 
  AND INDEX_NAME = 'idx_students_academic_year'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_students_academic_year ON students(academic_year)',
  'SELECT ''Index idx_students_academic_year already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index composite untuk query yang sering digunakan
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'students' 
  AND INDEX_NAME = 'idx_students_level_grade_year'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_students_level_grade_year ON students(academic_level, current_grade, academic_year)',
  'SELECT ''Index idx_students_level_grade_year already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. Update Data Existing (Opsional)
-- ============================================
-- Jika ada data existing, bisa di-update berdasarkan class_id atau data lainnya
-- Contoh:
-- UPDATE students s
-- JOIN class_rooms c ON s.class_id = c.id
-- SET s.academic_level = CASE 
--   WHEN c.level LIKE '%SD%' THEN 'SD'
--   WHEN c.level LIKE '%SMP%' THEN 'SMP'
--   WHEN c.level LIKE '%SMA%' THEN 'SMA'
--   WHEN c.level LIKE '%SMK%' THEN 'SMK'
--   ELSE NULL
-- END
-- WHERE s.academic_level IS NULL;

-- ============================================
-- 4. Validasi: Pastikan NISN Unique
-- ============================================
-- Pastikan constraint unique sudah ada di NISN
-- Jika belum, uncomment baris berikut:
-- ALTER TABLE students ADD CONSTRAINT unique_nisn UNIQUE (nisn);

-- ============================================
-- 5. Index untuk Foreign Keys (Optimasi Join)
-- ============================================

-- Index untuk student_id di tabel terkait (jika belum ada)
-- Note: Script akan membuat index hanya jika tabel dan kolom ada
-- Health Records
SET @table_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLES 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'health_records'
);
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'health_records' 
  AND INDEX_NAME = 'idx_health_records_student_id'
);
SET @sql = IF(@table_exists > 0 AND @index_exists = 0,
  'CREATE INDEX idx_health_records_student_id ON health_records(student_id)',
  'SELECT ''Index idx_health_records_student_id skipped'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Disciplinary Actions
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'disciplinary_actions');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'disciplinary_actions' AND INDEX_NAME = 'idx_disciplinary_actions_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_disciplinary_actions_student_id ON disciplinary_actions(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Student Grades
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_grades');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_grades' AND INDEX_NAME = 'idx_student_grades_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_student_grades_student_id ON student_grades(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Attendances
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendances');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendances' AND INDEX_NAME = 'idx_attendances_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_attendances_student_id ON attendances(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Counseling Sessions
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'counseling_sessions');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'counseling_sessions' AND INDEX_NAME = 'idx_counseling_sessions_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_counseling_sessions_student_id ON counseling_sessions(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Extracurricular Participants
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extracurricular_participants');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extracurricular_participants' AND INDEX_NAME = 'idx_extracurricular_participants_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_extracurricular_participants_student_id ON extracurricular_participants(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Course Enrollments
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course_enrollments');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course_enrollments' AND INDEX_NAME = 'idx_course_enrollments_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_course_enrollments_student_id ON course_enrollments(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Course Progress
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course_progress');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course_progress' AND INDEX_NAME = 'idx_course_progress_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_course_progress_student_id ON course_progress(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Exam Attempts
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_attempts');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_attempts' AND INDEX_NAME = 'idx_exam_attempts_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_exam_attempts_student_id ON exam_attempts(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Alumni
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alumni');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alumni' AND INDEX_NAME = 'idx_alumni_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_alumni_student_id ON alumni(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Graduations
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'graduations');
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'graduations' AND INDEX_NAME = 'idx_graduations_student_id');
SET @sql = IF(@table_exists > 0 AND @index_exists = 0, 'CREATE INDEX idx_graduations_student_id ON graduations(student_id)', 'SELECT ''Skipped'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================
-- 6. View untuk Riwayat Lengkap Siswa (Opsional)
-- ============================================

-- View untuk melihat riwayat lengkap siswa berdasarkan NISN
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
-- 7. Stored Procedure untuk Update Academic Level (Opsional)
-- ============================================

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS sp_update_student_academic_level(
    IN p_student_id INT,
    IN p_academic_level VARCHAR(20),
    IN p_current_grade VARCHAR(10),
    IN p_academic_year VARCHAR(10)
)
BEGIN
    UPDATE students
    SET 
        academic_level = p_academic_level,
        current_grade = p_current_grade,
        academic_year = p_academic_year,
        updated_at = NOW()
    WHERE id = p_student_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //

DELIMITER ;

-- ============================================
-- 8. Trigger untuk Auto-Update Academic Year (Opsional)
-- ============================================
-- Trigger ini bisa digunakan untuk auto-update academic_year berdasarkan tanggal
-- Uncomment jika diperlukan

-- DELIMITER //
-- 
-- CREATE TRIGGER IF NOT EXISTS trg_update_academic_year
-- BEFORE UPDATE ON students
-- FOR EACH ROW
-- BEGIN
--     -- Auto-update academic_year berdasarkan bulan
--     IF MONTH(NOW()) >= 7 THEN
--         SET NEW.academic_year = CONCAT(YEAR(NOW()), '/', YEAR(NOW()) + 1);
--     ELSE
--         SET NEW.academic_year = CONCAT(YEAR(NOW()) - 1, '/', YEAR(NOW()));
--     END IF;
-- END //
-- 
-- DELIMITER ;

-- ============================================
-- VERIFIKASI
-- ============================================

-- Cek apakah field sudah ditambahkan
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'students'
AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year');

-- Cek index yang sudah dibuat
SHOW INDEX FROM students WHERE Key_name LIKE 'idx_students%';

-- ============================================
-- ROLLBACK (Jika Perlu)
-- ============================================
-- Jika perlu rollback, jalankan:
-- ALTER TABLE students DROP COLUMN IF EXISTS academic_level;
-- ALTER TABLE students DROP COLUMN IF EXISTS current_grade;
-- ALTER TABLE students DROP COLUMN IF EXISTS academic_year;
-- DROP INDEX IF EXISTS idx_students_nisn ON students;
-- DROP INDEX IF EXISTS idx_students_academic_level ON students;
-- DROP INDEX IF EXISTS idx_students_academic_year ON students;
-- DROP INDEX IF EXISTS idx_students_level_grade_year ON students;
-- DROP VIEW IF EXISTS v_student_lifetime_summary;
-- DROP PROCEDURE IF EXISTS sp_update_student_academic_level;

