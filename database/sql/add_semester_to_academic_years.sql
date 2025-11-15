-- Migration: Add Semester Type to Academic Years Table
-- Description: Menambahkan field currentSemesterType untuk segmentasi data berdasarkan semester ganjil/genap
-- Date: 2025-01-XX
-- Author: System
-- 
-- INSTRUKSI:
-- 1. Buka MySQL client atau phpMyAdmin
-- 2. Pilih database xclass
-- 3. Copy-paste dan jalankan script ini
-- 4. Jika ada error "column already exists", itu normal, lanjutkan saja

-- ============================================
-- 1. Tambahkan Field currentSemesterType
-- ============================================

-- Check if column exists
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'academic_years' 
  AND COLUMN_NAME = 'currentSemesterType'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE academic_years ADD COLUMN currentSemesterType ENUM(''ganjil'', ''genap'') NOT NULL DEFAULT ''ganjil'' COMMENT ''Semester saat ini: ganjil atau genap''',
  'SELECT ''Column currentSemesterType already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. Update Existing Records
-- ============================================
-- Set default semester untuk data yang sudah ada berdasarkan currentSemester
UPDATE academic_years 
SET currentSemesterType = CASE 
  WHEN currentSemester = 1 OR currentSemester IS NULL THEN 'ganjil'
  WHEN currentSemester = 2 THEN 'genap'
  ELSE 'ganjil'
END
WHERE currentSemesterType IS NULL OR currentSemesterType = '';

-- ============================================
-- 3. Verifikasi
-- ============================================
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'academic_years'
AND COLUMN_NAME = 'currentSemesterType';

