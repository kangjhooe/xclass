-- Migration untuk tabel position_modules
-- Tabel ini digunakan untuk mapping jabatan (position) ke modul yang bisa diakses

CREATE TABLE IF NOT EXISTS `position_modules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `position_id` bigint(20) unsigned NOT NULL,
  `module_key` varchar(100) NOT NULL,
  `module_name` varchar(255) NOT NULL,
  `can_view` tinyint(1) NOT NULL DEFAULT 1,
  `can_create` tinyint(1) NOT NULL DEFAULT 0,
  `can_update` tinyint(1) NOT NULL DEFAULT 0,
  `can_delete` tinyint(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `position_modules_position_id_module_key_unique` (`position_id`, `module_key`),
  KEY `position_modules_position_id_index` (`position_id`),
  KEY `position_modules_module_key_index` (`module_key`),
  KEY `position_modules_is_active_index` (`is_active`),
  CONSTRAINT `position_modules_position_id_foreign` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tambahkan kolom position_id ke tabel teachers jika belum ada
ALTER TABLE `teachers` 
ADD COLUMN IF NOT EXISTS `position_id` bigint(20) unsigned DEFAULT NULL AFTER `instansi_id`,
ADD KEY IF NOT EXISTS `teachers_position_id_index` (`position_id`),
ADD CONSTRAINT IF NOT EXISTS `teachers_position_id_foreign` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL;

-- Contoh data untuk testing (optional, bisa dihapus jika tidak diperlukan)
-- Pastikan position dengan id tersebut sudah ada di tabel positions
-- INSERT INTO `position_modules` (`position_id`, `module_key`, `module_name`, `can_view`, `can_create`, `can_update`, `can_delete`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
-- (1, 'counseling', 'Konseling', 1, 1, 1, 1, 'Modul konseling untuk Guru BK', 1, NOW(), NOW()),
-- (1, 'discipline', 'Kedisiplinan', 1, 1, 1, 1, 'Modul kedisiplinan untuk Guru BK', 1, NOW(), NOW()),
-- (2, 'finance', 'Keuangan', 1, 1, 1, 1, 'Modul keuangan untuk Bendahara', 1, NOW(), NOW()),
-- (2, 'spp', 'SPP', 1, 1, 1, 1, 'Modul SPP untuk Bendahara', 1, NOW(), NOW()),
-- (3, 'correspondence', 'Persuratan', 1, 1, 1, 0, 'Modul persuratan untuk Staff', 1, NOW(), NOW());

