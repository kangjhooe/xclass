-- Migration SQL untuk menambahkan kolom copyQuestionBanks ke teacher_branch_requests
-- Opsi untuk copy bank soal saat mutasi guru antar tenant
-- Tanggal: 2025

-- ============================================
-- ADD copyQuestionBanks COLUMN TO teacher_branch_requests TABLE
-- ============================================
SET @dbname = DATABASE();
SET @tablename = 'teacher_branch_requests';
SET @columnname = 'copy_question_banks';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' tinyint(1) NOT NULL DEFAULT 0 COMMENT ''Opsi untuk copy bank soal ke tenant baru''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
SELECT '✅ Kolom copy_question_banks berhasil ditambahkan ke tabel teacher_branch_requests!' AS status;
SHOW COLUMNS FROM `teacher_branch_requests` LIKE 'copy_question_banks';

