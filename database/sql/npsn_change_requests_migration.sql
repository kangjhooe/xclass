-- Migration SQL untuk NPSN Change Requests
-- Sistem approval perubahan NPSN tenant
-- Tanggal: 28 Januari 2025

-- ============================================
-- NPSN CHANGE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `npsn_change_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `current_npsn` varchar(255) NOT NULL,
  `requested_npsn` varchar(255) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `requested_by_id` int(11) DEFAULT NULL,
  `reviewed_by_id` int(11) DEFAULT NULL,
  `review_note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `npsn_change_requests_tenant_id_index` (`tenant_id`),
  KEY `npsn_change_requests_status_index` (`status`),
  KEY `npsn_change_requests_requested_by_id_index` (`requested_by_id`),
  KEY `npsn_change_requests_reviewed_by_id_index` (`reviewed_by_id`),
  KEY `npsn_change_requests_created_at_index` (`created_at`),
  CONSTRAINT `npsn_change_requests_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `npsn_change_requests_requested_by_id_foreign` FOREIGN KEY (`requested_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `npsn_change_requests_reviewed_by_id_foreign` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

