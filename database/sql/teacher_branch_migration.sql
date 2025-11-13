-- Migration SQL untuk Teacher Branch System
-- Sistem request/approval untuk mencabangkan guru ke tenant lain
-- Tanggal: 2025

-- ============================================
-- TEACHER BRANCH REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `teacher_branch_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `from_tenant_id` int(11) NOT NULL COMMENT 'Tenant induk (dimana guru aktif)',
  `to_tenant_id` int(11) NOT NULL COMMENT 'Tenant cabang (tujuan)',
  `status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `teacher_data` json DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `initiated_by_tenant_id` int(11) DEFAULT NULL COMMENT 'Tenant yang initiate request',
  `request_type` varchar(20) NOT NULL DEFAULT 'push' COMMENT 'push = dari tenant induk, pull = dari tenant cabang',
  `branch_date` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `teacher_branch_requests_teacher_id_index` (`teacher_id`),
  KEY `teacher_branch_requests_from_tenant_id_index` (`from_tenant_id`),
  KEY `teacher_branch_requests_to_tenant_id_index` (`to_tenant_id`),
  KEY `teacher_branch_requests_status_index` (`status`),
  KEY `teacher_branch_requests_initiated_by_tenant_id_index` (`initiated_by_tenant_id`),
  KEY `teacher_branch_requests_processed_by_index` (`processed_by`),
  CONSTRAINT `teacher_branch_requests_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_branch_requests_from_tenant_id_foreign` FOREIGN KEY (`from_tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_branch_requests_to_tenant_id_foreign` FOREIGN KEY (`to_tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_branch_requests_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADD isMainTenant COLUMN TO teachers TABLE
-- ============================================
-- Check if column exists before adding
SET @dbname = DATABASE();
SET @tablename = 'teachers';
SET @columnname = 'isMainTenant';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' tinyint(1) NOT NULL DEFAULT 0 COMMENT ''true = tenant induk, false = tenant cabang''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Verify teacher_branch_requests table
SELECT '✅ Tabel teacher_branch_requests berhasil dibuat!' AS status;
DESCRIBE `teacher_branch_requests`;

-- Verify isMainTenant column
SELECT '✅ Kolom isMainTenant berhasil ditambahkan ke tabel teachers!' AS status;
SHOW COLUMNS FROM `teachers` LIKE 'isMainTenant';

