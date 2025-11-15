-- ============================================
-- STORAGE QUOTA & UPGRADE MIGRATION
-- ============================================
-- Tanggal: 27 Januari 2025
-- Deskripsi: Menambahkan field storage quota dan upgrade storage

-- ============================================
-- 1. UPDATE SUBSCRIPTION PLANS TABLE
-- ============================================
-- Check if column exists before adding (MySQL/MariaDB doesn't support IF NOT EXISTS for ALTER TABLE)
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'subscription_plans' 
  AND COLUMN_NAME = 'storage_limit_gb'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `subscription_plans` ADD COLUMN `storage_limit_gb` INT(11) NOT NULL DEFAULT 0 COMMENT ''Storage limit in GB for this plan'' AFTER `features`',
  'SELECT ''Column storage_limit_gb already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update storage limits untuk existing plans berdasarkan jumlah siswa
UPDATE `subscription_plans` 
SET `storage_limit_gb` = 10 
WHERE `slug` = 'free-forever' OR (`min_students` = 0 AND `max_students` = 49);

UPDATE `subscription_plans` 
SET `storage_limit_gb` = 50 
WHERE `slug` = 'standard' OR (`min_students` >= 50 AND `max_students` <= 500);

UPDATE `subscription_plans` 
SET `storage_limit_gb` = 100 
WHERE `slug` = 'enterprise' OR (`min_students` >= 501);

-- ============================================
-- 2. UPDATE TENANTS TABLE
-- ============================================
-- Add storage_usage_bytes column
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tenants' 
  AND COLUMN_NAME = 'storage_usage_bytes'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `tenants` ADD COLUMN `storage_usage_bytes` BIGINT(20) NOT NULL DEFAULT 0 COMMENT ''Storage usage in bytes'' AFTER `settings`',
  'SELECT ''Column storage_usage_bytes already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add storage_limit_bytes column
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tenants' 
  AND COLUMN_NAME = 'storage_limit_bytes'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `tenants` ADD COLUMN `storage_limit_bytes` BIGINT(20) NOT NULL DEFAULT 0 COMMENT ''Storage limit in bytes (base + upgrade)'' AFTER `storage_usage_bytes`',
  'SELECT ''Column storage_limit_bytes already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add storage_upgrade_bytes column
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tenants' 
  AND COLUMN_NAME = 'storage_upgrade_bytes'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `tenants` ADD COLUMN `storage_upgrade_bytes` BIGINT(20) NOT NULL DEFAULT 0 COMMENT ''Additional storage from upgrades in bytes'' AFTER `storage_limit_bytes`',
  'SELECT ''Column storage_upgrade_bytes already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Initialize storage limits untuk existing tenants berdasarkan jumlah siswa
-- Note: Ini akan diupdate otomatis oleh sistem saat subscription dibuat/diupdate
UPDATE `tenants` t
INNER JOIN `tenant_subscriptions` ts ON t.id = ts.tenant_id
SET 
  t.`storage_limit_bytes` = CASE
    WHEN ts.`current_student_count` < 50 THEN 10 * 1024 * 1024 * 1024
    WHEN ts.`current_student_count` <= 500 THEN 50 * 1024 * 1024 * 1024
    ELSE 100 * 1024 * 1024 * 1024
  END
WHERE ts.`status` = 'active';

-- ============================================
-- 3. CREATE STORAGE UPGRADES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `storage_upgrades` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `tenant_subscription_id` bigint(20) unsigned DEFAULT NULL,
  `upgrade_type` enum('package','custom') NOT NULL COMMENT 'Type of upgrade: package or custom',
  `additional_storage_gb` int(11) NOT NULL COMMENT 'Additional storage in GB',
  `price_per_year` decimal(12,2) NOT NULL COMMENT 'Price per year',
  `pro_rated_price` decimal(12,2) NOT NULL COMMENT 'Pro-rated price for remaining period',
  `status` enum('pending','active','expired','cancelled') NOT NULL DEFAULT 'pending',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `paid_at` date DEFAULT NULL,
  `payment_notes` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `storage_upgrades_tenant_id_index` (`tenant_id`),
  KEY `storage_upgrades_tenant_subscription_id_index` (`tenant_subscription_id`),
  KEY `storage_upgrades_status_index` (`status`),
  CONSTRAINT `storage_upgrades_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `storage_upgrades_tenant_subscription_id_foreign` FOREIGN KEY (`tenant_subscription_id`) REFERENCES `tenant_subscriptions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
-- Check and create index for storage_usage_bytes
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tenants' 
  AND INDEX_NAME = 'tenants_storage_usage_bytes_index'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX `tenants_storage_usage_bytes_index` ON `tenants` (`storage_usage_bytes`)',
  'SELECT ''Index tenants_storage_usage_bytes_index already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and create index for storage_limit_bytes
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tenants' 
  AND INDEX_NAME = 'tenants_storage_limit_bytes_index'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX `tenants_storage_limit_bytes_index` ON `tenants` (`storage_limit_bytes`)',
  'SELECT ''Index tenants_storage_limit_bytes_index already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- END OF MIGRATION
-- ============================================

