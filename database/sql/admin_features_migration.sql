-- Migration SQL untuk Admin Features
-- System Settings, Backup & Recovery, Tenant Features, Subscription Management
-- Tanggal: 28 Januari 2025

-- ============================================
-- 1. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL COMMENT 'string, number, boolean, json',
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL COMMENT 'general, email, storage, security, backup, etc.',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_unique` (`key`),
  KEY `system_settings_category_index` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings
INSERT INTO `system_settings` (`key`, `value`, `type`, `description`, `category`, `created_at`, `updated_at`) VALUES
('app.name', 'CLASS', 'string', 'Nama aplikasi', 'general', NOW(), NOW()),
('app.version', '1.0.0', 'string', 'Versi aplikasi', 'general', NOW(), NOW()),
('backup.auto_backup', 'false', 'boolean', 'Auto backup aktif', 'backup', NOW(), NOW()),
('backup.retention_days', '30', 'number', 'Hari retensi backup', 'backup', NOW(), NOW()),
('email.smtp_host', '', 'string', 'SMTP Host', 'email', NOW(), NOW()),
('email.smtp_port', '587', 'number', 'SMTP Port', 'email', NOW(), NOW()),
('storage.max_upload_size', '10485760', 'number', 'Maksimal ukuran upload (bytes)', 'storage', NOW(), NOW());

-- ============================================
-- 2. BACKUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `backups` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('full','database','files','tenant') NOT NULL DEFAULT 'full',
  `status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL COMMENT 'in bytes',
  `tenant_id` int(11) DEFAULT NULL COMMENT 'null untuk backup global',
  `description` text DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backups_tenant_id_status_index` (`tenant_id`,`status`),
  KEY `backups_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TENANT FEATURES TABLE (jika belum ada)
-- ============================================
CREATE TABLE IF NOT EXISTS `tenant_features` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `feature_key` varchar(100) NOT NULL,
  `feature_name` varchar(255) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `settings` json DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_features_tenant_id_feature_key_index` (`tenant_id`,`feature_key`),
  KEY `tenant_features_tenant_id_is_enabled_index` (`tenant_id`,`is_enabled`),
  CONSTRAINT `tenant_features_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TENANT MODULES TABLE (jika belum ada)
-- ============================================
CREATE TABLE IF NOT EXISTS `tenant_modules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `module_key` varchar(100) NOT NULL,
  `module_name` varchar(255) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `permissions` json DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_modules_tenant_id_module_key_index` (`tenant_id`,`module_key`),
  KEY `tenant_modules_tenant_id_is_enabled_index` (`tenant_id`,`is_enabled`),
  CONSTRAINT `tenant_modules_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. SUBSCRIPTION PLANS TABLE (jika belum ada)
-- ============================================
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `min_students` int(11) NOT NULL DEFAULT 0,
  `max_students` int(11) DEFAULT NULL COMMENT 'null untuk unlimited',
  `price_per_student_per_year` decimal(10,2) NOT NULL DEFAULT 0.00,
  `billing_threshold` int(11) NOT NULL DEFAULT 0 COMMENT 'Threshold untuk tagihan tambahan',
  `is_free` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `features` json DEFAULT NULL COMMENT 'Fitur yang tersedia di plan ini',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_plans_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default subscription plans
INSERT INTO `subscription_plans` (`name`, `slug`, `description`, `min_students`, `max_students`, `price_per_student_per_year`, `billing_threshold`, `is_free`, `is_active`, `sort_order`, `features`, `created_at`, `updated_at`) VALUES
('Basic', 'basic', 'Paket dasar untuk sekolah kecil', 0, 100, 50000.00, 10, 0, 1, 1, '["basic_features"]', NOW(), NOW()),
('Pro', 'pro', 'Paket profesional untuk sekolah menengah', 100, 500, 45000.00, 20, 0, 1, 2, '["basic_features", "advanced_features", "reports"]', NOW(), NOW()),
('Enterprise', 'enterprise', 'Paket enterprise untuk sekolah besar', 500, NULL, 40000.00, 50, 0, 1, 3, '["basic_features", "advanced_features", "reports", "api_access", "priority_support"]', NOW(), NOW());

-- ============================================
-- 6. TENANT SUBSCRIPTIONS TABLE (jika belum ada)
-- ============================================
CREATE TABLE IF NOT EXISTS `tenant_subscriptions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `subscription_plan_id` bigint(20) unsigned NOT NULL,
  `student_count_at_billing` int(11) NOT NULL DEFAULT 0 COMMENT 'Jumlah siswa saat billing terakhir',
  `current_student_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Jumlah siswa saat ini',
  `pending_student_increase` int(11) NOT NULL DEFAULT 0 COMMENT 'Penambahan siswa yang belum ditagih',
  `current_billing_amount` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Biaya tahun ini',
  `next_billing_amount` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Biaya tahun depan (termasuk pending)',
  `billing_cycle` enum('yearly','monthly') NOT NULL DEFAULT 'yearly',
  `status` enum('active','expired','suspended','cancelled') NOT NULL DEFAULT 'active',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `next_billing_date` date DEFAULT NULL,
  `last_billing_date` date DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `paid_at` date DEFAULT NULL,
  `payment_notes` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_subscriptions_tenant_id_status_index` (`tenant_id`,`status`),
  KEY `tenant_subscriptions_next_billing_date_index` (`next_billing_date`),
  CONSTRAINT `tenant_subscriptions_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_subscriptions_subscription_plan_id_foreign` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. SUBSCRIPTION BILLING HISTORY TABLE (jika belum ada)
-- ============================================
CREATE TABLE IF NOT EXISTS `subscription_billing_history` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_subscription_id` bigint(20) unsigned NOT NULL,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `student_count` int(11) NOT NULL,
  `previous_student_count` int(11) DEFAULT NULL,
  `billing_amount` decimal(12,2) NOT NULL,
  `previous_billing_amount` decimal(12,2) DEFAULT NULL,
  `billing_type` enum('initial','renewal','adjustment','threshold_met') NOT NULL DEFAULT 'renewal',
  `pending_increase_before` int(11) NOT NULL DEFAULT 0,
  `pending_increase_after` int(11) NOT NULL DEFAULT 0,
  `threshold_triggered` tinyint(1) NOT NULL DEFAULT 0,
  `billing_date` date NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `paid_at` date DEFAULT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `payment_notes` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscription_billing_history_tenant_id_billing_date_index` (`tenant_id`,`billing_date`),
  KEY `subscription_billing_history_invoice_number_index` (`invoice_number`),
  CONSTRAINT `subscription_billing_history_tenant_subscription_id_foreign` FOREIGN KEY (`tenant_subscription_id`) REFERENCES `tenant_subscriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscription_billing_history_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. INFRASTRUCTURE TABLES (LANDS, BUILDINGS, ROOMS)
-- ============================================
CREATE TABLE IF NOT EXISTS `lands` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `instansiId` bigint(20) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `areaM2` decimal(12,2) NOT NULL,
  `ownershipStatus` enum('milik_sendiri','sewa','hibah','lainnya') NOT NULL,
  `ownershipDocumentPath` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lands_instansiId_index` (`instansiId`),
  CONSTRAINT `lands_instansiId_foreign` FOREIGN KEY (`instansiId`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `buildings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `instansiId` bigint(20) unsigned NOT NULL,
  `landId` bigint(20) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `floorCount` int(11) NOT NULL,
  `lengthM` decimal(10,2) NOT NULL,
  `widthM` decimal(10,2) NOT NULL,
  `builtYear` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `buildings_instansiId_index` (`instansiId`),
  KEY `buildings_landId_index` (`landId`),
  CONSTRAINT `buildings_instansiId_foreign` FOREIGN KEY (`instansiId`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `buildings_landId_foreign` FOREIGN KEY (`landId`) REFERENCES `lands` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `instansiId` bigint(20) unsigned NOT NULL,
  `buildingId` bigint(20) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `usageType` enum('ruang_kelas','kantor','laboratorium','perpustakaan','gudang','aula','lainnya') NOT NULL,
  `areaM2` decimal(10,2) NOT NULL,
  `condition` enum('baik','rusak_ringan','rusak_sedang','rusak_berat','rusak_total') NOT NULL,
  `floorNumber` int(11) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rooms_instansiId_index` (`instansiId`),
  KEY `rooms_buildingId_index` (`buildingId`),
  CONSTRAINT `rooms_instansiId_foreign` FOREIGN KEY (`instansiId`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rooms_buildingId_foreign` FOREIGN KEY (`buildingId`) REFERENCES `buildings` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

