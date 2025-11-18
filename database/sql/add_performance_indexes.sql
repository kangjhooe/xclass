-- ============================================
-- Performance Optimization: Database Indexes
-- ============================================
-- Description: Menambahkan indexes untuk foreign keys dan kolom yang sering digunakan dalam query
-- Date: 2025-01-28
-- 
-- INSTRUKSI:
-- 1. Buka MySQL client atau phpMyAdmin
-- 2. Pilih database xclass
-- 3. Copy-paste dan jalankan script ini
-- 4. Script ini akan membuat index hanya jika belum ada (safe to run multiple times)
-- ============================================

-- Helper function untuk check dan create index
SET @db_name = DATABASE();

-- ============================================
-- 1. INDEXES UNTUK FOREIGN KEYS (Students)
-- ============================================

-- Students -> ClassRoom
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'students' 
  AND INDEX_NAME = 'idx_students_class_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_students_class_id ON students(class_id)',
  'SELECT ''Index idx_students_class_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Students -> InstansiId (sangat sering digunakan)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'students' 
  AND INDEX_NAME = 'idx_students_instansi_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_students_instansi_id ON students(instansi_id)',
  'SELECT ''Index idx_students_instansi_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Students -> NIK (unique identifier)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'students' 
  AND INDEX_NAME = 'idx_students_nik'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_students_nik ON students(nik)',
  'SELECT ''Index idx_students_nik already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Students -> NISN (jika belum ada)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
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

-- Composite index untuk query yang sering digunakan
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'students' 
  AND INDEX_NAME = 'idx_students_instansi_class'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_students_instansi_class ON students(instansi_id, class_id)',
  'SELECT ''Index idx_students_instansi_class already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. INDEXES UNTUK FOREIGN KEYS (Teachers)
-- ============================================

-- Teachers -> InstansiId
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'teachers' 
  AND INDEX_NAME = 'idx_teachers_instansi_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_teachers_instansi_id ON teachers(instansi_id)',
  'SELECT ''Index idx_teachers_instansi_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Teachers -> NIK
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'teachers' 
  AND INDEX_NAME = 'idx_teachers_nik'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_teachers_nik ON teachers(nik)',
  'SELECT ''Index idx_teachers_nik already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. INDEXES UNTUK FOREIGN KEYS (Attendance)
-- ============================================

-- Attendance -> Student
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'attendances' 
  AND INDEX_NAME = 'idx_attendances_student_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_attendances_student_id ON attendances(student_id)',
  'SELECT ''Index idx_attendances_student_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Attendance -> Schedule
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'attendances' 
  AND INDEX_NAME = 'idx_attendances_schedule_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_attendances_schedule_id ON attendances(schedule_id)',
  'SELECT ''Index idx_attendances_schedule_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Attendance -> InstansiId + Date (composite untuk query filtering)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'attendances' 
  AND INDEX_NAME = 'idx_attendances_instansi_date'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_attendances_instansi_date ON attendances(instansi_id, date)',
  'SELECT ''Index idx_attendances_instansi_date already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 4. INDEXES UNTUK FOREIGN KEYS (Grades)
-- ============================================

-- StudentGrade -> Student
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'student_grades' 
  AND INDEX_NAME = 'idx_student_grades_student_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_student_grades_student_id ON student_grades(student_id)',
  'SELECT ''Index idx_student_grades_student_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- StudentGrade -> Subject
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'student_grades' 
  AND INDEX_NAME = 'idx_student_grades_subject_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_student_grades_subject_id ON student_grades(subject_id)',
  'SELECT ''Index idx_student_grades_subject_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- StudentGrade -> Teacher
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'student_grades' 
  AND INDEX_NAME = 'idx_student_grades_teacher_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_student_grades_teacher_id ON student_grades(teacher_id)',
  'SELECT ''Index idx_student_grades_teacher_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 5. INDEXES UNTUK FOREIGN KEYS (Extracurricular)
-- ============================================

-- Extracurricular -> Supervisor
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'extracurriculars' 
  AND INDEX_NAME = 'idx_extracurriculars_supervisor_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_extracurriculars_supervisor_id ON extracurriculars(supervisor_id)',
  'SELECT ''Index idx_extracurriculars_supervisor_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Extracurricular -> Assistant Supervisor
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'extracurriculars' 
  AND INDEX_NAME = 'idx_extracurriculars_assistant_supervisor_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_extracurriculars_assistant_supervisor_id ON extracurriculars(assistant_supervisor_id)',
  'SELECT ''Index idx_extracurriculars_assistant_supervisor_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Extracurricular -> InstansiId
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'extracurriculars' 
  AND INDEX_NAME = 'idx_extracurriculars_instansi_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_extracurriculars_instansi_id ON extracurriculars(instansi_id)',
  'SELECT ''Index idx_extracurriculars_instansi_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ExtracurricularParticipant -> Extracurricular
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'extracurricular_participants' 
  AND INDEX_NAME = 'idx_extracurricular_participants_extracurricular_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_extracurricular_participants_extracurricular_id ON extracurricular_participants(extracurricular_id)',
  'SELECT ''Index idx_extracurricular_participants_extracurricular_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ExtracurricularParticipant -> Student
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'extracurricular_participants' 
  AND INDEX_NAME = 'idx_extracurricular_participants_student_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_extracurricular_participants_student_id ON extracurricular_participants(student_id)',
  'SELECT ''Index idx_extracurricular_participants_student_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ExtracurricularParticipant -> InstansiId + Status (composite)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'extracurricular_participants' 
  AND INDEX_NAME = 'idx_extracurricular_participants_instansi_status'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_extracurricular_participants_instansi_status ON extracurricular_participants(instansi_id, status)',
  'SELECT ''Index idx_extracurricular_participants_instansi_status already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ExtracurricularActivity -> Extracurricular
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'extracurricular_activities' 
  AND INDEX_NAME = 'idx_extracurricular_activities_extracurricular_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_extracurricular_activities_extracurricular_id ON extracurricular_activities(extracurricular_id)',
  'SELECT ''Index idx_extracurricular_activities_extracurricular_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 6. INDEXES UNTUK FOREIGN KEYS (Schedules)
-- ============================================

-- Schedule -> ClassRoom
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'schedules' 
  AND INDEX_NAME = 'idx_schedules_class_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_schedules_class_id ON schedules(class_id)',
  'SELECT ''Index idx_schedules_class_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Schedule -> Subject
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'schedules' 
  AND INDEX_NAME = 'idx_schedules_subject_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_schedules_subject_id ON schedules(subject_id)',
  'SELECT ''Index idx_schedules_subject_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Schedule -> Teacher
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'schedules' 
  AND INDEX_NAME = 'idx_schedules_teacher_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_schedules_teacher_id ON schedules(teacher_id)',
  'SELECT ''Index idx_schedules_teacher_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Schedule -> InstansiId + DayOfWeek (composite untuk query jadwal)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'schedules' 
  AND INDEX_NAME = 'idx_schedules_instansi_day'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_schedules_instansi_day ON schedules(instansi_id, day_of_week)',
  'SELECT ''Index idx_schedules_instansi_day already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 7. INDEXES UNTUK FOREIGN KEYS (Exams)
-- ============================================

-- ExamAttempt -> Student
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'exam_attempts' 
  AND INDEX_NAME = 'idx_exam_attempts_student_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_exam_attempts_student_id ON exam_attempts(student_id)',
  'SELECT ''Index idx_exam_attempts_student_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ExamAttempt -> Exam
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'exam_attempts' 
  AND INDEX_NAME = 'idx_exam_attempts_exam_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_exam_attempts_exam_id ON exam_attempts(exam_id)',
  'SELECT ''Index idx_exam_attempts_exam_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 8. INDEXES UNTUK FOREIGN KEYS (Users)
-- ============================================

-- Users -> InstansiId
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'users' 
  AND INDEX_NAME = 'idx_users_instansi_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_users_instansi_id ON users(instansi_id)',
  'SELECT ''Index idx_users_instansi_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Users -> Email (sudah unique, tapi pastikan ada index)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'users' 
  AND INDEX_NAME = 'idx_users_email'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_users_email ON users(email)',
  'SELECT ''Index idx_users_email already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 9. INDEXES UNTUK FOREIGN KEYS (Classes)
-- ============================================

-- ClassRoom -> InstansiId
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'class_rooms' 
  AND INDEX_NAME = 'idx_class_rooms_instansi_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_class_rooms_instansi_id ON class_rooms(instansi_id)',
  'SELECT ''Index idx_class_rooms_instansi_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 10. INDEXES UNTUK FOREIGN KEYS (Library)
-- ============================================

-- BookLoan -> Student
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'book_loans' 
  AND INDEX_NAME = 'idx_book_loans_student_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_book_loans_student_id ON book_loans(student_id)',
  'SELECT ''Index idx_book_loans_student_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- BookLoan -> Book
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'book_loans' 
  AND INDEX_NAME = 'idx_book_loans_book_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_book_loans_book_id ON book_loans(book_id)',
  'SELECT ''Index idx_book_loans_book_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 11. INDEXES UNTUK FOREIGN KEYS (Finance)
-- ============================================

-- SppPayment -> Student
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'spp_payments' 
  AND INDEX_NAME = 'idx_spp_payments_student_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_spp_payments_student_id ON spp_payments(student_id)',
  'SELECT ''Index idx_spp_payments_student_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- SppPayment -> InstansiId + PaymentDate (composite)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'spp_payments' 
  AND INDEX_NAME = 'idx_spp_payments_instansi_date'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_spp_payments_instansi_date ON spp_payments(instansi_id, payment_date)',
  'SELECT ''Index idx_spp_payments_instansi_date already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 12. INDEXES UNTUK FOREIGN KEYS (Notifications)
-- ============================================

-- Notification -> User
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'notifications' 
  AND INDEX_NAME = 'idx_notifications_user_id'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_notifications_user_id ON notifications(user_id)',
  'SELECT ''Index idx_notifications_user_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Notification -> InstansiId + Status (composite)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @db_name 
  AND TABLE_NAME = 'notifications' 
  AND INDEX_NAME = 'idx_notifications_instansi_status'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_notifications_instansi_status ON notifications(instansi_id, status)',
  'SELECT ''Index idx_notifications_instansi_status already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Selesai
-- ============================================
SELECT 'Database indexes telah berhasil ditambahkan!' AS message;

