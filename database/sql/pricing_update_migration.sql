-- ============================================
-- MIGRATION: PRICING UPDATE - BILLING THRESHOLD & PRICING LOCK
-- Tanggal: 27 Januari 2025
-- ============================================

-- 1. ADD lockedPricePerStudent FIELD TO tenant_subscriptions
-- ============================================
-- Check if column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'tenant_subscriptions';
SET @columnname = 'locked_price_per_student';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` DECIMAL(10,2) NULL DEFAULT NULL COMMENT ''Harga locked per siswa saat subscription dibuat (untuk pricing lock)'' AFTER `next_billing_amount`')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Update existing subscriptions with locked price based on their current plan
UPDATE `tenant_subscriptions` ts
INNER JOIN `subscription_plans` sp ON ts.subscription_plan_id = sp.id
SET ts.locked_price_per_student = CASE
  WHEN ts.current_student_count >= 501 THEN 4000
  WHEN ts.current_student_count >= 50 THEN 5000
  ELSE sp.price_per_student_per_year
END
WHERE ts.locked_price_per_student IS NULL;

-- ============================================
-- 2. UPDATE SUBSCRIPTION PLANS WITH NEW PRICING
-- ============================================

-- Update or Insert Free Forever Plan (0-49 siswa)
INSERT INTO `subscription_plans` 
  (`name`, `slug`, `description`, `min_students`, `max_students`, `price_per_student_per_year`, `billing_threshold`, `is_free`, `is_active`, `sort_order`, `features`, `created_at`, `updated_at`) 
VALUES 
  ('Free Forever', 'free-forever', 'Paket gratis untuk sekolah kecil (0-49 siswa)', 0, 49, 0.00, 0, 1, 1, 1, 
   JSON_ARRAY('Semua fitur dasar', 'Tidak ada batas waktu', 'Support email'), 
   NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `name` = 'Free Forever',
  `description` = 'Paket gratis untuk sekolah kecil (0-49 siswa)',
  `min_students` = 0,
  `max_students` = 49,
  `price_per_student_per_year` = 0.00,
  `billing_threshold` = 0,
  `is_free` = 1,
  `is_active` = 1,
  `sort_order` = 1,
  `features` = JSON_ARRAY('Semua fitur dasar', 'Tidak ada batas waktu', 'Support email'),
  `updated_at` = NOW();

-- Update or Insert Standard Plan (51-500 siswa) - Rp 5.000/siswa
INSERT INTO `subscription_plans` 
  (`name`, `slug`, `description`, `min_students`, `max_students`, `price_per_student_per_year`, `billing_threshold`, `is_free`, `is_active`, `sort_order`, `features`, `created_at`, `updated_at`) 
VALUES 
  ('Standard', 'standard', 'Paket standar untuk sekolah menengah (51-500 siswa)', 51, 500, 5000.00, 20, 0, 1, 2, 
   JSON_ARRAY('Semua fitur dasar', 'Advanced reports', 'Email support', 'Trial 1 bulan gratis'), 
   NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `name` = 'Standard',
  `description` = 'Paket standar untuk sekolah menengah (51-500 siswa)',
  `min_students` = 51,
  `max_students` = 500,
  `price_per_student_per_year` = 5000.00,
  `billing_threshold` = 20,
  `is_free` = 0,
  `is_active` = 1,
  `sort_order` = 2,
  `features` = JSON_ARRAY('Semua fitur dasar', 'Advanced reports', 'Email support', 'Trial 1 bulan gratis'),
  `updated_at` = NOW();

-- Update or Insert Enterprise Plan (501+ siswa) - Rp 4.000/siswa
INSERT INTO `subscription_plans` 
  (`name`, `slug`, `description`, `min_students`, `max_students`, `price_per_student_per_year`, `billing_threshold`, `is_free`, `is_active`, `sort_order`, `features`, `created_at`, `updated_at`) 
VALUES 
  ('Enterprise', 'enterprise', 'Paket enterprise untuk sekolah besar (501+ siswa)', 501, NULL, 4000.00, 20, 0, 1, 3, 
   JSON_ARRAY('Semua fitur Standard', 'Priority support', 'Custom reports', 'Trial 1 bulan gratis'), 
   NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `name` = 'Enterprise',
  `description` = 'Paket enterprise untuk sekolah besar (501+ siswa)',
  `min_students` = 501,
  `max_students` = NULL,
  `price_per_student_per_year` = 4000.00,
  `billing_threshold` = 20,
  `is_free` = 0,
  `is_active` = 1,
  `sort_order` = 3,
  `features` = JSON_ARRAY('Semua fitur Standard', 'Priority support', 'Custom reports', 'Trial 1 bulan gratis'),
  `updated_at` = NOW();

-- Deactivate old plans (if any)
UPDATE `subscription_plans` 
SET `is_active` = 0 
WHERE `slug` NOT IN ('free-forever', 'standard', 'enterprise');

-- ============================================
-- 3. UPDATE EXISTING SUBSCRIPTIONS
-- ============================================

-- Auto-assign plan based on current student count for existing subscriptions
UPDATE `tenant_subscriptions` ts
SET 
  ts.subscription_plan_id = CASE
    WHEN ts.current_student_count < 50 THEN 
      (SELECT id FROM subscription_plans WHERE slug = 'free-forever' LIMIT 1)
    WHEN ts.current_student_count <= 500 THEN 
      (SELECT id FROM subscription_plans WHERE slug = 'standard' LIMIT 1)
    ELSE 
      (SELECT id FROM subscription_plans WHERE slug = 'enterprise' LIMIT 1)
  END,
  ts.locked_price_per_student = CASE
    WHEN ts.current_student_count >= 501 THEN 4000
    WHEN ts.current_student_count >= 50 THEN 5000
    ELSE 0
  END,
  ts.next_billing_amount = CASE
    WHEN ts.current_student_count < 50 THEN 0
    WHEN ts.current_student_count >= 501 THEN ts.current_student_count * 4000
    WHEN ts.current_student_count >= 50 THEN ts.current_student_count * 5000
    ELSE 0
  END
WHERE ts.status = 'active';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

