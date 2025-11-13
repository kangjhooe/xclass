-- Migration SQL untuk menambahkan kolom copy_question_banks ke teacher_branch_requests
-- Opsi untuk copy bank soal saat mutasi guru antar tenant
-- Tanggal: 2025

-- Gunakan database yang sesuai (sesuaikan dengan nama database Anda)
USE `class`;

-- Cek apakah kolom sudah ada, jika belum tambahkan
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
  'SELECT "Kolom copy_question_banks sudah ada" AS status;',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' tinyint(1) NOT NULL DEFAULT 0 COMMENT ''Opsi untuk copy bank soal ke tenant baru'';')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verifikasi
SELECT '✅ Migration selesai! Cek kolom di bawah:' AS status;
SHOW COLUMNS FROM `teacher_branch_requests` LIKE 'copy_question_banks';

